import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { useUser } from './UserContext';
import { storageService, StorageKeys } from '../services/auth/localStorageService';
import { UserNeoDBService, ProcessedUserNodes } from '../services/graph/userNeoDBService';
import { CCUserNodeProps } from '../utils/tldraw/cc-base/cc-graph/cc-graph-types'
import { logger } from '../debugConfig';

export interface Neo4jContextType {
    userNode: CCUserNodeProps | null;
    userNodes: ProcessedUserNodes | null;
    userDbName: string | null;
    workerDbName: string | null;
    isLoading: boolean;
    isInitialized: boolean;
    error: string | null;
}

const Neo4jContext = createContext<Neo4jContextType>({
    userNode: null,
    userNodes: null,
    userDbName: null,
    workerDbName: null,
    isLoading: true,
    isInitialized: false,
    error: null
});

const validateNodeTypes = (data: ProcessedUserNodes): ProcessedUserNodes => {
    // Validate and map node types for connected nodes
    if (data.connectedNodes.calendar) {
        data.connectedNodes.calendar = {
            ...data.connectedNodes.calendar,
            __primarylabel__: 'Calendar' as const
        };
    }
    
    if (data.connectedNodes.teacher) {
        data.connectedNodes.teacher = {
            ...data.connectedNodes.teacher,
            __primarylabel__: 'Teacher' as const
        };
    }

    // Validate private user node
    if (data.privateUserNode) {
        data.privateUserNode = {
            ...data.privateUserNode,
            __primarylabel__: 'User' as const
        };
    }

    return data;
};

export const Neo4jProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const { profile, isLoading: isUserLoading, isInitialized: isUserInitialized } = useUser();
    const [userNodes, setUserNodes] = useState<ProcessedUserNodes | null>(null);
    const [userNode, setUserNode] = useState<CCUserNodeProps | null>(null);
    const [userDbName, setUserDbName] = useState<string | null>(null);
    const [workerDbName, setWorkerDbName] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isInitialized, setIsInitialized] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Wait for user profile data to be loaded
        if (!isUserInitialized || isUserLoading) {
            logger.debug('neo4j-context', '⏳ Waiting for user profile initialization...');
            return;
        }

        // If no profile, mark as initialized with no data
        if (!profile) {
            setIsLoading(false);
            setIsInitialized(true);
            return;
        }

        // Check if we have the required database names
        if (!profile.user_db_name) {
            // Try to construct the user database name from the email if available
            if (user?.email) {
                const formattedEmail = user.email.replace('@', 'at').replace(/\./g, 'dot');
                const constructedDbName = `cc.ccusers.${formattedEmail}`;
                logger.debug('neo4j-context', '🔄 Constructed user database name', {
                    email: user.email,
                    constructedDbName
                });
                setUserDbName(constructedDbName);
            } else {
                logger.error('neo4j-context', '❌ Cannot determine user database name');
                setError('Missing user database name');
                setIsLoading(false);
                setIsInitialized(true);
                return;
            }
        } else {
            setUserDbName(profile.user_db_name);
        }

        // Set worker database name if available
        if (profile.worker_db_name) {
            setWorkerDbName(profile.worker_db_name);
        }

        logger.debug('neo4j-context', '🔄 Initializing Neo4j context', {
            hasProfile: !!profile,
            userDbName: profile.user_db_name || userDbName,
            workerDbName: profile.worker_db_name,
            hasNeo4jNode: !!profile.neo4j_user_node
        });

        const loadFromStorage = () => {
            const storedData = storageService.get(StorageKeys.USER_NODES);
            if (storedData) {
                try {
                    const validatedData = validateNodeTypes(storedData);
                    logger.debug('neo4j-context', '📥 Loading nodes from storage', validatedData);
                    setUserNodes(validatedData);
                    setUserNode(validatedData.privateUserNode);
                    setIsLoading(false);
                    setIsInitialized(true);
                    return true;
                } catch (err) {
                    logger.error('neo4j-context', '❌ Error validating stored nodes', err);
                    return false;
                }
            }
            return false;
        };

        const fetchUserData = async () => {
            if (!user?.email) {
                logger.error('neo4j-context', '❌ Missing user email');
                setError('Missing user email');
                setIsLoading(false);
                setIsInitialized(true);
                return;
            }

            const effectiveUserDbName = profile.user_db_name || userDbName;
            if (!effectiveUserDbName) {
                logger.error('neo4j-context', '❌ No database name available');
                setError('Missing database name');
                setIsLoading(false);
                setIsInitialized(true);
                return;
            }

            try {
                setIsLoading(true);
                logger.debug('neo4j-context', '🔄 Fetching Neo4j user data', {
                    email: user.email,
                    userDbName: effectiveUserDbName,
                    workerDbName: profile.worker_db_name
                });

                const userNodesData = await UserNeoDBService.fetchUserNodesData(
                    user.email,
                    effectiveUserDbName,
                    profile.worker_db_name
                );
                
                if (userNodesData) {
                    const validatedData = validateNodeTypes(userNodesData);
                    setUserNodes(validatedData);
                    setUserNode(validatedData.privateUserNode);
                    storageService.set(StorageKeys.USER_NODES, validatedData);
                    setIsInitialized(true);

                    logger.debug('neo4j-context', '✅ Neo4j data initialized', {
                        hasUserNode: !!validatedData.privateUserNode,
                        hasTeacher: !!validatedData.connectedNodes.teacher,
                        hasCalendar: !!validatedData.connectedNodes.calendar,
                        userDbName: effectiveUserDbName,
                        workerDbName: profile.worker_db_name
                    });
                } else {
                    logger.error('neo4j-context', '❌ No user nodes data returned');
                    setError('Failed to fetch user nodes data');
                    setIsInitialized(true);
                }
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Unknown error';
                logger.error('neo4j-context', '❌ Error fetching Neo4j data', { error: errorMessage });
                setError(errorMessage);
                setIsInitialized(true);
            } finally {
                setIsLoading(false);
            }
        };

        if (!loadFromStorage()) {
            fetchUserData();
        }
    }, [user?.email, profile, isUserLoading, isUserInitialized]);

    return (
        <Neo4jContext.Provider value={{ 
            userNode, 
            userNodes, 
            isLoading, 
            isInitialized,
            error, 
            userDbName, 
            workerDbName 
        }}>
            {children}
        </Neo4jContext.Provider>
    );
};

export const useNeo4j = () => useContext(Neo4jContext);
