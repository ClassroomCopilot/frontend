import { supabase } from '../../supabaseClient';
import { CCUser, convertToCCUser } from '../../services/auth/authService';
import { EmailCredentials } from '../../services/auth/authService';
import { RegistrationResponse } from '../../services/auth/authService';
import { UserNeoDBService } from '../graph/userNeoDBService';
import { storageService, StorageKeys } from './localStorageService';
import { logger } from '../../debugConfig';
import { formatEmailForDatabase } from '../graph/userNeoDBService';

const REGISTRATION_SERVICE = 'registration-service';

export class RegistrationService {
    private static instance: RegistrationService;

    private constructor() {}

    static getInstance(): RegistrationService {
        if (!RegistrationService.instance) {
            RegistrationService.instance = new RegistrationService();
        }
        return RegistrationService.instance;
    }

    async register(credentials: EmailCredentials, username: string): Promise<RegistrationResponse> {
        try {
            logger.debug(REGISTRATION_SERVICE, '🔄 Starting registration', { 
                email: credentials.email, 
                role: credentials.role,
                hasUsername: !!username 
            });

            // 1. First sign up the user in auth
            const { data, error } = await supabase.auth.signUp({
                email: credentials.email,
                password: credentials.password,
                options: {
                    data: {
                        display_name: username,
                        role: credentials.role
                    },
                    emailRedirectTo: `${window.location.origin}/supabase/auth/callback`
                }
            });

            if (error) {
                logger.error(REGISTRATION_SERVICE, '❌ Supabase signup error', { error });
                throw error;
            }

            if (!data.user) {
                logger.error(REGISTRATION_SERVICE, '❌ No user data after registration');
                throw new Error('No user data after registration');
            }

            const ccUser: CCUser = convertToCCUser(data.user);

            // 2. Create user profile
            const { error: profileError } = await supabase
                .from('user_profiles')
                .insert([{
                    id: data.user.id,
                    email: credentials.email,
                    display_name: username,
                    user_role: credentials.role,
                    worker_db_name: `cc.ccusers.${formatEmailForDatabase(credentials.email)}`
                }])
                .select()
                .single();

            if (profileError) {
                logger.error(REGISTRATION_SERVICE, '❌ Failed to create user profile', { profileError });
                throw profileError;
            }

            storageService.set(StorageKeys.IS_NEW_REGISTRATION, true);

            // 3. Create Neo4j nodes
            try {
                const userNode = await UserNeoDBService.registerNeo4JUser(
                    ccUser,
                    username,
                    credentials.role
                );

                logger.info(REGISTRATION_SERVICE, '✅ Registration successful with Neo4j setup', {
                    userId: ccUser.id,
                    hasUserNode: !!userNode
                });

                return {
                    user: ccUser,
                    accessToken: data.session?.access_token || null,
                    userRole: credentials.role,
                    message: 'Registration successful'
                };
            } catch (neo4jError) {
                logger.warn(REGISTRATION_SERVICE, '⚠️ Neo4j setup problem', { 
                    userId: ccUser.id,
                    error: neo4jError 
                });
                // Return success even if Neo4j setup is pending
                return {
                    user: ccUser,
                    accessToken: data.session?.access_token || null,
                    userRole: credentials.role,
                    message: 'Registration successful - Neo4j setup pending'
                };
            }
        } catch (error) {
            logger.error(REGISTRATION_SERVICE, '❌ Registration failed:', error);
            throw error;
        }
    }
}

export const registrationService = RegistrationService.getInstance();
