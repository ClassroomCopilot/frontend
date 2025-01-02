import { createTLSchema, defaultShapeSchemas, defaultBindingSchemas } from '@tldraw/tlschema';
import { createTLSchemaFromUtils, defaultBindingUtils, defaultShapeUtils } from '@tldraw/tldraw';
import { ShapeUtils } from './shapes';
import { allBindingUtils } from './bindings';

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
        }), {})
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