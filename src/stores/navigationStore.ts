import { create } from 'zustand';
import { UserNeoDBService } from '../services/graph/userNeoDBService';
import { logger } from '../debugConfig';
import { isValidNodeType } from '../utils/tldraw/cc-base/cc-graph/cc-graph-types';
import { 
    NavigationStore, 
    NavigationNode,
    MainContext,
    BaseContext,
    NavigationContextState,
    getContextDatabase,
    addToHistory,
    ExtendedContext
} from '../types/navigation';
import { NAVIGATION_CONTEXTS } from '../config/navigationContexts';

const cleanupContext = () => {
    return {
        main: 'profile' as MainContext,
        base: 'profile' as BaseContext,
        node: null,
        history: {
            nodes: [],
            currentIndex: -1
        }
    };
};

function getDefaultBaseForMain(main: MainContext): BaseContext {
    return main === 'profile' ? 'profile' : 'school';
}

export interface NavigationActions {
  // Context Navigation
  setMainContext: (context: MainContext, userDbName: string | null, workerDbName: string | null) => Promise<void>;
  setBaseContext: (context: BaseContext, userDbName: string | null, workerDbName: string | null) => Promise<void>;
  setExtendedContext: (context: ExtendedContext, userDbName: string | null, workerDbName: string | null) => Promise<void>;
  
  // Node Navigation
  navigate: (nodeId: string, dbName: string) => Promise<void>;
  navigateToNode: (node: NavigationNode, userDbName: string | null, workerDbName: string | null) => Promise<void>;
  
  // History Navigation
  goBack: () => void;
  goForward: () => void;
  
  // Utility Methods
  refreshNavigationState: (userDbName: string | null, workerDbName: string | null) => Promise<void>;
}

export type NavigationStateType = {
    context: NavigationContextState;
    isLoading: boolean;
    error: string | null;
};

