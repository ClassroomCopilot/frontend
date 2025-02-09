import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { TldrawUiButton } from '@tldraw/tldraw';
import PushPinIcon from '@mui/icons-material/PushPin';
import PushPinOutlinedIcon from '@mui/icons-material/PushPinOutlined';
import { CCShapesPanel } from './CCShapesPanel';
import { CCSlidesPanel } from './CCSlidesPanel';
import { CCYoutubePanel } from './CCYoutubePanel';
import { CCGraphPanel } from './CCGraphPanel';
import { CCGraphSchoolCalendarPanel } from './CCGraphSchoolCalendarPanel';
import { CCGraphSchoolTimetablePanel } from './CCGraphSchoolTimetablePanel';
import { CCGraphSchoolCurriculumPanel } from './CCGraphSchoolCurriculumPanel';
import { CCGraphTeacherCalendarPanel } from './CCGraphTeacherCalendarPanel';
import { CCGraphTeacherTimetablePanel } from './CCGraphTeacherTimetablePanel';
import { CCGraphTeacherCurriculumPanel } from './CCGraphTeacherCurriculumPanel';
import { CCGraphStudentCalendarPanel } from './CCGraphStudentCalendarPanel';
import { CCGraphStudentTimetablePanel } from './CCGraphStudentTimetablePanel';
import { CCGraphStudentCurriculumPanel } from './CCGraphStudentCurriculumPanel';
import { CCExamMarkerPanel } from './CCExamMarkerPanel';
import { CCSearchPanel } from './CCSearchPanel'
import { PANEL_DIMENSIONS, Z_INDICES } from './panel-styles';
import './panel.css';

export const PANEL_TYPES = {
  default: [
    { id: 'cc-shapes', label: 'Shapes' },
    { id: 'slides', label: 'Slides' },
    { id: 'youtube', label: 'YouTube' },
    { id: 'graph', label: 'Graph' },
    { id: 'search', label: 'Search' },
    { id: 'cc-graph-school-calendar', label: 'Calendar' },
    { id: 'cc-graph-school-timetable', label: 'Timetable' },
    { id: 'cc-graph-school-curriculum', label: 'Curriculum' },
    { id: 'cc-graph-teacher-calendar', label: 'Teacher Calendar' },
    { id: 'cc-graph-teacher-timetable', label: 'Teacher Timetable' },
    { id: 'cc-graph-teacher-curriculum', label: 'Teacher Curriculum' },
    { id: 'cc-graph-student-calendar', label: 'Student Calendar' },
    { id: 'cc-graph-student-timetable', label: 'Student Timetable' },
    { id: 'cc-graph-student-curriculum', label: 'Student Curriculum' },
  ],
  examMarker: [
    { id: 'exam-marker', label: 'Exam Marker' },
  ],
} as const;

export type PanelType = typeof PANEL_TYPES.default[number]['id'] | typeof PANEL_TYPES.examMarker[number]['id'];

interface BasePanelProps {
  initialPanelType?: PanelType;
  examMarkerProps?: React.ComponentProps<typeof CCExamMarkerPanel>;
  isExpanded?: boolean;
  isPinned?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  onPinnedChange?: (pinned: boolean) => void;
}

