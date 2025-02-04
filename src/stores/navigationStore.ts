import { create } from 'zustand';
import { UserNeoDBService } from '../services/graph/userNeoDBService';
import { logger } from '../debugConfig';
import { isValidNodeType } from '../utils/tldraw/cc-base/cc-graph/cc-graph-types';
import { NavigationNode, NavigationStore } from '../types/navigation';

const initialState = {
    currentNode: null,
    history: {
        nodes: [],
        currentIndex: -1,
    },
    availableRoutes: [],
    isLoading: false,
    error: null,
};

export const useNavigationStore = create<NavigationStore>((set, get) => ({
    ...initialState,

    navigate: async (nodeId: string, dbName: string) => {
        try {
            set({ isLoading: true, error: null });
            
            // Check if we're already at this node
            const { currentNode, history } = get();
            if (currentNode?.id === nodeId) {
                set({ isLoading: false });
                return;
            }
            
            const nodeData = await UserNeoDBService.fetchNodeData(nodeId, dbName);
            if (!nodeData) {
                logger.error('navigation', '❌ Failed to fetch node data');
                return;
            }

            const { node_type, node_data } = nodeData;
            if (!node_type || !isValidNodeType(node_type)) {
                logger.error('navigation', '❌ Invalid node type:', node_type);
                return;
            }

            const node: NavigationNode = {
                id: nodeId,
                path: node_data.path || '',
                label: node_data.title || node_data.name || nodeId,
                type: node_type
            };

            // Update history - prevent duplicate nodes
            const newHistory = {
                nodes: [...history.nodes.slice(0, history.currentIndex + 1)],
                currentIndex: history.currentIndex
            };

            // Only add the node if it's different from the last node
            if (newHistory.nodes.length === 0 || newHistory.nodes[newHistory.currentIndex]?.id !== nodeId) {
                newHistory.nodes.push(node);
                newHistory.currentIndex++;
            }

            set({
                currentNode: node,
                history: newHistory,
                isLoading: false,
            });

            // Fetch and update available routes
            const connectedNodes = await UserNeoDBService.fetchConnectedNodes(nodeId, dbName);
            set({ availableRoutes: connectedNodes });

            logger.info('navigation', '🧭 Navigated to node', { 
                nodeId, 
                type: node.type,
                availableRoutes: connectedNodes.length 
            });
        } catch (error) {
            logger.error('navigation', '❌ Failed to navigate:', error);
            set({ 
                error: error instanceof Error ? error.message : 'Navigation failed',
                isLoading: false 
            });
        }
    },

    navigateToNode: async (nodeId: string) => {
        try {
            set({ isLoading: true, error: null });

            // Get the formatted email from the nodeId
            const formattedEmail = nodeId.replace('User_', '');
            const dbName = `cc.ccusers.${formattedEmail}`;

            // Reuse the navigate function to avoid code duplication
            await get().navigate(nodeId, dbName);
        } catch (error) {
            logger.error('navigation', '❌ Failed to navigate to node:', error);
            set({ 
                error: error instanceof Error ? error.message : 'Navigation failed',
                isLoading: false 
            });
        }
    },

    back: () => {
        const { history } = get();
        if (history.currentIndex > 0) {
            const newIndex = history.currentIndex - 1;
            const prevNode = history.nodes[newIndex];
            set({
                currentNode: prevNode,
                history: { ...history, currentIndex: newIndex },
            });
            
            logger.info('navigation', '⬅️ Navigated back', { 
                to: prevNode.id,
                historyIndex: newIndex 
            });
        }
    },

    forward: () => {
        const { history } = get();
        if (history.currentIndex < history.nodes.length - 1) {
            const newIndex = history.currentIndex + 1;
            const nextNode = history.nodes[newIndex];
            set({
                currentNode: nextNode,
                history: { ...history, currentIndex: newIndex },
            });
            
            logger.info('navigation', '➡️ Navigated forward', { 
                to: nextNode.id,
                historyIndex: newIndex 
            });
        }
    },

    addAvailableRoute: (node: NavigationNode) => {
        const { availableRoutes } = get();
        set({
            availableRoutes: [...availableRoutes, node],
        });
    },

    setError: (error: string | null) => set({ error }),

    clearHistory: () => set(initialState),
})); 