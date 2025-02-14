import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { useUser } from './UserContext';
import { SchoolNeoDBService } from '../services/graph/schoolNeoDBService';
import { CCSchoolNodeProps } from '../utils/tldraw/cc-base/cc-graph/cc-graph-types';
import { logger } from '../debugConfig';

export interface NeoInstituteContextType {
    schoolNode: CCSchoolNodeProps | null;
    isLoading: boolean;
    isInitialized: boolean;
    error: string | null;
}

const NeoInstituteContext = createContext<NeoInstituteContextType>({
    schoolNode: null,
    isLoading: true,
    isInitialized: false,
    error: null
});

export const NeoInstituteProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const { profile, isLoading: isUserLoading, isInitialized: isUserInitialized } = useUser();
    
    const [schoolNode, setSchoolNode] = useState<CCSchoolNodeProps | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isInitialized, setIsInitialized] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Wait for user profile to be ready
        if (!isUserInitialized || isUserLoading) {
            logger.debug('neo-institute-context', '⏳ Waiting for user initialization...');
            return;
        }

        // If no profile or no worker database, mark as initialized with no data
        if (!profile || !profile.worker_db_name) {
            setIsLoading(false);
            setIsInitialized(true);
            return;
        }

        const loadSchoolNode = async () => {
            try {
                setIsLoading(true);
                logger.debug('neo-institute-context', '🔄 Loading school node', {
                    workerDbName: profile.worker_db_name,
                    userEmail: user?.email
                });

                const node = await SchoolNeoDBService.getSchoolNode(profile.worker_db_name);
                if (node) {
                    setSchoolNode(node);
                    logger.debug('neo-institute-context', '✅ School node loaded', {
                        schoolId: node.unique_id,
                        dbName: profile.worker_db_name
                    });
                } else {
                    logger.warn('neo-institute-context', '⚠️ No school node found');
                }

            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Failed to load school node';
                logger.error('neo-institute-context', '❌ Failed to load school node', {
                    error: errorMessage,
                    workerDbName: profile.worker_db_name
                });
                setError(errorMessage);
            } finally {
                setIsLoading(false);
                setIsInitialized(true);
            }
        };

        loadSchoolNode();
    }, [user?.email, profile, isUserLoading, isUserInitialized]);

    return (
        <NeoInstituteContext.Provider value={{
            schoolNode,
            isLoading,
            isInitialized,
            error
        }}>
            {children}
        </NeoInstituteContext.Provider>
    );
};

export const useNeoInstitute = () => useContext(NeoInstituteContext);
