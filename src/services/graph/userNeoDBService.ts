import { supabase } from '../../supabaseClient';
import axiosInstance from '../../axiosConfig';
import { CCUser } from '../../services/auth/authService';
import { SchoolNodeInterface, UserNodeInterface, CalendarNodeInterface, TeacherNodeInterface, StudentNodeInterface } from '../../utils/tldraw/graph/graph-shape-types';
import { logger } from '../../debugConfig';
import { storageService, StorageKeys } from '../auth/localStorageService';

// Dev configuration - only hardcoded value we need
const DEV_SCHOOL_UUID = 'kevlarai';

export function formatEmailForDatabase(email: string): string {
  // Convert to lowercase and replace special characters
  const sanitized = email.toLowerCase()
    .replace('@', 'at')
    .replace(/\./g, 'dot')
    .replace(/_/g, 'underscore')
    .replace(/-/g, 'dash');
    
  // Add prefix and ensure no consecutive dashes
  return `${sanitized}`;
}

async function fetchSchoolNode(schoolUuid: string): Promise<SchoolNodeInterface> {
  logger.debug('neo4j-service', '🔄 Fetching school node', { schoolUuid });
  
  try {
    const response = await axiosInstance.get(`/api/database/tools/get-school-node?school_uuid=${schoolUuid}`);
    
    if (response.data?.status === 'success' && response.data.school_node) {
      logger.info('neo4j-service', '✅ School node fetched successfully');
      return response.data.school_node;
    }
    
    throw new Error('Failed to fetch school node: ' + JSON.stringify(response.data));
  } catch (error) {
    logger.error('neo4j-service', '❌ Failed to fetch school node:', error);
    throw error;
  }
}

// Neo4j data in Supabase
export async function updateUserNeo4jDetails(userId: string, userNode: UserNodeInterface) {
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

export interface ProcessedUserNodes {
    privateUserNode: UserNodeInterface;
    connectedNodes: {
        calendar?: CalendarNodeInterface;
        teacher?: TeacherNodeInterface;
        student?: StudentNodeInterface;
    };
}

interface ConnectedNode {
    node_type: string;
    node_data: {
        __primarylabel__: string;
        [key: string]: unknown;
    };
}

interface NodeData {
    __primarylabel__: string;
    [key: string]: unknown;
}

export class UserNeoDBService {
    static async fetchUserNodesData(email: string): Promise<ProcessedUserNodes | null> {
        try {
            const formattedEmail = formatEmailForDatabase(email);
            const dbName = `cc.ccusers.${formattedEmail}`;
            const uniqueId = `User_${formattedEmail}`;
            
            logger.debug('neo4j-service', '🔄 Fetching user nodes data', { 
                email,
                formattedEmail,
                dbName,
                uniqueId 
            });

            const response = await axiosInstance.get('/api/database/tools/get-connected-nodes', {
                params: { unique_id: uniqueId, db_name: dbName }
            });
            
            if (response.data?.status === 'success' && response.data.main_node) {
                const mainNodeData = response.data.main_node.node_data;
                const processedNodes = this.processConnectedNodes(response.data.connected_nodes);
                
                return {
                    privateUserNode: mainNodeData,
                    connectedNodes: processedNodes
                };
            }
            
            return null;
        } catch (error) {
            logger.error('neo4j-service', '❌ Failed to fetch user nodes:', error);
            throw error;
        }
    }

    private static processConnectedNodes(nodes: ConnectedNode[]): ProcessedUserNodes['connectedNodes'] {
        const processedNodes: ProcessedUserNodes['connectedNodes'] = {};
        
        if (!nodes?.length) {
          return processedNodes;
        }

        nodes.forEach((node: ConnectedNode) => {
            logger.debug('neo4j-service', `📍 Processing ${node.node_type} node:`, node.node_data);

            switch (node.node_type) {
                case 'Calendar':
                    processedNodes.calendar = this.processCalendarNode(node.node_data);
                    break;
                case 'Teacher':
                    processedNodes.teacher = this.processTeacherNode(node.node_data);
                    break;
                case 'Student':
                    processedNodes.student = this.processStudentNode(node.node_data);
                    break;
                default:
                    logger.debug('neo4j-service', `⚠️ Unhandled node type: ${node.node_type}`);
            }
        });

        return processedNodes;
    }

    private static processCalendarNode(nodeData: NodeData): CalendarNodeInterface {
        // Create a base object with required fields from BaseNodeInterface
        const baseNode = {
            w: 0,
            h: 0,
            color: '',
            __primarylabel__: 'Calendar',
            unique_id: String(nodeData.unique_id || ''),
            path: String(nodeData.path || ''),
            created: String(nodeData.created || ''),
            merged: String(nodeData.merged || ''),
        };

        // Create the calendar node by spreading nodeData first, then adding missing required fields
        return {
            ...nodeData,
            ...baseNode,
            start_date: String(nodeData.start_date || ''),
            end_date: String(nodeData.end_date || ''),
            name: String(nodeData.name || ''),
        };
    }

    private static processTeacherNode(nodeData: NodeData): TeacherNodeInterface {
        // Create a base object with required fields from BaseNodeInterface
        const baseNode = {
            w: 0,
            h: 0,
            color: '',
            __primarylabel__: 'Teacher',
            unique_id: String(nodeData.unique_id || ''),
            path: String(nodeData.path || ''),
            created: String(nodeData.created || ''),
            merged: String(nodeData.merged || ''),
        };

        // Create the teacher node by spreading nodeData first, then adding missing required fields
        return {
            ...nodeData,
            ...baseNode,
            teacher_code: String(nodeData.teacher_code || ''),
            teacher_name_formal: String(nodeData.teacher_name_formal || ''),
            teacher_email: String(nodeData.teacher_email || ''),
            worker_db_name: String(nodeData.worker_db_name || ''),
        };
    }

    private static processStudentNode(nodeData: NodeData): StudentNodeInterface {
        // Create a base object with required fields from BaseNodeInterface
        const baseNode = {
            w: 0,
            h: 0,
            color: '',
            __primarylabel__: 'Student',
            unique_id: String(nodeData.unique_id || ''),
            path: String(nodeData.path || ''),
            created: String(nodeData.created || ''),
            merged: String(nodeData.merged || ''),
        };

        // Create the student node by spreading nodeData first, then adding missing required fields
        return {
            ...nodeData,
            ...baseNode,
            student_code: String(nodeData.student_code || ''),
            student_name_formal: String(nodeData.student_name_formal || ''),
            student_email: String(nodeData.student_email || ''),
            worker_db_name: String(nodeData.worker_db_name || ''),
        };
    }

    static async registerNeo4JUser(
        user: CCUser, 
        username: string, 
        role: string, 
    ): Promise<UserNodeInterface> {
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
}