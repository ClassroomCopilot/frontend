import axiosInstance from '../../axiosConfig';
import { CCSchoolNodeProps } from '../../utils/tldraw/cc-base/cc-graph/cc-graph-types';
import { logger } from '../../debugConfig';
import { AxiosError } from 'axios';

interface CreateSchoolResponse {
    status: string;
    message: string;
}

export class SchoolNeoDBService {
    static async createSchools(
    ): Promise<CreateSchoolResponse> {
        logger.warn('school-service', '📤 Creating schools using default config.yaml');

        try {
            const response = await axiosInstance.post(
                '/api/database/entity/create-schools',
                {},
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.data.status === 'success' || response.data.status === 'Accepted') {
                logger.info('school-service', '✅ Schools successfully');
                return {
                    status: 'success',
                    message: 'Schools created successfully'
                };
            }

            throw new Error(response.data.message || 'Creation failed');
        } catch (err: unknown) {
            const error = err as AxiosError;
            logger.error('school-service', '❌ Failed to create school', { 
                error: error.message,
                details: error.response?.data
            });
            throw error;
        }
    }
}

export async function fetchSchoolNode(schoolUuid: string): Promise<CCSchoolNodeProps> {
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