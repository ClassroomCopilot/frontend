import { TLUiAssetUrlOverrides } from '@tldraw/tldraw';

// Custom asset URLs
export const customAssets: TLUiAssetUrlOverrides = {
    icons: {
        'sticker-icon': '/icons/sticker-tool.svg'
    }
};

// Blank canvas snapshot template
export const blankCanvasSnapshot = {
    store: {
        "document:document": {
            gridSize: 10,
            name: "",
            meta: {},
            id: "document:document",
            typeName: "document"
        },
        "page:page": {
            meta: {},
            id: "page:page",
            name: "Page 1",
            index: "a1",
            typeName: "page"
        }
    },
    schema: {
        schemaVersion: 2 as const,
        storeVersion: 4,
        sequences: {
            "com.tldraw.store":4,
            "com.tldraw.asset":1,
            "com.tldraw.camera":1,
            "com.tldraw.document":2,
            "com.tldraw.instance":25,
            "com.tldraw.instance_page_state":5,
            "com.tldraw.page":1,
            "com.tldraw.instance_presence":5,
            "com.tldraw.pointer":1,
            "com.tldraw.shape":4,
            "com.tldraw.asset.bookmark":2,
            "com.tldraw.asset.image":5,
            "com.tldraw.asset.video":5,
            "com.tldraw.shape.arrow":5,
            "com.tldraw.shape.bookmark":2,
            "com.tldraw.shape.draw":2,
            "com.tldraw.shape.embed":4,
            "com.tldraw.shape.frame":0,
            "com.tldraw.shape.geo":9,
            "com.tldraw.shape.group":0,
            "com.tldraw.shape.highlight":1,
            "com.tldraw.shape.image":4,
            "com.tldraw.shape.line":5,
            "com.tldraw.shape.note":8,
            "com.tldraw.shape.text":2,
            "com.tldraw.shape.video":2,
            "com.tldraw.shape.youtube-embed":0,
            "com.tldraw.shape.calendar":0,
            "com.tldraw.shape.microphone":1,
            "com.tldraw.shape.transcriptionText":0,
            "com.tldraw.shape.slide":0,"com.tldraw.shape.slideshow":0,
            "com.tldraw.shape.user_node":1,
            "com.tldraw.shape.developer_node":1,
            "com.tldraw.shape.student_node":1,
            "com.tldraw.shape.teacher_node":1,
            "com.tldraw.shape.calendar_node":1,
            "com.tldraw.shape.calendar_year_node":1,
            "com.tldraw.shape.calendar_month_node":1,
            "com.tldraw.shape.calendar_week_node":1,
            "com.tldraw.shape.calendar_day_node":1,
            "com.tldraw.shape.calendar_time_chunk_node":1,
            "com.tldraw.shape.teacher_timetable_node":1,
            "com.tldraw.shape.timetable_lesson_node":1,
            "com.tldraw.shape.planned_lesson_node":1,
            "com.tldraw.shape.pastoral_structure_node":1,
            "com.tldraw.shape.year_group_node":1,
            "com.tldraw.shape.curriculum_structure_node":1,
            "com.tldraw.shape.key_stage_node":1,
            "com.tldraw.shape.key_stage_syllabus_node":1,
            "com.tldraw.shape.year_group_syllabus_node":1,
            "com.tldraw.shape.subject_node":1,
            "com.tldraw.shape.topic_node":1,
            "com.tldraw.shape.topic_lesson_node":1,
            "com.tldraw.shape.learning_statement_node":1,
            "com.tldraw.shape.science_lab_node":1,
            "com.tldraw.shape.school_timetable_node":1,
            "com.tldraw.shape.academic_year_node":1,
            "com.tldraw.shape.academic_term_node":1,
            "com.tldraw.shape.academic_week_node":1,
            "com.tldraw.shape.academic_day_node":1,
            "com.tldraw.shape.academic_period_node":1,
            "com.tldraw.shape.registration_period_node":1,
            "com.tldraw.shape.school_node":1,
            "com.tldraw.shape.department_node":1,
            "com.tldraw.shape.room_node":1,
            "com.tldraw.shape.subject_class_node":1,
            "com.tldraw.shape.general_relationship":1,
            "com.tldraw.binding.arrow":0,
            "com.tldraw.binding.slide-layout":0
        },
        recordVersions: {
            asset: { version: 1, subTypeKey: "type", subTypeVersions: {} },
            camera: { version: 1 },
            document: { version: 2 },
            instance: { version: 21 },
            instance_page_state: { version: 5 },
            page: { version: 1 },
            shape: { version: 3, subTypeKey: "type", subTypeVersions: {} },
            instance_presence: { version: 5 },
            pointer: { version: 1 }
        }
    },
    rootShapeIds: [],
    bindings: {},
    assets: {},
    session: {
        version: 0,
        currentPageId: "page:page",
        pageStates: [{
            pageId: "page:page",
            camera: { x: 0, y: 0, z: 1 },
            selectedShapeIds: []
        }]
    }
};