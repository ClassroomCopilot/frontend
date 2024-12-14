import React from 'react';
import {
    Editor,
    HTMLContainer,
    RecordProps,
    Rectangle2d,
    ShapeUtil,
    TLDefaultColorTheme,
    TLPropsMigrations,
    TLUnknownShape,
    getDefaultColorTheme
} from '@tldraw/tldraw'
import { useNeo4j } from '../../../contexts/Neo4jContext';
import { formatEmailForDatabase } from '../../../services/graph/userNeoDBService';
import { loadNodeSnapshotFromDatabase } from '../../../services/tldraw/snapshotService';
import { GraphNeoDBService } from '../../../services/graph/graphNeoDBService';
import {
    AllNodeShapes
} from './graph-shape-types'
import {
    AllRelationshipShapes
} from './graph-relationship-types'
import { getNodeComponent } from './nodeComponents';
import { logger } from '../../../debugConfig';

export const nodeTypeConfig = {
    User: { 
        shapeType: 'user_node', 
        color: 'light-green',
        allowedProps: ['__primarylabel__', 'unique_id', 'user_name', 'user_email', 'user_type', 'worker_node_data']
    },
    Developer: { 
        shapeType: 'developer_node', 
        color: 'light-blue',
        allowedProps: ['__primarylabel__', 'unique_id', 'user_name', 'user_email']
    },
    Teacher: { 
        shapeType: 'teacher_node', 
        color: 'light-green',
        allowedProps: ['__primarylabel__', 'unique_id', 'teacher_name_formal', 'teacher_code', 'teacher_email', 'worker_db_name']
    },
    Student: { 
        shapeType: 'student_node', 
        color: 'light-green',
        allowedProps: ['__primarylabel__', 'unique_id', 'student_name_formal', 'student_code', 'student_email', 'worker_db_name']
    },
    Calendar: { 
        shapeType: 'calendar_node', 
        color: 'violet',
        allowedProps: ['__primarylabel__', 'unique_id', 'name', 'start_date', 'end_date']
    },
    TeacherTimetable: {
        shapeType: 'teacher_timetable_node', 
        color: 'blue',
        allowedProps: ['__primarylabel__', 'unique_id', 'start_date', 'end_date']
    },
    TimetableLesson: { 
        shapeType: 'timetable_lesson_node', 
        color: 'light-blue',
        allowedProps: ['__primarylabel__', 'unique_id', 'date', 'period_code', 'planning_status', 'teacher_code', 'year_group', 'subject']
    },
    PlannedLesson: { 
        shapeType: 'planned_lesson_node', 
        color: 'light-green',
        allowedProps: ['__primarylabel__', 'unique_id', 'date', 'period_code', 'planning_status', 'teacher_code', 'year_group', 'subject']
    },
    School: { 
        shapeType: 'school_node', 
        color: 'grey',
        allowedProps: ['__primarylabel__', 'unique_id', 'name', 'address', 'postcode', 'school_type']
    },
    CalendarYear: { 
        shapeType: 'calendar_year_node', 
        color: 'red',
        allowedProps: ['__primarylabel__', 'unique_id', 'year']
    },
    CalendarMonth: { 
        shapeType: 'calendar_month_node', 
        color: 'light-violet',
        allowedProps: ['__primarylabel__', 'unique_id', 'name', 'start_date', 'end_date']
    },
    CalendarWeek: { 
        shapeType: 'calendar_week_node', 
        color: 'light-red',
        allowedProps: ['__primarylabel__', 'unique_id', 'start_date', 'week_type', 'academic_week_number']
    },
    CalendarDay: { 
        shapeType: 'calendar_day_node', 
        color: 'light-blue',
        allowedProps: ['__primarylabel__', 'unique_id', 'day_of_week', 'day_type', 'date']
    },
    CalendarTimeChunk: { 
        shapeType: 'calendar_time_chunk_node', 
        color: 'blue',
        allowedProps: ['__primarylabel__', 'unique_id', 'start_time', 'end_time']
    },
    ScienceLab: { 
        shapeType: 'science_lab_node', 
        color: 'yellow',
        allowedProps: ['__primarylabel__', 'unique_id', 'name']
    },
    KeyStageSyllabus: { 
        shapeType: 'key_stage_syllabus_node', 
        color: 'grey',
        allowedProps: ['__primarylabel__', 'unique_id', 'name']
    },
    YearGroupSyllabus: { 
        shapeType: 'year_group_syllabus_node', 
        color: 'light-blue',
        allowedProps: ['__primarylabel__', 'unique_id', 'name']
    },
    CurriculumStructure: { 
        shapeType: 'curriculum_structure_node', 
        color: 'grey',
        allowedProps: ['__primarylabel__', 'unique_id', 'name']
    },
    Topic: { shapeType: 'topic_node', color: 'green',
        allowedProps: ['__primarylabel__', 'unique_id', 'name']
    },
    TopicLesson: { shapeType: 'topic_lesson_node', color: 'light-green',
        allowedProps: ['__primarylabel__', 'unique_id', 'date', 'period_code', 'planning_status', 'teacher_code', 'year_group', 'subject']
    },
    LearningStatement: { 
        shapeType: 'learning_statement_node', 
        color: 'light-blue',
        allowedProps: ['__primarylabel__', 'unique_id', 'name']
    },
    SchoolTimetable: { 
        shapeType: 'school_timetable_node', 
        color: 'grey',
        allowedProps: ['__primarylabel__', 'unique_id', 'start_date', 'end_date']
    },
    AcademicYear: { shapeType: 'academic_year_node', color: 'light-violet',
        allowedProps: ['__primarylabel__', 'unique_id', 'start_date', 'end_date']
    },
    AcademicTerm: { 
        shapeType: 'academic_term_node', 
        color: 'yellow',
        allowedProps: ['__primarylabel__', 'unique_id', 'start_date', 'end_date']
    },
    AcademicWeek: { shapeType: 'academic_week_node', color: 'orange',
        allowedProps: ['__primarylabel__', 'unique_id', 'start_date', 'week_type', 'academic_week_number']
    },
    AcademicDay: { shapeType: 'academic_day_node', color: 'light-red',
        allowedProps: ['__primarylabel__', 'unique_id', 'day_of_week', 'day_type', 'date']
    },
    AcademicPeriod: { shapeType: 'academic_period_node', color: 'light-green',
        allowedProps: ['__primarylabel__', 'unique_id', 'start_time', 'end_time']
    },
    RegistrationPeriod: { shapeType: 'registration_period_node', color: 'light-green',
        allowedProps: ['__primarylabel__', 'unique_id', 'start_date', 'end_date']
    },
    PastoralStructure: { shapeType: 'pastoral_structure_node', color: 'grey',
        allowedProps: ['__primarylabel__', 'unique_id', 'name']
    },
    KeyStage: { shapeType: 'key_stage_node', color: 'blue',
        allowedProps: ['__primarylabel__', 'unique_id', 'name']
    },
    Department: { shapeType: 'department_node', color: 'light-blue',
        allowedProps: ['__primarylabel__', 'unique_id', 'name']
    },
    Room: { shapeType: 'room_node', color: 'violet',
        allowedProps: ['__primarylabel__', 'unique_id', 'name']
    },
    SubjectClass: { shapeType: 'subject_class_node', color: 'light-blue',
        allowedProps: ['__primarylabel__', 'unique_id', 'name']
    },
};