export const useNavigationStore = create<NavigationStore>((set, get) => ({
    context: cleanupContext(),
    isLoading: false,
    error: null,

    goBack: () => {
        const currentState = get().context;
        if (currentState.history.currentIndex > 0) {
            const newIndex = currentState.history.currentIndex - 1;
            const previousNode = currentState.history.nodes[newIndex];
            set({
                context: {
                    ...currentState,
                    node: previousNode,
                    history: {
                        ...currentState.history,
                        currentIndex: newIndex
                    }
                }
            });
        }
    },

    goForward: () => {
        const currentState = get().context;
        if (currentState.history.currentIndex < currentState.history.nodes.length - 1) {
            const newIndex = currentState.history.currentIndex + 1;
            const nextNode = currentState.history.nodes[newIndex];
            set({
                context: {
                    ...currentState,
                    node: nextNode,
                    history: {
                        ...currentState.history,
                        currentIndex: newIndex
                    }
                }
            });
        }
    },

    // Context Navigation
    setMainContext: async (main: MainContext, userDbName: string | null, workerDbName: string | null) => {
        try {
            set({ isLoading: true, error: null });
            
            // Save current snapshot if we have a node
            const currentNode = get().context.node;
            if (currentNode) {
                logger.debug('navigation', '💾 Saving current snapshot before context switch', {
                    nodeId: currentNode.id,
                    path: currentNode.path
                });
                await UserNeoDBService.saveCurrentSnapshot(currentNode.path);
            }

            const newBase = getDefaultBaseForMain(main);
            
            // Clean up old context first
            set(() => ({
                context: {
                    ...cleanupContext(),
                    main,
                    base: newBase
                }
            }));

            // Then load new context data
            const newContext: NavigationContextState = {
                main,
                base: newBase,
                node: null,
                history: { nodes: [], currentIndex: -1 }
            };
            
            const dbName = getContextDatabase(newContext, userDbName, workerDbName);
            logger.debug('navigation', '🔄 Setting main context', {
                main,
                base: newBase,
                dbName,
                userDbName,
                workerDbName
            });

            const defaultNode = await UserNeoDBService.getDefaultNode(newBase, dbName);
            
            if (!defaultNode) {
                throw new Error(`No default node for context: ${newBase}`);
            }

            // Update history with new node
            const newHistory = addToHistory(get().context.history, defaultNode);

            set({ 
                context: { 
                    ...newContext, 
                    node: defaultNode,
                    history: newHistory
                },
                isLoading: false 
            });

            // Clear canvas and load new snapshot
            await UserNeoDBService.clearCanvasAndLoadSnapshot(defaultNode.path, (state) => {
                set({ isLoading: state.status === 'loading' });
            });
        } catch (error) {
            logger.error('navigation', '❌ Failed to set main context:', error);
            set({ 
                error: error instanceof Error ? error.message : 'Failed to set main context',
                isLoading: false 
            });
        }
    },

    setBaseContext: async (base: BaseContext, userDbName: string | null, workerDbName: string | null) => {
        try {
            set({ isLoading: true, error: null });
            
            // Save current snapshot if we have a node
            const currentNode = get().context.node;
            if (currentNode) {
                logger.debug('navigation', '💾 Saving current snapshot before context switch', {
                    nodeId: currentNode.id,
                    path: currentNode.path
                });
                await UserNeoDBService.saveCurrentSnapshot(currentNode.path);
            }

            // Get the default extended context for this base context
            const contextDef = NAVIGATION_CONTEXTS[base];
            if (!contextDef) {
                throw new Error(`Invalid base context: ${base}`);
            }
            const defaultExtendedContext = contextDef.views[0]?.id;
            
            // Clean up context data and set both base and extended contexts at once
            set(state => ({
                context: {
                    ...state.context,
                    base,
                    node: null,
                    history: {
                        nodes: [],
                        currentIndex: -1
                    }
                }
            }));

            // Then load new context data
            const dbName = getContextDatabase(get().context, userDbName, workerDbName);
            logger.debug('navigation', '🔄 Setting base context', {
                base,
                defaultExtendedContext,
                dbName,
                userDbName,
                workerDbName
            });

            // Get default node for the default extended context if it exists, otherwise for base
            const defaultNode = defaultExtendedContext 
                ? await UserNeoDBService.getDefaultNode(defaultExtendedContext, dbName)
                : await UserNeoDBService.getDefaultNode(base, dbName);
            
            if (!defaultNode) {
                throw new Error(`No default node for context: ${defaultExtendedContext || base}`);
            }

            // Update history with new node
            const newHistory = addToHistory(get().context.history, defaultNode);

            set({ 
                context: { 
                    ...get().context,
                    node: defaultNode,
                    history: newHistory
                },
                isLoading: false
            });

            // Clear canvas and load new snapshot
            await UserNeoDBService.clearCanvasAndLoadSnapshot(defaultNode.path, (state) => {
                set({ isLoading: state.status === 'loading' });
            });
        } catch (error) {
            logger.error('navigation', '❌ Failed to set base context:', error);
            set({ 
                error: error instanceof Error ? error.message : 'Failed to set base context',
                isLoading: false 
            });
        }
    },

    setExtendedContext: async (extended: ExtendedContext, userDbName: string | null, workerDbName: string | null) => {
        try {
            // If we're already loading, skip this transition
            if (get().isLoading) {
                logger.debug('navigation', '⏭️ Skipping extended context change while loading');
                return;
            }

            set({ isLoading: true, error: null });
            
            const currentState = get().context;
            const contextDef = NAVIGATION_CONTEXTS[currentState.base];
            if (!contextDef) {
                throw new Error(`Invalid base context: ${currentState.base}`);
            }

            // Find the view definition for the extended context
            const viewDef = contextDef.views.find(view => view.id === extended);
            if (!viewDef) {
                throw new Error(`Invalid extended context: ${extended} for base context: ${currentState.base}`);
            }

            logger.debug('navigation', '🔄 Setting extended context', {
                base: currentState.base,
                extended,
                dbName: getContextDatabase(currentState, userDbName, workerDbName)
            });

            // Get the default node for this extended context
            const dbName = getContextDatabase(currentState, userDbName, workerDbName);
            const defaultNode = await UserNeoDBService.getDefaultNode(extended, dbName);
            
            if (!defaultNode) {
                throw new Error(`No default node for extended context: ${extended}`);
            }

            // Update history with new node
            const newHistory = addToHistory(currentState.history, defaultNode);

            set({ 
                context: { 
                    ...currentState,
                    node: defaultNode,
                    history: newHistory
                },
                isLoading: false 
            });

            // Load node snapshot
            await UserNeoDBService.loadSnapshotIntoStore(defaultNode.path, (state) => {
                set({ isLoading: state.status === 'loading' });
            });
        } catch (error) {
            logger.error('navigation', '❌ Failed to set extended context:', error);
            set({ 
                error: error instanceof Error ? error.message : 'Failed to set extended context',
                isLoading: false 
            });
        }
    },

    navigate: async (nodeId: string, dbName: string) => {
        try {
            set({ isLoading: true, error: null });
            const nodeData = await UserNeoDBService.fetchNodeData(nodeId, dbName);
            if (!nodeData) {
                throw new Error(`Node not found: ${nodeId}`);
            }

            const node: NavigationNode = {
                id: nodeId,
                path: nodeData.node_data.path || '',
                label: nodeData.node_data.title || nodeData.node_data.user_name || nodeId,
                type: nodeData.node_type
            };

            const currentState = get().context;
            const newHistory = addToHistory(currentState.history, node);

            set({
                context: {
                    ...currentState,
                    node,
                    history: newHistory
                },
                isLoading: false
            });

            await UserNeoDBService.loadSnapshotIntoStore(node.path, (state) => {
                set({ isLoading: state.status === 'loading' });
            });
        } catch (error) {
            logger.error('navigation', '❌ Failed to navigate:', error);
            set({
                error: error instanceof Error ? error.message : 'Failed to navigate',
                isLoading: false
            });
        }
    },

    navigateToNode: async (node: NavigationNode, userDbName: string | null, workerDbName: string | null) => {
        try {
            set({ isLoading: true, error: null });
            
            if (!isValidNodeType(node.type)) {
                throw new Error(`Invalid node type: ${node.type}`);
            }

            const dbName = getContextDatabase(get().context, userDbName, workerDbName);
            await get().navigate(node.id, dbName);
        } catch (error) {
            logger.error('navigation', '❌ Failed to navigate to node:', error);
            set({
                error: error instanceof Error ? error.message : 'Failed to navigate to node',
                isLoading: false
            });
        }
    },

    refreshNavigationState: async (userDbName: string | null, workerDbName: string | null) => {
        try {
            set({ isLoading: true, error: null });
            const currentState = get().context;
            
            if (currentState.node) {
                const dbName = getContextDatabase(currentState, userDbName, workerDbName);
                const nodeData = await UserNeoDBService.fetchNodeData(currentState.node.id, dbName);
                if (nodeData) {
                    const node: NavigationNode = {
                        id: currentState.node.id,
                        path: nodeData.node_data.path || '',
                        label: nodeData.node_data.title || nodeData.node_data.user_name || currentState.node.id,
                        type: nodeData.node_type
                    };
                    set({
                        context: {
                            ...currentState,
                            node
                        }
                    });
                }
            }
            
            set({ isLoading: false });
        } catch (error) {
            logger.error('navigation', '❌ Failed to refresh navigation state:', error);
            set({
                error: error instanceof Error ? error.message : 'Failed to refresh navigation state',
                isLoading: false
            });
        }
    }
})); 