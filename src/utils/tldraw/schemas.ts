import { createTLSchema, defaultShapeSchemas, defaultBindingSchemas } from '@tldraw/tlschema';
import { createTLSchemaFromUtils, defaultBindingUtils, defaultShapeUtils } from '@tldraw/tldraw';
import { ShapeUtils } from './shapes';
import { allBindingUtils } from './bindings';
import { ccBindingProps } from './cc-base/cc-props';
import { ccBindingMigrations } from './cc-base/cc-migrations';

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
    },
    bindings: {
        ...defaultBindingSchemas,
        // Add binding schemas with our updated props and migrations
        'cc-slide-layout': {
            props: ccBindingProps['cc-slide-layout'],
            migrations: ccBindingMigrations['cc-slide-layout'],
        },
        'cc-slide-content-binding': {
            props: ccBindingProps['cc-slide-content-binding'],
            migrations: ccBindingMigrations['cc-slide-content-binding'],
        },
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