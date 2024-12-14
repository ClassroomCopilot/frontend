import { TLBaseShape, TLDefaultColorStyle } from '@tldraw/tldraw'
import {
    GeneralRelationshipInterface
} from '../../../types/neo4j/relationship'

export type BaseRelationshipShape<T extends string, U> = TLBaseShape<T, {
    w: number
    h: number
    color: TLDefaultColorStyle
    created: string
    merged: string
} & U>;

export type AllRelationshipShapes = GeneralRelationshipShape;

export type GeneralRelationshipShape = BaseRelationshipShape<"general_relationship", GeneralRelationshipInterface>;