import { createShapePropsMigrationIds, createShapePropsMigrationSequence, RecordProps } from '@tldraw/tldraw'
import { GeneralRelationshipShape } from './graph-relationship-types';

// Ensure each node type and its migrations are added separately
const generalRelationshipVersions = createShapePropsMigrationIds(
    'general_relationship',
    {
        AddSomeProperty: 1,
    }
);

export const generalRelationshipShapeMigrations = createShapePropsMigrationSequence({
    sequence: [
        {
            id: generalRelationshipVersions.AddSomeProperty,
            up(props: RecordProps<GeneralRelationshipShape>) {
                props.color = 'some value'
            },
            down(props: RecordProps<GeneralRelationshipShape>) {
                delete props.color
            },
        }
    ],
})
