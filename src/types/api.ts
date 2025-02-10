import { CCNodeTypes } from '../utils/tldraw/cc-base/cc-graph/cc-graph-types';

export interface NodeResponse {
    node_data: {
        __primarylabel__: keyof CCNodeTypes;
        unique_id: string;
        title?: string;
        name?: string;
        path: string;
        created: string;
        merged: string;
        [key: string]: unknown;
    };
}


export interface ConnectedNodeResponse {
    id: string;
    path: string;
    label: string;
    type: string;
}

export interface RelationshipData {
    start_node: NodeResponse['node_data'];
    end_node: NodeResponse['node_data'];
    relationship_type: string;
    relationship_properties: {
        [key: string]: unknown;
    };
}

export interface ConnectedNodesResponse {
    status: string;
    main_node: NodeResponse;
    connected_nodes: ConnectedNodeResponse[];
    relationships: RelationshipData[];
} 