import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { formatEmailForDatabase } from '../services/graph/userNeoDBService';
import { storageService, StorageKeys } from '../services/auth/localStorageService';
import { logger } from '../debugConfig';
import { UserNeoDBService, ProcessedUserNodes } from '../services/graph/userNeoDBService';
import { UserNodeInterface } from '../utils/tldraw/graph/graph-shape-types';

export interface Neo4jContextType {
    userNode: UserNodeInterface | null;
    userNodes: ProcessedUserNodes | null;
    userDbName: string | null;
    workerDbName: string | null;
    isLoading: boolean;
    error: string | null;
}

const Neo4jContext = createContext<Neo4jContextType>({
    userNode: null,
    userNodes: null,
    userDbName: null,
    workerDbName: null,
    isLoading: true,
    error: null
});

export const Neo4jProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [userNodes, setUserNodes] = useState<ProcessedUserNodes | null>(null);
    const [userNode, setUserNode] = useState<UserNodeInterface | null>(null);
    const [userDbName, setUserDbName] = useState<string | null>(null);
    const [workerDbName, setWorkerDbName] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadFromStorage = () => {
            const storedData = storageService.get(StorageKeys.USER_NODES);
            if (storedData) {
                logger.debug('neo4j-service', '📥 Loading nodes from storage', storedData);
                setUserNodes(storedData);
                setUserNode(storedData.privateUserNode);
                setIsLoading(false);
                return true;
            }
            return false;
        };

        const fetchUserData = async () => {
            if (!user?.email) return;

            try {
                setIsLoading(true);
                const userNodesData = await UserNeoDBService.fetchUserNodesData(user.email);
                
                if (userNodesData) {
                    setUserNodes(userNodesData);
                    setUserNode(userNodesData.privateUserNode);
                    storageService.set(StorageKeys.USER_NODES, userNodesData);
                }
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Unknown error';
                logger.error('neo4j-service', '❌ Error fetching user data', { error: errorMessage });
                setError(errorMessage);
            } finally {
                setIsLoading(false);
            }
        };

        if (!loadFromStorage() && user?.email) {
            fetchUserData();
        }
    }, [user?.email]);

    useEffect(() => {
        if (userNodes && userNodes.connectedNodes.teacher) {
            setUserDbName('cc.ccusers.' + formatEmailForDatabase(userNodes.privateUserNode.user_email));
            setWorkerDbName(userNodes.connectedNodes.teacher.worker_db_name);
        }
    }, [userNodes]);

    return (
        <Neo4jContext.Provider value={{ userNode, userNodes, isLoading, error, userDbName, workerDbName }}>
            {children}
        </Neo4jContext.Provider>
    );
};

export const useNeo4j = () => useContext(Neo4jContext);