const CreateNodeComponent = (shape: AllNodeShapes, theme: TLDefaultColorTheme, editor: Editor) => {
    const { userNodes } = useNeo4j();
    
    const handleOpenFile = (e: React.MouseEvent) => {
        e.stopPropagation();
        
        if (!userNodes?.privateUserNode?.user_email) {
            logger.error('baseNodeShapeUtil', 'No user email found');
            return;
        }

        const dbName = 'cc.ccusers.' + formatEmailForDatabase(userNodes.privateUserNode.user_email);
        
        loadNodeSnapshotFromDatabase(
            shape.props.path,
            dbName,
            editor.store,
            (state) => logger.debug('baseNodeShapeUtil', '📂 Loading state updated', state)
        );
    };

    const handleGetConnectedNodes = (e: React.MouseEvent) => {
        e.stopPropagation();
        
        if (!userNodes?.privateUserNode?.user_email) {
            logger.error('baseNodeShapeUtil', 'No user email found');
            return;
        }

        const user_db = `cc.ccusers.${formatEmailForDatabase(userNodes.privateUserNode.user_email)}`;

        GraphNeoDBService.fetchConnectedNodesAndEdges(
            shape.props.unique_id,
            user_db,
            editor
        );
    };

    return (
        <HTMLContainer
            id={shape.props.unique_id}
            className="tldraw-node-container"
            style={{
                border: `1px solid ${theme[shape.props.color].solid}`,
                borderRadius: '5px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: theme[shape.props.color].semi,
                color: theme[shape.props.color].solid,
                boxShadow: '1px 1px 2px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.3s ease',
                overflow: 'hidden',
                padding: '10px',
                height: shape.props.h,
                pointerEvents: 'all',
            }}
        >
            {getNodeComponent(shape, theme)}
            <div 
                style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    width: '100%', 
                    marginTop: '10px',
                }}
            >
                <button
                    style={{
                        backgroundColor: theme[shape.props.color].solid,
                        color: theme[shape.props.color].semi,
                        padding: '5px',
                        borderRadius: '3px',
                        cursor: 'pointer',
                        marginBottom: '5px',
                        textAlign: 'center',
                        border: 'none',
                        width: '100%',
                    }}
                    onPointerDown={(e) => {
                        e.stopPropagation();
                        handleOpenFile(e);
                    }}
                    data-button="open-file"
                >
                    Open File
                </button>
                <button
                    style={{
                        backgroundColor: theme[shape.props.color].solid,
                        color: theme[shape.props.color].semi,
                        padding: '5px',
                        borderRadius: '3px',
                        cursor: 'pointer',
                        textAlign: 'center',
                        border: 'none',
                        width: '100%',
                    }}
                    onPointerDown={(e) => {
                        e.stopPropagation();
                        handleGetConnectedNodes(e);
                    }}
                    data-button="get-connected"
                >
                    Get Connected Nodes
                </button>
            </div>
        </HTMLContainer>
    );
};

