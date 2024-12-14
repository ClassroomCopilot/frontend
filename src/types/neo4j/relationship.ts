export interface BaseRelationshipInterface {
    __relationshiptype__: string;
    source: string;
    target: string;
    created: string;
    merged: string;
}

// General
export interface GeneralRelationshipInterface extends BaseRelationshipInterface {
    __relationshiptype__: string;
    source: string;
    target: string;
}