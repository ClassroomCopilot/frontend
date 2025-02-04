export interface NavigationNode {
  id: string;
  path: string;
  label: string;
  type: string;
}

export interface NavigationPath {
  nodes: NavigationNode[];
  currentIndex: number;
}

export interface NavigationState {
  currentNode: NavigationNode | null;
  history: NavigationPath;
  availableRoutes: NavigationNode[];
  isLoading: boolean;
  error: string | null;
}

export interface NavigationActions {
  navigate: (nodeId: string, dbName: string) => Promise<void>;
  navigateToNode: (nodeId: string) => Promise<void>;
  back: () => void;
  forward: () => void;
  addAvailableRoute: (node: NavigationNode) => void;
  setError: (error: string | null) => void;
  clearHistory: () => void;
}

export type NavigationStore = NavigationState & NavigationActions; 