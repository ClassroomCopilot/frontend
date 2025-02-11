import { supabase } from '../../supabaseClient';
import axiosInstance from '../../axiosConfig';
import { CCUser } from '../../services/auth/authService';
import { formatEmailForDatabase } from './neoDBService';
import { fetchSchoolNode } from './schoolNeoDBService';
import { storageService, StorageKeys } from '../auth/localStorageService';
import { CCUserNodeProps, CCTeacherNodeProps, CCCalendarNodeProps, CCUserTeacherTimetableNodeProps } from '../../utils/tldraw/cc-base/cc-graph/cc-graph-types';
import { NavigationNode, StaticNavigationNode, BaseContext, NodeContext } from '../../types/navigation';
import { TLEditorSnapshot, TLBinding, TLShapeId } from '@tldraw/tldraw';
import { localStoreService } from '../tldraw/localStoreService';
import { LoadingState } from '../tldraw/snapshotService';
import { logger } from '../../debugConfig';
import { useNavigationStore } from '../../stores/navigationStore';

// Dev configuration - only hardcoded value we need
const DEV_SCHOOL_UUID = 'kevlarai';

interface ShapeState {
    parentId: TLShapeId | null;
    isPageChild: boolean | null;
    hasChildren: boolean | null;
    bindings: TLBinding[] | null;
}

interface NodeResponse {
    status: string;
    nodes: {
        userNode: CCUserNodeProps;
        calendarNode: CCCalendarNodeProps;
        teacherNode: CCTeacherNodeProps;
        timetableNode: CCUserTeacherTimetableNodeProps;
    };
}

interface NodeDataResponse {
    __primarylabel__: string;
    unique_id: string;
    path: string;
    created: string;
    merged: string;
    state: ShapeState | null;
    defaultComponent: boolean | null;
    user_name?: string;
    user_email?: string;
    user_type?: string;
    user_id?: string;
    worker_node_data?: string;
    [key: string]: string | number | boolean | null | ShapeState | undefined;
}

interface DefaultNodeResponse {
    status: string;
    node: {
    id: string;
        path: string;
    type: string;
    label: string;
        data: NodeDataResponse;
    };
}

export interface ProcessedUserNodes {
    privateUserNode: CCUserNodeProps;
    connectedNodes: {
        calendar?: CCCalendarNodeProps;
        teacher?: CCTeacherNodeProps;
        timetable?: CCUserTeacherTimetableNodeProps;
    };
}

