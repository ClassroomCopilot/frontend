import axios from '../../axiosConfig';
import { CCTeacherNodeProps } from '../../utils/tldraw/cc-base/cc-graph/cc-graph-types';
import { logger } from '../../debugConfig';
import { AxiosError } from 'axios';

interface UploadTimetableResponse {
    status: string;
    message: string;
}

interface UploadResult {
    success: boolean;
    message: string;
}

export interface TeacherTimetableEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  extendedProps: {
    subjectClass: string;
    color: string;
    periodCode: string;
    path?: string;
  };
}

export class TimetableNeoDBService {
    static async uploadWorkerTimetable(
        file: File, 
        workerNode: CCTeacherNodeProps
    ): Promise<UploadTimetableResponse> {
        logger.debug('timetable-service', '📤 Uploading timetable', {
            fileName: file.name,
            workerDbName: workerNode.worker_db_name,
            teacherCode: workerNode.teacher_code
        });

        const formData = new FormData();
        formData.append('file', file);
        formData.append('worker_node', JSON.stringify({
            unique_id: workerNode.unique_id,
            teacher_code: workerNode.teacher_code,
            teacher_name_formal: workerNode.teacher_name_formal,
            teacher_email: workerNode.teacher_email,
            path: workerNode.path,
            worker_db_name: workerNode.worker_db_name
        }));

        try {
            const response = await axios.post(
                '/api/database/timetables/upload-worker-timetable',
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            if (response.data.status === 'success' || response.data.status === 'Accepted') {
                logger.info('timetable-service', '✅ Timetable upload successful');
                return {
                    status: 'success',
                    message: 'Timetable uploaded successfully'
                };
            }

            throw new Error(response.data.message || 'Upload failed');
        } catch (err: unknown) {
            const error = err as AxiosError;
            logger.error('timetable-service', '❌ Failed to upload timetable', { 
                error: error.message,
                details: error.response?.data
            });
            throw error;
        }
    }

    static async fetchTeacherTimetableEvents(
        unique_id: string,
        worker_db_name: string
    ): Promise<TeacherTimetableEvent[]> {
        try {
            logger.debug('timetable-service', '📤 Fetching timetable events', {
                unique_id,
                worker_db_name
            });

            const response = await axios.get('/api/calendar/get_teacher_timetable_events', {
                params: {
                    unique_id,
                    worker_db_name
                }
            });

            logger.debug('timetable-service', '📥 Received response', {
                status: response.status,
                data: response.data
            });

            if (response.data.status === "success") {
                return response.data.events;
            }
            throw new Error(response.data.message || 'Failed to fetch events');
        } catch (error) {
            if (error instanceof AxiosError) {
                logger.error('timetable-service', '❌ Failed to fetch timetable events', { 
                    status: error.response?.status,
                    data: error.response?.data,
                    message: error.message
                });
            } else {
                logger.error('timetable-service', '❌ Failed to fetch timetable events', { error });
            }
            throw error;
        }
    }

    static lightenColor(color: string, amount: number): string {
        color = color.replace(/^#/, '');
        const num = parseInt(color, 16);
        const r = Math.min(255, (num >> 16) + amount);
        const g = Math.min(255, ((num >> 8) & 0x00FF) + amount);
        const b = Math.min(255, (num & 0x0000FF) + amount);
        return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
    }

    static getContrastColor(hexColor: string): string {
        hexColor = hexColor.replace(/^#/, '');
        const r = parseInt(hexColor.slice(0, 2), 16);
        const g = parseInt(hexColor.slice(2, 4), 16);
        const b = parseInt(hexColor.slice(4, 6), 16);
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        return luminance > 0.7 ? '#000000' : '#FFFFFF';
    }

    static getEventRange(events: TeacherTimetableEvent[]) {
        if (events.length === 0) {
            return { start: null, end: null };
        }

        let start = new Date(events[0].start);
        let end = new Date(events[0].end);

        events.forEach(event => {
            const eventStart = new Date(event.start);
            const eventEnd = new Date(event.end);
            if (eventStart < start) {
              start = eventStart;
            }
            if (eventEnd > end) {
              end = eventEnd;
            }
        });

        start.setDate(1);
        end.setMonth(end.getMonth() + 1, 0);

        return { start, end };
    }

    static getSubjectClassColor(subjectClass: string): string {
        let hash = 0;
        for (let i = 0; i < subjectClass.length; i++) {
            hash = subjectClass.charCodeAt(i) + ((hash << 5) - hash);
        }
        return `hsl(${hash % 360}, 70%, 50%)`;
    }

    static async handleTimetableUpload(
        file: File | undefined,
        workerNode: CCTeacherNodeProps | undefined
    ): Promise<UploadResult> {
        if (!file) {
            return {
                success: false,
                message: 'No file selected'
            };
        }

        if (!file.name.endsWith('.xlsx')) {
            return {
                success: false,
                message: 'Please upload an Excel (.xlsx) file'
            };
        }

        if (!workerNode) {
            return {
                success: false,
                message: 'Teacher information not found. Please ensure you are logged in as a teacher.'
            };
        }

        // Validate worker node has required fields
        const requiredFields = ['unique_id', 'teacher_code', 'teacher_name_formal', 'teacher_email', 'worker_db_name', 'path'];
        const missingFields = requiredFields.filter(field => !(field in workerNode));
        
        if (missingFields.length > 0) {
            logger.error('timetable-service', '❌ Missing required teacher fields:', { missingFields });
            return {
                success: false,
                message: `Missing required teacher information: ${missingFields.join(', ')}`
            };
        }

        try {
            const result = await this.uploadWorkerTimetable(file, workerNode);
            return {
                success: true,
                message: result.message
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to upload timetable';
            logger.error('timetable-service', '❌ Timetable upload failed:', error);
            return {
                success: false,
                message: errorMessage
            };
        }
    }
}
