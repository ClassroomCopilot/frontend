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
    isProfileContext,
    isInstituteContext,
    getContextDatabase,
    addToHistory,
    ExtendedContext,
    NavigationHistory
} from '../types/navigation';
import { NAVIGATION_CONTEXTS } from '../config/navigationContexts';
import { NavigationQueueService } from '../services/navigation/navigationQueueService';

const initialState: NavigationContextState = {
    main: 'profile',
    base: 'profile',
    node: null,
    history: {
        nodes: [],
        currentIndex: -1
    }
};

function getDefaultBaseForMain(main: MainContext): BaseContext {
    return main === 'profile' ? 'profile' : 'school';
}

function validateContextTransition(
    current: NavigationContextState,
    updates: Partial<NavigationContextState>
): NavigationContextState {
    const newState = { ...current, ...updates };

    // Validate main context
    if (updates.main) {
        newState.base = getDefaultBaseForMain(updates.main);
    }

    // Validate base context
    if (updates.base) {
        // Ensure base context matches main context
        const isValid = newState.main === 'profile' 
            ? isProfileContext(updates.base)
            : isInstituteContext(updates.base);

        if (!isValid) {
            newState.base = getDefaultBaseForMain(newState.main);
        }
    }

    return newState;
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

const navigationQueue = NavigationQueueService.getInstance();

export const useNavigationStore = create<NavigationStore>((set, get) => ({
    context: initialState,
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
        await navigationQueue.enqueueOperation(async () => {
            try {
                set({ isLoading: true, error: null });
                logger.debug('navigation', '🔄 Setting main context', { main, userDbName, workerDbName });

                const currentState = get().context;
                const newState = validateContextTransition(currentState, { main });
                
                // Get default node for the new context
                const contextDef = NAVIGATION_CONTEXTS[newState.base];
                if (!contextDef) {
                    throw new Error(`Invalid context: ${newState.base}`);
                }

                const dbName = getContextDatabase(newState, userDbName, workerDbName);
                logger.debug('navigation', '🔄 Setting main context', {
                    main,
                    base: newState.base,
                    dbName,
                    userDbName,
                    workerDbName
                });

                const defaultNode = await UserNeoDBService.getDefaultNode(newState.base, dbName);
                
                if (!defaultNode) {
                    throw new Error(`No default node for context: ${newState.base}`);
                }

                // Update history with new node
                const newHistory = addToHistory(currentState.history, defaultNode);

                set({ 
                    context: { 
                        ...newState, 
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
                logger.error('navigation', '❌ Failed to set main context:', error);
                set({ 
                    error: error instanceof Error ? error.message : 'Failed to set main context',
                    isLoading: false 
                });
            }
        }, `Set main context to ${main}`);
    },

    setBaseContext: async (base: BaseContext, userDbName: string | null, workerDbName: string | null) => {
        await navigationQueue.enqueueOperation(async () => {
            try {
                set({ isLoading: true, error: null });
                logger.debug('navigation', '🔄 Setting base context', { base, userDbName, workerDbName });

                const currentState = get().context;
                const newState = validateContextTransition(currentState, { base });
                
                const contextDef = NAVIGATION_CONTEXTS[base];
                if (!contextDef) {
                    throw new Error(`Invalid context: ${base}`);
                }

                // Get the database name for this context
                const dbName = getContextDatabase(newState, userDbName, workerDbName);

                // Get default node for this context
                const defaultNode = await UserNeoDBService.getDefaultNode(base, dbName);
                if (!defaultNode) {
                    throw new Error(`No default node found for context: ${base}`);
                }

                // Update history with new node
                const newHistory = addToHistory(currentState.history, defaultNode);

                // Update state with new context and node
                set({ 
                    context: { 
                        ...newState,
                        node: defaultNode,
                        history: newHistory
                    }
                });

                // Load node snapshot
                await UserNeoDBService.loadSnapshotIntoStore(defaultNode.path, (state) => {
                    set({ isLoading: state.status === 'loading' });
                });
            } catch (error) {
                logger.error('navigation', '❌ Failed to set base context:', error);
                set({ 
                    error: error instanceof Error ? error.message : 'Failed to set base context',
                    isLoading: false 
                });
            }
        }, `Set base context to ${base}`);
    },

    setExtendedContext: async (extended: ExtendedContext, userDbName: string | null, workerDbName: string | null) => {
        await navigationQueue.enqueueOperation(async () => {
            try {
                set({ isLoading: true, error: null });
                logger.debug('navigation', '🔄 Setting extended context', { extended, userDbName, workerDbName });

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
        }, `Set extended context to ${extended}`);
    },

    navigate: async (nodeId: string, dbName: string) => {
        await navigationQueue.enqueueOperation(async () => {
            try {
                set({ isLoading: true, error: null });
                logger.debug('navigation', '🔄 Navigating to node', { nodeId, dbName });

                const nodeData = await UserNeoDBService.fetchNodeData(nodeId, dbName);
                if (!nodeData) {
                    throw new Error('Node not found');
                }

                const newNode: NavigationNode = {
                    id: nodeId,
                    type: nodeData.node_data.__primarylabel__,
                    label: nodeData.node_data.title || nodeData.node_data.user_name || nodeId,
                    path: nodeData.node_data.path
                };

                // Update history
                set(state => {
                    const { history } = state.context;
                    const newHistory: NavigationHistory = {
                        nodes: [
                            ...history.nodes.slice(0, history.currentIndex + 1),
                            newNode
                        ],
                        currentIndex: history.currentIndex + 1
                    };

                    return {
                        context: {
                            ...state.context,
                            node: newNode,
                            history: newHistory
                        }
                    };
                });

                set({ isLoading: false });
            } catch (error) {
                logger.error('navigation', '❌ Failed to navigate to node', { error });
                set({ 
                    isLoading: false, 
                    error: error instanceof Error ? error.message : 'Failed to navigate to node' 
                });
            }
        }, `Navigate to node ${nodeId}`);
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