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
    navigateHistory,
    getCurrentHistoryNode,
    ExtendedContext,
    UnifiedContextSwitch
} from '../types/navigation';

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

export const useNavigationStore = create<NavigationStore>((set, get) => ({
    context: initialState,
    isLoading: false,
    error: null,

    switchContext: async (contextSwitch: UnifiedContextSwitch, userDbName: string | null, workerDbName: string | null) => {
        try {
            // Check if we have the necessary database connections
            if (contextSwitch.main === 'profile' && !userDbName) {
                logger.error('navigation-context', '❌ User database connection not initialized');
                set({ 
                    error: 'User database connection not initialized',
                    isLoading: false 
                });
                return;
            }
            if (contextSwitch.main === 'institute' && !workerDbName) {
                logger.error('navigation-context', '❌ Worker database connection not initialized');
                set({ 
                    error: 'Worker database connection not initialized',
                    isLoading: false 
                });
                return;
            }

            logger.debug('navigation-context', '🔄 Starting context switch', {
                from: {
                    main: get().context.main,
                    base: get().context.base,
                    extended: contextSwitch.extended,
                    nodeId: get().context.node?.id
                },
                to: {
                    main: contextSwitch.main,
                    base: contextSwitch.base,
                    extended: contextSwitch.extended
                },
                skipBaseContextLoad: contextSwitch.skipBaseContextLoad
            });

            set({ isLoading: true, error: null });
            
            const currentState = get().context;
            
            // Clear node state immediately
            const clearedState: NavigationContextState = {
                ...currentState,
                node: null
            };
            set({
                context: clearedState,
                isLoading: true
            });

            let newState: NavigationContextState = { 
                ...currentState,
                node: null
            };

            // Update main context if provided
            if (contextSwitch.main) {
                newState = validateContextTransition(newState, { main: contextSwitch.main });
                if (!contextSwitch.skipBaseContextLoad) {
                    newState.base = getDefaultBaseForMain(contextSwitch.main);
                }
                logger.debug('navigation-state', '✅ Main context updated', {
                    previous: currentState.main,
                    new: newState.main,
                    defaultBase: newState.base
                });
            }

            // Update base context if provided
            if (contextSwitch.base) {
                newState = validateContextTransition(newState, { base: contextSwitch.base });
                logger.debug('navigation-state', '✅ Base context updated', {
                    previous: currentState.base,
                    new: newState.base
                });
            }

            logger.debug('navigation-state', '✅ Context validation complete', {
                validatedState: newState,
                originalState: currentState
            });

            // Determine which context to use for the node
            const targetContext = contextSwitch.base || 
                                contextSwitch.extended || 
                                (contextSwitch.main ? getDefaultBaseForMain(contextSwitch.main) : 
                                newState.base);

            // Get database name
            const dbName = getContextDatabase(newState, userDbName, workerDbName);

            logger.debug('context-switch', '🔍 Fetching default node for context', {
                targetContext,
                dbName,
                currentState: newState
            });

            // Get default node for the final context
            const defaultNode = await UserNeoDBService.getDefaultNode(targetContext, dbName);
            
            if (!defaultNode) {
                const errorMsg = `No default node found for context: ${targetContext}`;
                logger.error('context-switch', '❌ Default node fetch failed', { targetContext });
                set({ 
                    error: errorMsg,
                    isLoading: false 
                });
                return;
            }

            logger.debug('context-switch', '✨ Default node fetched', {
                nodeId: defaultNode.id,
                path: defaultNode.path,
                type: defaultNode.type
            });

            // Update history and state
            const newHistory = addToHistory(currentState.history, defaultNode);
            logger.debug('history-management', '📚 History updated', {
                previousState: currentState.history,
                newState: newHistory,
                addedNode: defaultNode
            });

            set({ 
                context: { 
                    ...newState, 
                    node: defaultNode,
                    history: newHistory
                },
                isLoading: false,
                error: null
            });

            logger.debug('navigation-context', '✅ Context switch completed', {
                finalState: {
                    main: newState.main,
                    base: newState.base,
                    nodeId: defaultNode.id
                }
            });
        } catch (error) {
            logger.error('navigation-context', '❌ Failed to switch context:', error);
            set({ 
                error: error instanceof Error ? error.message : 'Failed to switch context',
                isLoading: false 
            });
        }
    },

    goBack: () => {
        const currentState = get().context;
        if (currentState.history.currentIndex > 0) {
            const newHistory = navigateHistory(currentState.history, currentState.history.currentIndex - 1);
            const node = getCurrentHistoryNode(newHistory);
            set({
                context: {
                    ...currentState,
                    node,
                    history: newHistory
                }
            });
        }
    },

    goForward: () => {
        const currentState = get().context;
        if (currentState.history.currentIndex < currentState.history.nodes.length - 1) {
            const newHistory = navigateHistory(currentState.history, currentState.history.currentIndex + 1);
            const node = getCurrentHistoryNode(newHistory);
            set({
                context: {
                    ...currentState,
                    node,
                    history: newHistory
                }
            });
        }
    },

    setMainContext: async (main: MainContext, userDbName: string | null, workerDbName: string | null) => {
        try {
            // Use switchContext instead of direct implementation
            await get().switchContext({ main }, userDbName, workerDbName);
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
            // Use switchContext instead of direct implementation
            await get().switchContext({ base }, userDbName, workerDbName);
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
            // Use switchContext instead of direct implementation
            await get().switchContext({ extended }, userDbName, workerDbName);
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
            
            // Check if we already have this node in history
            const currentState = get().context;
            const existingNodeIndex = currentState.history.nodes.findIndex(n => n.id === nodeId);
            
            // If node exists in history, just navigate to it
            if (existingNodeIndex !== -1) {
                logger.debug('navigation', '📍 Navigating to existing node in history', {
                    nodeId,
                    historyIndex: existingNodeIndex,
                    currentIndex: currentState.history.currentIndex
                });
                
                const newHistory = navigateHistory(currentState.history, existingNodeIndex);
                const node = getCurrentHistoryNode(newHistory);
                
                set({
                    context: {
                        ...currentState,
                        node,
                        history: newHistory
                    },
                    isLoading: false,
                    error: null
                });
                return;
            }

            // Fetch new node data
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

            logger.debug('navigation', '📍 Adding new node to history', {
                nodeId: node.id,
                type: node.type,
                path: node.path
            });

            // Add to history and update state
            const newHistory = addToHistory(currentState.history, node);
            set({
                context: {
                    ...currentState,
                    node,
                    history: newHistory
                },
                isLoading: false,
                error: null
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