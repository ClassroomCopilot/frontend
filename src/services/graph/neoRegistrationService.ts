import { CCUser } from '../auth/authService';
import { CCUserNodeProps } from '../../utils/tldraw/cc-base/cc-graph/cc-graph-types';
import { fetchSchoolNode } from './schoolNeoDBService';
import { storageService, StorageKeys } from '../auth/localStorageService';
import { updateUserNeo4jDetails } from './userNeoDBService';
import axiosInstance from '../../axiosConfig';
import { logger } from '../../debugConfig';

// Dev configuration - only hardcoded value we need
const DEV_SCHOOL_UUID = 'kevlarai';

const NEO4J_SERVICE = 'neo4j-service' as const;

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
                schoolNode = await fetchSchoolNode(DEV_SCHOOL_UUID);
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
            logger.debug(NEO4J_SERVICE, '🔄 Sending form data', {
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
                logger.debug(NEO4J_SERVICE, '🔄 Storing calendar data', {
                    calendarNodes: response.data.data.calendar_nodes
                });
                storageService.set(StorageKeys.CALENDAR_DATA, response.data.data.calendar_nodes);
            }

            // Update user node with worker data
            userNode.worker_node_data = JSON.stringify(workerNode);
            
            await updateUserNeo4jDetails(user.id, userNode);

            logger.info(NEO4J_SERVICE, '✅ Neo4j user registration successful', {
                userId: user.id,
                nodeId: userNode.unique_id,
                hasCalendar: !!response.data.data.calendar_nodes
            });

            return userNode;
        } catch (error) {
            logger.error(NEO4J_SERVICE, '❌ Neo4j user registration failed', error);
            throw error;
        }
    }
}

export const neoRegistrationService = NeoRegistrationService.getInstance();
