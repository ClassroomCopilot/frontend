import axios from '../../axiosConfig';
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
            const response = await axios.post(
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