const CreateNodeIndicator = (shape: AllNodeShapes, editor: Editor) => {
    const bounds = editor.getShapeGeometry(shape).bounds
    const theme = getDefaultColorTheme({ isDarkMode: editor.user.getIsDarkMode() })
        return (
            <rect
                x={0}
                y={0}
                width={bounds.width}
                height={bounds.height}
                fill="none"
                stroke={theme[shape.props.color].solid}
                strokeWidth={2}
                rx={5}
                ry={5}
            />
        )
}

export abstract class BaseNodeShapeUtil<T extends AllNodeShapes> extends ShapeUtil<T> {
    static override type: string

    static override props: RecordProps<TLUnknownShape>
    static override migrations: TLPropsMigrations

    override isAspectRatioLocked = () => true
    override canResize = () => true

    abstract getDefaultProps(): T['props']

    getGeometry(shape: T) {
        return new Rectangle2d({
            width: shape.props.w,
            height: shape.props.h,
            x: 0,
            y: 0,
            isFilled: true,
        })
    }

    component(shape: T) {
        const theme = getDefaultColorTheme({ isDarkMode: this.editor.user.getIsDarkMode() })
        return CreateNodeComponent(shape, theme, this.editor)
    }

    indicator(shape: T) {
        return CreateNodeIndicator(shape, this.editor)
    }
}

export abstract class BaseRelationshipShapeUtil<T extends AllRelationshipShapes> extends ShapeUtil<T> {
    static override type: string

    static override props: RecordProps<TLUnknownShape>
    static override migrations: TLPropsMigrations

    override isAspectRatioLocked = () => true
    override canResize = () => false

    abstract getDefaultProps(): T['props']

    getGeometry(shape: T) {
        return new Rectangle2d({
            width: shape.props.w,
            height: shape.props.h,
            x: 0,
            y: 0,
            isFilled: true,
        });
    }

    component(shape: T) {
        // Define how the edge is rendered
        return (
            <svg>
                <line
                    x1={shape.x}
                    y1={shape.y}
                    x2={shape.x}
                    y2={shape.y}
                    stroke={shape.props.color}
                    strokeWidth={2}
                />
            </svg>
        );
    }

    indicator(shape: T) {
        return (
            <svg>
                <line
                    x1={shape.x}
                    y1={shape.y}
                    x2={shape.x}
                    y2={shape.y}
                    stroke={shape.props.color}
                    strokeWidth={2}
                    strokeDasharray="4 2"
                />
            </svg>
        );
    }
}