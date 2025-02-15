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

    static async getSchoolNode(schoolDbName: string): Promise<CCSchoolNodeProps | null> {
        logger.debug('school-service', '🔄 Fetching school node', { schoolDbName });
        
        try {
            const response = await axiosInstance.get(`/api/database/tools/get-default-node/school?db_name=${schoolDbName}`);
            
            if (response.data?.status === 'success' && response.data.node) {
                logger.info('school-service', '✅ School node fetched successfully');
                return response.data.node;
            }
            
            logger.warn('school-service', '⚠️ No school node found');
            return null;
        } catch (error) {
            if (error instanceof AxiosError && error.response?.status === 404) {
                logger.warn('school-service', '⚠️ School node not found (404)', { schoolDbName });
                return null;
            }
            logger.error('school-service', '❌ Failed to fetch school node:', error);
            throw error;
        }
    }
}