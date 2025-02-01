import { ccGraphShapeProps } from './cc-graph-props'
import { createShapePropsMigrationIds, createShapePropsMigrationSequence } from '@tldraw/tldraw'
import { CCGraphShape, GraphShapeType } from './cc-graph-types'

// Helper function to create version IDs for a shape type
const createVersions = (shapeType: GraphShapeType) => {
  return createShapePropsMigrationIds(shapeType, {
    Initial: 1  // All shapes start at version 1 as required by TLDraw
  })
}

// Helper function to create a migration sequence for a shape
const createMigrationSequence = (shapeType: GraphShapeType) => {
  const versions = createVersions(shapeType)
  return createShapePropsMigrationSequence({
    sequence: [
      {
        id: versions.Initial,
        up: (props: CCGraphShape['props']) => {
          // Initial version - no changes needed
          return props
        },
      },
    ],
  })
}

// Create migrations for all graph shapes
export const ccGraphMigrations = Object.keys(ccGraphShapeProps).reduce((acc, shapeType) => ({
  ...acc,
  [shapeType]: createMigrationSequence(shapeType as GraphShapeType)
}), {} as Record<GraphShapeType, ReturnType<typeof createShapePropsMigrationSequence>>)
