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
            set({ isLoading: true, error: null });
            
            const currentState = get().context;
            let newState = { ...currentState };

            // Update main context if provided
            if (contextSwitch.main) {
                newState = validateContextTransition(newState, { main: contextSwitch.main });
            }

            // Update base context if provided
            if (contextSwitch.base) {
                newState = validateContextTransition(newState, { base: contextSwitch.base });
            }

            // Determine which context to use for the node
            const targetContext = contextSwitch.extended || 
                                (contextSwitch.base ? contextSwitch.base : newState.base);

            // Get database name
            const dbName = getContextDatabase(newState, userDbName, workerDbName);

            // Get default node for the final context
            const defaultNode = await UserNeoDBService.getDefaultNode(targetContext, dbName);
            
            if (!defaultNode) {
                throw new Error(`No default node for context: ${targetContext}`);
            }

            // Update history with new node
            const newHistory = addToHistory(currentState.history, defaultNode);

            // Update state
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
            logger.error('navigation', '❌ Failed to switch context:', error);
            set({ 
                error: error instanceof Error ? error.message : 'Failed to switch context',
                isLoading: false 
            });
        }
    },

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