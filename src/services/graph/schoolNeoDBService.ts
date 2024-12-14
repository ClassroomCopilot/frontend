import { SchoolNodeInterface } from '../../types/neo4j/nodes';
import { logger } from '../../debugConfig';
import axiosInstance from '../../axiosConfig';

export class SchoolNeoDBService {
    static async fetchSchoolNode(schoolUuid: string): Promise<SchoolNodeInterface | null> {
        try {
            const response = await axiosInstance.get(
                `/api/database/tools/get-school-node?school_uuid=${schoolUuid}`
            );
            
            if (response.data?.status === 'success' && response.data.school_node) {
                return response.data.school_node;
            }
            
            return null;
        } catch (error) {
            logger.error('neo4j-service', '❌ Failed to fetch school node:', error);
            throw error;
        }
    }

    // ... other school-related Neo4j operations ...
}
