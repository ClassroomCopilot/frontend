import axiosInstance from '../../axiosConfig';
import { formatEmailForDatabase } from './neoDBService';
import { CCUserNodeProps, CCTeacherNodeProps, CCCalendarNodeProps, CCUserTeacherTimetableNodeProps } from '../../utils/tldraw/cc-base/cc-graph/cc-graph-types';
import { NavigationNode, NodeContext } from '../../types/navigation';
import { TLBinding, TLShapeId } from '@tldraw/tldraw';
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