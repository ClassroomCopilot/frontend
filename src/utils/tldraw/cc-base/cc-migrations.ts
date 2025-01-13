import { TLRecord, TLShape } from '@tldraw/tldraw'
import { getDefaultCCBaseProps, getDefaultCCCalendarProps, getDefaultCCLiveTranscriptionProps, getDefaultCCSettingsProps, getDefaultCCSlideProps, getDefaultCCSlideShowProps, getDefaultCCSlideLayoutBindingProps, getDefaultCCYoutubeEmbedProps, getDefaultCCSlideContentProps } from './cc-props'

// Export both shape and binding migrations
export const ccBindingMigrations = {
  'cc-slide-layout': {
    firstVersion: 1,
    currentVersion: 1,
    migrators: {
      1: {
        up: (record: TLRecord) => {
          if (record.typeName !== 'binding') return record
          if (record.type !== 'cc-slide-layout') return record
          return {
            ...record,
            props: {
              ...getDefaultCCSlideLayoutBindingProps(),
              ...record.props,
            },
          }
        },
        down: (record: TLRecord) => {
          return record
        },
      },
    },
  },
  'cc-slide-content-binding': {
    firstVersion: 1,
    currentVersion: 1,
    migrators: {
      1: {
        up: (record: TLRecord) => {
          if (record.typeName !== 'binding') return record
          if (record.type !== 'cc-slide-content-binding') return record
          return {
            ...record,
            props: {
              placeholder: false,
              isMovingWithParent: false,
              ...record.props,
            },
          }
        },
        down: (record: TLRecord) => {
          return record
        },
      },
    },
  },
}

export const ccShapeMigrations = {
  base: {
    firstVersion: 1,
    currentVersion: 1,
    migrators: {
      1: {
        up: (record: TLRecord) => {
          if (record.typeName !== 'shape') return record
          const shape = record as TLShape
          if (shape.type !== 'cc-base') return record
          return {
            ...shape,
            props: {
              ...getDefaultCCBaseProps(),
              ...shape.props,
            },
          }
        },
        down: (record: TLRecord) => {
          return record
        },
      },
    },
  },

  calendar: {
    firstVersion: 1,
    currentVersion: 1,
    migrators: {
      1: {
        up: (record: TLRecord) => {
          if (record.typeName !== 'shape') return record
          const shape = record as TLShape
          if (shape.type !== 'cc-calendar') return record
          return {
            ...shape,
            props: {
              ...getDefaultCCCalendarProps(),
              ...shape.props,
            },
          }
        },
        down: (record: TLRecord) => {
          return record
        },
      },
    },
  },

  liveTranscription: {
    firstVersion: 1,
    currentVersion: 1,
    migrators: {
      1: {
        up: (record: TLRecord) => {
          if (record.typeName !== 'shape') return record
          const shape = record as TLShape
          if (shape.type !== 'cc-live-transcription') return record
          return {
            ...shape,
            props: {
              ...getDefaultCCLiveTranscriptionProps(),
              ...shape.props,
            },
          }
        },
        down: (record: TLRecord) => {
          return record
        },
      },
    },
  },

  settings: {
    firstVersion: 1,
    currentVersion: 1,
    migrators: {
      1: {
        up: (record: TLRecord) => {
          if (record.typeName !== 'shape') return record
          const shape = record as TLShape
          if (shape.type !== 'cc-settings') return record
          return {
            ...shape,
            props: {
              ...getDefaultCCSettingsProps(),
              ...shape.props,
            },
          }
        },
        down: (record: TLRecord) => {
          return record
        },
      },
    },
  },

  slideshow: {
    firstVersion: 1,
    currentVersion: 1,
    migrators: {
      1: {
        up: (record: TLRecord) => {
          if (record.typeName !== 'shape') return record
          const shape = record as TLShape
          if (shape.type !== 'cc-slideshow') return record
          return {
            ...shape,
            props: {
              ...getDefaultCCSlideShowProps(),
              ...shape.props,
            },
          }
        },
        down: (record: TLRecord) => {
          return record
        },
      },
    },
  },

  slide: {
    firstVersion: 1,
    currentVersion: 1,
    migrators: {
      1: {
        up: (record: TLRecord) => {
          if (record.typeName !== 'shape') return record
          const shape = record as TLShape
          if (shape.type !== 'cc-slide') return record
          return {
            ...shape,
            props: {
              ...getDefaultCCSlideProps(),
              ...shape.props,
            },
          }
        },
        down: (record: TLRecord) => {
          return record
        },
      },
    },
  },

  slideContent: {
    firstVersion: 1,
    currentVersion: 1,
    migrators: {
      1: {
        up: (record: TLRecord) => {
          if (record.typeName !== 'shape') return record
          const shape = record as TLShape
          if (shape.type !== 'cc-slide-content') return record
          return {
            ...shape,
            props: {
              ...getDefaultCCSlideContentProps(),
              ...shape.props,
            },
          }
        },
        down: (record: TLRecord) => {
          return record
        },
      },
    },
  },

  'cc-youtube-embed': {
    firstVersion: 1,
    currentVersion: 1,
    migrators: {
      1: {
        up: (record: TLRecord) => {
          if (record.typeName !== 'shape') return record
          const shape = record as TLShape
          if (shape.type !== 'cc-youtube-embed') return record
          return {
            ...shape,
            props: {
              ...getDefaultCCYoutubeEmbedProps(),
              ...shape.props,
            },
          }
        },
        down: (record: TLRecord) => {
          return record
        },
      },
    },
  },
} 