// Neo4j data in Supabase
export async function updateUserNeo4jDetails(userId: string, userNode: CCUserNodeProps) {
  const { error } = await supabase
    .from('user_profiles')
    .update({ 
      neo4j_user_node: userNode,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId);

  if (error) {
    logger.error('neo4j-service', '❌ Failed to update Neo4j details:', error);
    throw error;
  }
}

export interface CalendarStructureResponse {
  status: string;
  data: {
    currentDay: string;
    days: Record<string, {
      id: string;
      date: string;
      title: string;
    }>;
    weeks: Record<string, {
      id: string;
      title: string;
      days: { id: string }[];
      startDate: string;
      endDate: string;
    }>;
    months: Record<string, {
      id: string;
      title: string;
      days: { id: string }[];
      weeks: { id: string }[];
      year: string;
      month: string;
    }>;
    years: {
      id: string;
      title: string;
      months: { id: string }[];
      year: string;
    }[];
  };
}

export interface WorkerStructureResponse {
  status: string;
  data: {
    timetables: Record<string, Array<{
      id: string;
      title: string;
      type: string;
      startTime: string;
      endTime: string;
    }>>;
    classes: Record<string, Array<{
      id: string;
      title: string;
      type: string;
    }>>;
    lessons: Record<string, Array<{
      id: string;
      title: string;
      type: string;
    }>>;
    journals: Record<string, Array<{
      id: string;
      title: string;
    }>>;
    planners: Record<string, Array<{
      id: string;
      title: string;
    }>>;
  };
}

export class UserNeoDBService {
    static async fetchUserNodesData(
        email: string,
        userDbName?: string,
        workerDbName?: string
    ): Promise<ProcessedUserNodes | null> {
        try {
            if (!userDbName) {
                logger.error('neo4j-service', '❌ Attempted to fetch nodes without database name');
                return null;
            }

            const formattedEmail = formatEmailForDatabase(email);
            const uniqueId = `User_${formattedEmail}`;
            
            logger.debug('neo4j-service', '🔄 Fetching user nodes data', { 
                email,
                formattedEmail,
                userDbName,
                workerDbName,
                uniqueId 
            });

            // First get the user node from profile context
            const userNode = await this.getDefaultNode('profile', userDbName);
            if (!userNode || !userNode.data) {
                throw new Error('Failed to fetch user node or node data missing');
            }

            logger.debug('neo4j-service', '✅ Found user node', {
                nodeId: userNode.id,
                type: userNode.type,
                hasData: !!userNode.data,
                userDbName,
                workerDbName
            });

            // Initialize result structure
            const processedNodes: ProcessedUserNodes = {
                privateUserNode: {
                    ...userNode.data,
                    __primarylabel__: 'User' as const,
                    title: userNode.data.user_email || 'User',
                    w: 200,
                    h: 200,
                    headerColor: '#3e6589',
                    backgroundColor: '#f0f0f0',
                    isLocked: false
                } as CCUserNodeProps,
                connectedNodes: {}
            };

            try {
                // Get calendar node from calendar context
                const calendarNode = await this.getDefaultNode('calendar', userDbName);
                if (calendarNode?.data) {
                    processedNodes.connectedNodes.calendar = {
                        ...calendarNode.data,
                        __primarylabel__: 'Calendar' as const,
                        title: calendarNode.data.calendar_name || 'Calendar',
                        w: 200,
                        h: 200,
                        headerColor: '#3e6589',
                        backgroundColor: '#f0f0f0',
                        isLocked: false
                    } as CCCalendarNodeProps;
                    logger.debug('neo4j-service', '✅ Found calendar node', {
                        nodeId: calendarNode.id,
                        path: calendarNode.data.path
                    });
                } else {
                    logger.debug('neo4j-service', 'ℹ️ No calendar node found');
                }
            } catch (error) {
                logger.warn('neo4j-service', '⚠️ Failed to fetch calendar node:', error);
                // Continue without calendar node
            }

            // Get teacher node from teaching context if worker database is available
            if (workerDbName) {
                try {
                    const teacherNode = await this.getDefaultNode('teaching', userDbName);
                    if (teacherNode?.data) {
                        processedNodes.connectedNodes.teacher = {
                            ...teacherNode.data,
                            __primarylabel__: 'Teacher' as const,
                            title: teacherNode.data.teacher_name_formal || 'Teacher',
                            w: 200,
                            h: 200,
                            headerColor: '#3e6589',
                            backgroundColor: '#f0f0f0',
                            isLocked: false,
                            user_db_name: userDbName,
                            worker_db_name: workerDbName
                        } as CCTeacherNodeProps;
                        logger.debug('neo4j-service', '✅ Found teacher node', {
                            nodeId: teacherNode.id,
                            path: teacherNode.data.path,
                            userDbName,
                            workerDbName
                        });
                    } else {
                        logger.debug('neo4j-service', 'ℹ️ No teacher node found');
                    }
                } catch (error) {
                    logger.warn('neo4j-service', '⚠️ Failed to fetch teacher node:', error);
                    // Continue without teacher node
                }
            }

            logger.debug('neo4j-service', '✅ Processed all user nodes', {
                hasUserNode: !!processedNodes.privateUserNode,
                hasCalendar: !!processedNodes.connectedNodes.calendar,
                hasTeacher: !!processedNodes.connectedNodes.teacher,
                teacherData: processedNodes.connectedNodes.teacher ? {
                    unique_id: processedNodes.connectedNodes.teacher.unique_id,
                    worker_db_name: processedNodes.connectedNodes.teacher.worker_db_name,
                    path: processedNodes.connectedNodes.teacher.path
                } : null
            });

            return processedNodes;
        } catch (error: unknown) {
            if (error instanceof Error) {
                logger.error('neo4j-service', '❌ Failed to fetch user nodes:', error.message);
            } else {
                logger.error('neo4j-service', '❌ Failed to fetch user nodes:', String(error));
            }
            throw error;
        }
    }

    private static async fetchUserContextNodes(dbName: string) {
        try {
            // Fetch all required nodes for user context
            const response = await axiosInstance.get<{
                status: string;
                nodes: {
                    userNode: CCUserNodeProps;
                    calendarNode: CCCalendarNodeProps;
                    teacherNode: CCTeacherNodeProps;
                    timetableNode: CCUserTeacherTimetableNodeProps;
                };
            }>('/api/database/tools/get-user-context-nodes', {
                params: { db_name: dbName }
            });

            if (response.data?.status === 'success' && response.data.nodes) {
                return response.data.nodes;
            }

            return null;
        } catch (error) {
            logger.error('neo4j-service', '❌ Failed to fetch user context nodes:', error);
            throw error;
        }
    }

    static async registerNeo4JUser(
        user: CCUser, 
        username: string, 
        role: string, 
    ): Promise<CCUserNodeProps> {
        try {
            // For teachers and students, fetch school node first
            let schoolNode = null;
            if (role.includes('teacher') || role.includes('student')) {
                schoolNode = await fetchSchoolNode(DEV_SCHOOL_UUID);
                if (!schoolNode) {
                    throw new Error('Failed to fetch required school node');
                }
            }

            // Create FormData with proper headers
            const formData = new FormData();
            
            // Required fields that are missing according to error
            formData.append('user_id', user.id);
            formData.append('user_type', role);
            formData.append('user_name', username);
            formData.append('user_email', user.email || '');

            // Add school data if we have a school node
            if (schoolNode) {
                formData.append('school_uuid', schoolNode.school_uuid);
                formData.append('school_name', schoolNode.school_name);
                formData.append('school_website', schoolNode.school_website);
                formData.append('school_path', schoolNode.path);

                // Add worker data based on role
                const workerData = role.includes('teacher') ? {
                    teacher_code: username,
                    teacher_name_formal: username,
                    teacher_email: user.email,
                } : {
                    student_code: username,
                    student_name_formal: username,
                    student_email: user.email,
                };
                
                formData.append('worker_data', JSON.stringify(workerData));
            }

            // Debug log the form data
            logger.debug('neo4j-service', '🔄 Sending form data', {
                userId: user.id,
                userType: role,
                userName: username,
                userEmail: user.email,
                schoolNode: schoolNode ? {
                    uuid: schoolNode.school_uuid,
                    name: schoolNode.school_name
                } : null
            });

            const response = await axiosInstance.post('/api/database/entity/create-user', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.data.status !== 'success') {
                throw new Error(`Failed to create user: ${JSON.stringify(response.data)}`);
            }

            const userNode = response.data.data.user_node;
            const workerNode = response.data.data.worker_node;
            
            // Store calendar data if needed
            if (response.data.data.calendar_nodes) {
                logger.debug('neo4j-service', '🔄 Storing calendar data', {
                    calendarNodes: response.data.data.calendar_nodes
                });
                storageService.set(StorageKeys.CALENDAR_DATA, response.data.data.calendar_nodes);
            }

            // Update user node with worker data
            userNode.worker_node_data = JSON.stringify(workerNode);
            
            await updateUserNeo4jDetails(user.id, userNode);

            logger.info('neo4j-service', '✅ Neo4j user registration successful', {
                userId: user.id,
                nodeId: userNode.unique_id,
                hasCalendar: !!response.data.data.calendar_nodes
            });

            return userNode;
        } catch (error) {
            logger.error('neo4j-service', '❌ Neo4j user registration failed', error);
            throw error;
        }
    }

    static async fetchUserNodeData(nodeId: string): Promise<{ node_type: string; node_data: NodeResponse['nodes']['userNode'] } | null> {
        try {
            // Get the formatted email from the nodeId (User_surfacedashdev3atkevlaraidotcom -> surfacedashdev3atkevlaraidotcom)
            const formattedEmail = nodeId.replace('User_', '');
            const dbName = `cc.ccusers.${formattedEmail}`;

            const response = await axiosInstance.get<{
                status: string;
                node: {
                    node_type: string;
                    node_data: NodeResponse['nodes']['userNode'];
                };
            }>('/api/database/tools/get-node', {
                params: { 
                    unique_id: nodeId,
                    db_name: dbName
                }
            });
            
            if (response.data?.status === 'success' && response.data.node) {
                return response.data.node;
            }
            
            return null;
        } catch (error) {
            logger.error('neo4j-service', '❌ Failed to fetch user node data:', error);
            throw error;
        }
    }

    static async fetchNodeData(nodeId: string, dbName: string): Promise<{ node_type: string; node_data: NodeResponse['nodes']['userNode'] } | null> {
        try {
            logger.debug('neo4j-service', '🔄 Fetching node data', { nodeId, dbName });

            const response = await axiosInstance.get<{
                status: string;
                node: {
                    node_type: string;
                    node_data: NodeResponse['nodes']['userNode'];
                };
            }>('/api/database/tools/get-node', {
                params: { 
                    unique_id: nodeId,
                    db_name: dbName
                }
            });
            
            if (response.data?.status === 'success' && response.data.node) {
                return response.data.node;
            }
            
            return null;
        } catch (error) {
            logger.error('neo4j-service', '❌ Failed to fetch node data:', error);
            throw error;
        }
    }

    static getNodeDatabaseName(node: NavigationNode): string {
        // If the node path starts with /node_filesystem/users/, it's in a user database
        if (node.path.startsWith('/node_filesystem/users/')) {
            const parts = node.path.split('/');
            // parts[3] should be the database name (e.g., cc.ccusers.surfacedashdev3atkevlaraidotcom)
            return parts[3];
        }
        // For school/worker nodes, extract from the path or use a default
        if (node.path.includes('/schools/')) {
            return `cc.ccschools.${DEV_SCHOOL_UUID}`;
        }
        // Default to user database if we can't determine
        return node.path.split('/')[3];
    }

    static async fetchConnectedNodes(nodeId: string, dbName: string, context?: BaseContext): Promise<NavigationNode[]> {
        try {
            // If dbName is not provided, determine it based on the node ID for user nodes
            let effectiveDbName = dbName;
            if (!effectiveDbName) {
                if (nodeId.startsWith('User_')) {
                    const formattedEmail = nodeId.replace('User_', '');
                    effectiveDbName = `cc.ccusers.${formattedEmail}`;
                } else {
                    throw new Error('Database name required for non-user nodes');
                }
            }

            logger.debug('neo4j-service', '🔄 Fetching connected nodes', { 
                nodeId,
                dbName: effectiveDbName,
                context
            });

            const response = await axiosInstance.get<{
                status: string;
                nodes: {
                    node_type: string;
                    node_data: {
                        unique_id: string;
                        path: string;
                        title?: string;
                        name?: string;
                        worker_db_name?: string;
                        [key: string]: string | number | boolean | null | ShapeState | undefined;
                    };
                }[];
            }>('/api/database/tools/get-connected-nodes', {
                params: { 
                    unique_id: nodeId,
                    db_name: effectiveDbName,
                    context
                }
            });
            
            if (response.data?.status === 'success' && response.data.nodes) {
                // Log raw response data for debugging
                logger.debug('neo4j-service', '📥 Raw connected nodes response', {
                    nodes: response.data.nodes.map(n => ({
                        type: n.node_type,
                        id: n.node_data.unique_id,
                        name: n.node_data.name,
                        worker_db_name: n.node_data.worker_db_name,
                        path: n.node_data.path
                    }))
                });

                // Process each connected node
                const connectedNodes = response.data.nodes.map(node => {
                    const processedNode: NavigationNode = {
                        id: node.node_data.unique_id,
                        path: node.node_data.path,
                        type: node.node_type,
                        label: node.node_data.name || node.node_data.title || node.node_data.unique_id,
                        data: {
                            ...node.node_data,
                            unique_id: node.node_data.unique_id,
                            path: node.node_data.path,
                            type: node.node_type
                        }
                    };

                    logger.debug('neo4j-service', '✅ Processed connected node', {
                        nodeId: processedNode.id,
                        type: processedNode.type,
                        label: processedNode.label,
                        hasData: !!node.node_data,
                        worker_db_name: node.node_data.worker_db_name,
                        path: node.node_data.path
                    });

                    return processedNode;
                });

                logger.debug('neo4j-service', '✅ Processed all connected nodes', {
                    count: connectedNodes.length,
                    types: connectedNodes.map(n => n.type),
                    hasTeacherNode: connectedNodes.some(n => n.type === 'Teacher'),
                    teacherNode: connectedNodes.find(n => n.type === 'Teacher')?.data
                });

                return connectedNodes;
            }
            
            return [];
        } catch (error) {
            logger.error('neo4j-service', '❌ Failed to fetch connected nodes:', error);
            throw error;
        }
    }

    static async loadNodeSnapshot(path: string): Promise<TLEditorSnapshot> {
        const dbName = this.getNodeDatabaseName({ path } as NavigationNode);
        const response = await axiosInstance.get(
            '/api/database/tldraw_fs/get_tldraw_node_file',
            {
                params: {
                    path: path,
                    db_name: dbName
                }
            }
        );

        if (response.data) {
            return response.data;
        }
        throw new Error('Failed to load node snapshot');
    }

    static async saveNodeSnapshot(path: string, snapshot: TLEditorSnapshot): Promise<void> {
        const dbName = this.getNodeDatabaseName({ path } as NavigationNode);
        const response = await axiosInstance.post(
            '/api/database/tldraw_fs/set_tldraw_node_file',
            snapshot,
            {
                params: {
                    path: path,
                    db_name: dbName
                }
            }
        );

        if (response.data.status !== 'success') {
            throw new Error('Failed to save node snapshot');
        }
    }

    static async loadSnapshotIntoStore(
        path: string, 
        setLoadingState: (state: LoadingState) => void
    ): Promise<void> {
        try {
            const snapshot = await this.loadNodeSnapshot(path);
            if (snapshot) {
                await localStoreService.loadSnapshot(snapshot, setLoadingState);
                logger.info('neo4j-service', '✅ Loaded snapshot into store', { path });
            } else {
                setLoadingState({ status: 'error', error: 'No snapshot found' });
            }
        } catch (error) {
            logger.error('neo4j-service', '❌ Failed to load snapshot into store:', error);
            setLoadingState({ 
                status: 'error', 
                error: error instanceof Error ? error.message : 'Failed to load snapshot' 
            });
        }
    }

    static async getStaticNodesForContext(context: BaseContext, dbName: string): Promise<StaticNavigationNode[]> {
        try {
            const response = await axiosInstance.get('/api/database/tools/get-static-nodes', {
                params: { context, db_name: dbName }
            });

            if (response.data?.status === 'success') {
                return response.data.nodes;
            }
            return [];
        } catch (error) {
            logger.error('neo4j-service', '❌ Failed to get static nodes:', error);
            return [];
        }
    }

    static async getTodayCalendarNode(dbName: string): Promise<NavigationNode | null> {
        try {
            const response = await axiosInstance.get('/api/database/calendar/get-today-node', {
                params: { db_name: dbName }
            });
            if (response.data?.status === 'success') {
                return response.data.node;
            }
            return null;
        } catch (error) {
            logger.error('neo4j-service', '❌ Failed to get today node:', error);
            return null;
        }
    }

    static async getRelativeCalendarNode(dayOffset: number, dbName: string): Promise<NavigationNode | null> {
        try {
            const response = await axiosInstance.get('/api/database/calendar/get-relative-node', {
                params: { dayOffset, db_name: dbName }
            });
            if (response.data?.status === 'success') {
                return response.data.node;
            }
            return null;
        } catch (error) {
            logger.error('neo4j-service', '❌ Failed to get relative node:', error);
            return null;
        }
    }

    static async getNextMonthNode(dbName: string): Promise<NavigationNode | null> {
        try {
            const response = await axiosInstance.get('/api/database/calendar/get-next-month-node', {
                params: { db_name: dbName }
            });
            if (response.data?.status === 'success') {
                return response.data.node;
            }
            return null;
        } catch (error) {
            logger.error('neo4j-service', '❌ Failed to get next month node:', error);
            return null;
        }
    }

    static async getPreviousMonthNode(dbName: string): Promise<NavigationNode | null> {
        try {
            const response = await axiosInstance.get('/api/database/calendar/get-previous-month-node', {
                params: { db_name: dbName }
            });
            if (response.data?.status === 'success') {
                return response.data.node;
            }
            return null;
        } catch (error) {
            logger.error('neo4j-service', '❌ Failed to get previous month node:', error);
            return null;
        }
    }

    static async getUserTimetables(dbName: string): Promise<NavigationNode[]> {
        try {
            const response = await axiosInstance.get('/api/database/timetable/get-user-timetables', {
                params: { db_name: dbName }
            });
            if (response.data?.status === 'success') {
                return response.data.timetables;
            }
            return [];
        } catch (error) {
            logger.error('neo4j-service', '❌ Failed to get user timetables:', error);
            return [];
        }
    }

    static async getTimetableClasses(timetableId: string, dbName: string): Promise<NavigationNode[]> {
        try {
            const response = await axiosInstance.get('/api/database/timetable/get-timetable-classes', {
                params: { timetable_id: timetableId, db_name: dbName }
            });
            if (response.data?.status === 'success') {
                return response.data.classes;
            }
            return [];
        } catch (error) {
            logger.error('neo4j-service', '❌ Failed to get timetable classes:', error);
            return [];
        }
    }

    static async getNextLessonNode(classId: string, dbName: string): Promise<NavigationNode | null> {
        try {
            const response = await axiosInstance.get('/api/database/timetable/get-next-lesson', {
                params: { class_id: classId, db_name: dbName }
            });
            if (response.data?.status === 'success') {
                return response.data.node;
            }
            return null;
        } catch (error) {
            logger.error('neo4j-service', '❌ Failed to get next lesson:', error);
            return null;
        }
    }

    static async getPreviousLessonNode(classId: string, dbName: string): Promise<NavigationNode | null> {
        try {
            const response = await axiosInstance.get('/api/database/timetable/get-previous-lesson', {
                params: { class_id: classId, db_name: dbName }
            });
            if (response.data?.status === 'success') {
                return response.data.node;
            }
            return null;
        } catch (error) {
            logger.error('neo4j-service', '❌ Failed to get previous lesson:', error);
            return null;
        }
    }

    static async saveSnapshotToSharedRoom(path: string, roomId: string): Promise<void> {
        try {
            const snapshot = await this.loadNodeSnapshot(path);
            const response = await axiosInstance.post('/api/database/tldraw_fs/save-shared-snapshot', {
                snapshot,
                roomId
            });
            
            if (response.data?.status !== 'success') {
                throw new Error('Failed to save shared snapshot');
            }
        } catch (error) {
            logger.error('neo4j-service', '❌ Failed to save shared snapshot:', error);
            throw error;
        }
    }

    static async getDefaultNode(context: NodeContext, dbName: string): Promise<NavigationNode | null> {
        try {
            logger.debug('neo4j-service', '🔄 Fetching default node', { context, dbName });
            
            // For overview context, we need to extract the base context from the current navigation state
            const params: Record<string, string> = { db_name: dbName };
            if (context === 'overview') {
                // Get the current base context from the navigation store
                const navigationStore = useNavigationStore.getState();
                params.base_context = navigationStore.context.base;
            }
            
            const response = await axiosInstance.get<DefaultNodeResponse>(
                `/api/database/tools/get-default-node/${context}`,
                { params }
            );
            
            if (response.data?.status === 'success' && response.data.node) {
                return {
                    id: response.data.node.id,
                    path: response.data.node.path,
                    type: response.data.node.type,
                    label: response.data.node.label,
                    data: response.data.node.data
                };
            }
            
            return null;
        } catch (error) {
            logger.error('neo4j-service', '❌ Failed to fetch default node:', error);
            throw error;
        }
    }

    static async fetchCalendarStructure(dbName: string): Promise<CalendarStructureResponse['data']> {
        try {
            logger.debug('navigation', '🔄 Fetching calendar structure', { dbName });
            
            const response = await axiosInstance.get<CalendarStructureResponse>(
                `/api/database/calendar-structure/get-calendar-structure?db_name=${dbName}`
            );

            if (response.data.status === 'success') {
                logger.info('navigation', '✅ Calendar structure fetched successfully');
                return response.data.data;
            }

            throw new Error('Failed to fetch calendar structure');
        } catch (error) {
            logger.error('navigation', '❌ Failed to fetch calendar structure:', error);
            throw error;
        }
    }

    static async fetchWorkerStructure(dbName: string): Promise<WorkerStructureResponse['data']> {
        try {
            logger.debug('navigation', '🔄 Fetching worker structure', { dbName });
            
            const response = await axiosInstance.get<WorkerStructureResponse>(
                `/api/database/worker-structure/get-worker-structure?db_name=${dbName}`
            );

            if (response.data.status === 'success') {
                logger.info('navigation', '✅ Worker structure fetched successfully');
                return response.data.data;
            }

            throw new Error('Failed to fetch worker structure');
        } catch (error) {
            logger.error('navigation', '❌ Failed to fetch worker structure:', error);
            throw error;
        }
    }
}