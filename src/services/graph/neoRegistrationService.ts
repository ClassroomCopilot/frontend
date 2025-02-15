import { supabase } from '../../supabaseClient';
import { CCUser } from '../auth/authService';
import { CCSchoolNodeProps, CCUserNodeProps } from '../../utils/tldraw/cc-base/cc-graph/cc-graph-types';
import { storageService, StorageKeys } from '../auth/localStorageService';
import axiosInstance from '../../axiosConfig';
import { logger } from '../../debugConfig';

// Dev configuration - only hardcoded value we need
const DEV_SCHOOL_UUID = 'kevlarai';

class NeoRegistrationService {
    private static instance: NeoRegistrationService;

    private constructor() {}

    static getInstance(): NeoRegistrationService {
        if (!NeoRegistrationService.instance) {
            NeoRegistrationService.instance = new NeoRegistrationService();
        }
        return NeoRegistrationService.instance;
    }

    async registerNeo4JUser(
        user: CCUser, 
        username: string, 
        role: string
    ): Promise<CCUserNodeProps> {
        try {
            // For teachers and students, fetch school node first
            let schoolNode = null;
            if (role.includes('teacher') || role.includes('student')) {
                schoolNode = await this.fetchSchoolNode(DEV_SCHOOL_UUID);
                if (!schoolNode) {
                    throw new Error('Failed to fetch required school node');
                }
            }

            // Create FormData with proper headers
            const formData = new FormData();
            
            // Required fields
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
            
            await this.updateUserNeo4jDetails(user.id, userNode);

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

    async updateUserNeo4jDetails(userId: string, userNode: CCUserNodeProps) {
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
    
    async fetchSchoolNode(schoolUuid: string): Promise<CCSchoolNodeProps> {
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
}

export const neoRegistrationService = NeoRegistrationService.getInstance();
