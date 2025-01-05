import React from 'react'
import Modal from 'react-modal'
import { FaCheck, FaExternalLinkAlt } from 'react-icons/fa'
import { TeacherTimetableEvent } from '../../../../services/graph/timetableNeoDBService'
import { LoadingState } from '../../../../services/tldraw/snapshotService'
import { Editor } from '@tldraw/tldraw'
import logger from '../../../../debugConfig'
import { applicationButtonStyle, optionButtonStyle } from './styles'

// Common modal styles
const modalStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    padding: '20px',
    borderRadius: '8px',
    maxWidth: '500px',
    width: '90%',
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  }
}

// View Menu Component
interface ViewMenuProps {
  onSelect: (view: string) => void
  onClose: () => void
  optionButtonStyle: React.CSSProperties
  applicationButtonStyle: React.CSSProperties
}

const ViewMenu: React.FC<ViewMenuProps> = ({ onSelect, onClose, optionButtonStyle, applicationButtonStyle }) => {
  const views = [
    { name: 'Day', view: 'timeGridDay' },
    { name: 'Week', view: 'timeGridWeek' },
    { name: 'Month', view: 'dayGridMonth' },
    { name: 'Year', view: 'dayGridYear' },
    { name: 'List Day', view: 'listDay' },
    { name: 'List Week', view: 'listWeek' },
    { name: 'List Month', view: 'listMonth' },
    { name: 'List Year', view: 'listYear' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {views.map(({name, view}) => (
        <button key={view} onClick={() => onSelect(view)} style={optionButtonStyle}>
          {name}
        </button>
      ))}
      <button onClick={onClose} style={applicationButtonStyle}>Close</button>
    </div>
  )
}

// Class Filter Modal
interface ClassFilterModalProps {
  isOpen: boolean
  onClose: () => void
  subjectClasses: string[]
  selectedClasses: string[]
  onClassToggle: (subjectClass: string) => void
  events: TeacherTimetableEvent[]
}

export const ClassFilterModal: React.FC<ClassFilterModalProps> = ({
  isOpen,
  onClose,
  subjectClasses,
  selectedClasses,
  onClassToggle,
  events
}) => {
  const renderClassFilterButton = (subjectClass: string) => {
    const isSelected = selectedClasses.includes(subjectClass)
    const color = events.find(e => e.extendedProps?.subjectClass === subjectClass)?.extendedProps?.color || '#000000'
    
    return (
      <button
        key={subjectClass}
        style={{
          ...optionButtonStyle,
          backgroundColor: isSelected ? color : '#ffffff',
          color: isSelected ? '#ffffff' : '#000000',
          border: `2px solid ${color}`,
        }}
        onClick={() => onClassToggle(subjectClass)}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ marginRight: '8px' }}>
            {isSelected && <FaCheck />}
          </div>
          <span>{subjectClass}</span>
        </div>
      </button>
    )
  }

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Filter Classes"
      style={modalStyles}
    >
      <h2>Filter Classes</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {subjectClasses.map(renderClassFilterButton)}
      </div>
      <button style={applicationButtonStyle} onClick={onClose}>Close</button>
    </Modal>
  )
}

// View Menu Modal
interface ViewMenuModalProps {
  isOpen: boolean
  onClose: () => void
  onViewSelect: (view: string) => void
}

export const ViewMenuModal: React.FC<ViewMenuModalProps> = ({
  isOpen,
  onClose,
  onViewSelect
}) => (
  <Modal
    isOpen={isOpen}
    onRequestClose={onClose}
    contentLabel="Change View"
    style={modalStyles}
  >
    <h2>Select Calendar View</h2>
    <ViewMenu 
      onSelect={onViewSelect}
      onClose={onClose}
      optionButtonStyle={optionButtonStyle}
      applicationButtonStyle={applicationButtonStyle}
    />
  </Modal>
)

// Event Details Modal
interface EventDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  selectedEvent: TeacherTimetableEvent | null
  fileLoadingState: LoadingState
  editor: Editor
  workerDbName: string | undefined
  onOpenFile: (path: string, dbName: string, editor: Editor, setFileLoadingState: (state: LoadingState) => void) => void
  setFileLoadingState: (state: LoadingState) => void
}

export const EventDetailsModal: React.FC<EventDetailsModalProps> = ({
  isOpen,
  onClose,
  selectedEvent,
  fileLoadingState,
  editor,
  workerDbName,
  onOpenFile,
  setFileLoadingState
}) => {
  const handleOpenFile = () => {
    if (!selectedEvent?.extendedProps?.path || !workerDbName) {
      logger.error('calendar-shape', '❌ Failed to open tldraw file - missing path or db name')
      return
    }

    logger.warn('calendar-shape', '📂 Opening tldraw file using worker db', { 
      path: selectedEvent.extendedProps.path,
      db_name: workerDbName
    })

    onOpenFile(
      selectedEvent.extendedProps.path,
      workerDbName,
      editor,
      setFileLoadingState
    )
  }

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Event Details"
      style={modalStyles}
    >
      {selectedEvent && (
        <>
          <h2>{selectedEvent.title}</h2>
          <div style={{ marginBottom: '20px' }}>
            <p><strong>Start Time:</strong> {new Date(selectedEvent.start).toLocaleString()}</p>
            <p><strong>End Time:</strong> {new Date(selectedEvent.end).toLocaleString()}</p>
            <p><strong>Class:</strong> {selectedEvent.extendedProps?.subjectClass}</p>
            <p><strong>Period:</strong> {selectedEvent.extendedProps?.periodCode}</p>
            
            {fileLoadingState.status === 'loading' && <p>Loading file...</p>}
            {fileLoadingState.status === 'error' && (
              <p style={{color: 'red'}}>Error: {fileLoadingState.error}</p>
            )}
            
            {selectedEvent.extendedProps?.path && fileLoadingState.status !== 'loading' && (
              <button style={applicationButtonStyle} onClick={handleOpenFile}>
                Open Tldraw File <FaExternalLinkAlt style={{ marginLeft: '8px' }} />
              </button>
            )}
          </div>
          <button style={applicationButtonStyle} onClick={onClose}>Close</button>
        </>
      )}
    </Modal>
  )
} 