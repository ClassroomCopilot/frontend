import { TLBaseShape, TLDefaultColorStyle } from '@tldraw/tldraw'

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

export type BaseRelationshipShape<T extends string, U> = TLBaseShape<T, {
    w: number
    h: number
    color: TLDefaultColorStyle
    created: string
    merged: string
} & U>;

export type AllRelationshipShapes = GeneralRelationshipShape;

export type GeneralRelationshipShape = BaseRelationshipShape<"general_relationship", GeneralRelationshipInterface>;