export const BasePanel: React.FC<BasePanelProps> = ({
  initialPanelType = 'cc-shapes',
  examMarkerProps,
  isExpanded: controlledIsExpanded,
  isPinned: controlledIsPinned,
  onExpandedChange,
  onPinnedChange,
}) => {
  const location = useLocation();
  const isExamMarkerRoute = location.pathname === '/exam-marker';
  const availablePanels = isExamMarkerRoute ? PANEL_TYPES.examMarker : PANEL_TYPES.default;
  
  const [currentPanelType, setCurrentPanelType] = React.useState<PanelType>(
    isExamMarkerRoute ? 'exam-marker' : initialPanelType
  );
  
  // Use controlled state if provided, otherwise use internal state
  const [internalIsExpanded, setInternalIsExpanded] = React.useState(false);
  const [internalIsPinned, setInternalIsPinned] = React.useState(false);
  
  const isExpanded = controlledIsExpanded ?? internalIsExpanded;
  const isPinned = controlledIsPinned ?? internalIsPinned;
  
  const handleExpandedChange = (expanded: boolean) => {
    setInternalIsExpanded(expanded);
    onExpandedChange?.(expanded);
  };
  
  const handlePinToggle = () => {
    const newPinned = !isPinned;
    setInternalIsPinned(newPinned);
    onPinnedChange?.(newPinned);
  };

  const panelRef = useRef<HTMLDivElement>(null);
  const dimensions = PANEL_DIMENSIONS[currentPanelType as keyof typeof PANEL_DIMENSIONS];

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Don't close if pinned
      if (isPinned) return;

      // Check if click is outside panel
      const isClickOutside = panelRef.current && !panelRef.current.contains(event.target as Node);
      
      // Check if click is not on a panel-related element
      const target = event.target as HTMLElement;
      const isPanelElement = target.closest('.panel-root, .panel-handle, .tlui-button');

      if (isClickOutside && !isPanelElement) {
        handleExpandedChange(false);
      }
    };

    if (isExpanded) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isExpanded, isPinned]);

  const renderCurrentPanel = () => {
    if (isExamMarkerRoute && currentPanelType === 'exam-marker') {
      return examMarkerProps ? <CCExamMarkerPanel {...examMarkerProps} /> : null;
    }

    switch (currentPanelType) {
      case 'cc-shapes':
        return <CCShapesPanel />;
      case 'slides':
        return <CCSlidesPanel />;
      case 'youtube':
        return <CCYoutubePanel />;
      case 'graph':
        return <CCGraphPanel />;
      case 'search':
        return <CCSearchPanel />;
      case 'cc-graph-school-calendar':
        return <CCGraphSchoolCalendarPanel />;
      case 'cc-graph-school-timetable':
        return <CCGraphSchoolTimetablePanel />;
      case 'cc-graph-school-curriculum':
        return <CCGraphSchoolCurriculumPanel />;
      case 'cc-graph-teacher-calendar':
        return <CCGraphTeacherCalendarPanel />;
      case 'cc-graph-teacher-timetable':
        return <CCGraphTeacherTimetablePanel />;
      case 'cc-graph-teacher-curriculum':
        return <CCGraphTeacherCurriculumPanel />;
      case 'cc-graph-student-calendar':
        return <CCGraphStudentCalendarPanel />;
      case 'cc-graph-student-timetable':
        return <CCGraphStudentTimetablePanel />;
      case 'cc-graph-student-curriculum':
        return <CCGraphStudentCurriculumPanel />;
      default:
        return null;
    }
  };

  return (
    <>
      {!isExpanded && (
        <div 
          className="panel-handle"
          onClick={() => handleExpandedChange(true)}
          onTouchEnd={(e) => {
            e.stopPropagation();
            handleExpandedChange(true);
          }}
        >
          ›
        </div>
      )}

      {isExpanded && (
        <div 
          ref={panelRef}
          className="panel-root"
          style={{
            top: dimensions.topOffset,
            height: `calc(100% - ${dimensions.bottomOffset})`,
            width: dimensions.width,
            zIndex: Z_INDICES.PANEL,
          }}
        >
          <div className="panel-header">
            <select 
              value={currentPanelType}
              onChange={(e) => setCurrentPanelType(e.target.value as PanelType)}
              className="panel-type-select"
            >
              {availablePanels.map(type => (
                <option 
                  key={type.id} 
                  value={type.id}
                  className="panel-type-option"
                >
                  {type.label}
                </option>
              ))}
            </select>
            
            <div className="panel-header-actions">
              <TldrawUiButton
                type="icon"
                onClick={handlePinToggle}
                className="pin-button"
              >
                {isPinned ? <PushPinIcon /> : <PushPinOutlinedIcon />}
              </TldrawUiButton>
            </div>
          </div>

          <div className="panel-content">
            {renderCurrentPanel()}
          </div>
        </div>
      )}
    </>
  );
};