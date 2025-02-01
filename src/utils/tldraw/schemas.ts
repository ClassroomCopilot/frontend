import { createTLSchema, defaultShapeSchemas, defaultBindingSchemas } from '@tldraw/tlschema';
import { createTLSchemaFromUtils, defaultBindingUtils, defaultShapeUtils } from '@tldraw/tldraw';
import { ShapeUtils } from './shapes';
import { allBindingUtils } from './bindings';
import { ccGraphShapeProps } from './cc-base/cc-graph/cc-graph-props';
import { ccGraphMigrations } from './cc-base/cc-graph/cc-graph-migrations';
import { GraphShapeType } from './cc-base/cc-graph/cc-graph-types';

// Create schema with shape definitions
export const customSchema = createTLSchema({
    shapes: {
        ...defaultShapeSchemas,
        // Dynamically generate shape schemas from ShapeUtils
        ...Object.values(ShapeUtils).reduce((acc, util) => ({
            ...acc,
            [util.type]: {
                props: util.props,
                migrations: util.migrations,
            }
        }), {}),
        // Add graph shapes
        ...(ccGraphShapeProps ? Object.entries(ccGraphShapeProps).reduce((acc, [type, props]) => ({
            ...acc,
            [type]: {
                props,
                migrations: ccGraphMigrations[type as GraphShapeType],
            }
        }), {}) : {})
    },
    bindings: {
        ...defaultBindingSchemas,
        // Add binding schemas from our custom binding utils
        ...allBindingUtils.reduce((acc, util) => ({
            ...acc,
            [util.type]: {
                props: util.props,
                migrations: util.migrations,
            }
        }), {})
    },
});

// Create schema from utils (alternative approach)
export const schemaFromUtils = createTLSchemaFromUtils({
    shapeUtils: [
        ...defaultShapeUtils,
        ...Object.values(ShapeUtils)
    ],
    bindingUtils: [
        ...defaultBindingUtils,
        ...allBindingUtils
    ],
});