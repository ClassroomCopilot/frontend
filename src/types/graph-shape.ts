import { TLShapeId } from '@tldraw/tldraw';

export type ShapeState = {
    parentId: TLShapeId | null;
    isPageChild: boolean;
    hasChildren: boolean | null;
    bindings: Record<string, unknown> | null;
};

export type NodeData = {
    title: string;
    w: number;
    h: number;
    state: ShapeState | null;
    headerColor: string;
    backgroundColor: string;
    isLocked: boolean;
    __primarylabel__: string;
    unique_id: string;
    path: string;
    [key: string]: string | number | boolean | null | ShapeState | undefined;
} 