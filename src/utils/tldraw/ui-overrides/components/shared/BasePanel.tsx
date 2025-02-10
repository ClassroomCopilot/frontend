import React, { useEffect, useRef, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { TldrawUiButton } from '@tldraw/tldraw';
import { 
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  styled,
  ThemeProvider,
  createTheme,
  useMediaQuery
} from '@mui/material';
import {
  PushPin as PushPinIcon,
  PushPinOutlined as PushPinOutlinedIcon,
  ExpandMore as ExpandMoreIcon,
  Category as ShapesIcon,
  Slideshow as SlidesIcon,
  YouTube as YouTubeIcon,
  AccountTree as GraphIcon,
  Search as SearchIcon,
  Navigation as NavigationIcon,
  Save as NodeIcon,
  Assignment as ExamIcon
} from '@mui/icons-material';
import { CCShapesPanel } from './CCShapesPanel';
import { CCSlidesPanel } from './CCSlidesPanel';
import { CCYoutubePanel } from './CCYoutubePanel';
import { CCGraphPanel } from './CCGraphPanel';
import { CCExamMarkerPanel } from './CCExamMarkerPanel';
import { CCSearchPanel } from './CCSearchPanel'
import { PANEL_DIMENSIONS, Z_INDICES } from './panel-styles';
import './panel.css';
import { CCNavigationPanel } from './navigation/CCNavigationPanel';
import { BaseContext, ViewContext } from '../../../../../types/navigation';
import { CCNodeSnapshotPanel } from './navigation/CCNodeSnapshotPanel';
import { useTLDraw } from '../../../../../contexts/TLDrawContext';

export const PANEL_TYPES = {
  default: [
    { id: 'navigation', label: 'Navigation', order: 10 },
    { id: 'node-snapshot', label: 'Node', order: 20 },
    { id: 'cc-shapes', label: 'Shapes', order: 30 },
    { id: 'slides', label: 'Slides', order: 40 },
    { id: 'youtube', label: 'YouTube', order: 50 },
    { id: 'graph', label: 'Graph', order: 60 },
    { id: 'search', label: 'Search', order: 70 },
  ],
  examMarker: [
    { id: 'exam-marker', label: 'Exam Marker', order: 10 },
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
  currentContext?: BaseContext;
  onContextChange?: (context: BaseContext) => void;
  currentExtendedContext?: ViewContext;
  onExtendedContextChange?: (context: ViewContext) => void;
  isMenuOpen?: boolean;
  onMenuOpenChange?: (open: boolean) => void;
}

const PanelTypeButton = styled(Button)(() => ({
  textTransform: 'none',
  padding: '6px 12px',
  gap: '8px',
  backgroundColor: 'var(--color-panel)',
  color: 'var(--color-text)',
  border: '1px solid transparent',
  transition: 'border-color 200ms ease',
  justifyContent: 'space-between',
  minWidth: '200px',
  '&:hover': {
    backgroundColor: 'var(--color-panel)',
    borderColor: 'var(--color-text)',
  },
  '& .MuiSvgIcon-root': {
    fontSize: '1.25rem',
    color: 'inherit',
  }
}));

const StyledMenuItem = styled(MenuItem)(() => ({
  gap: '8px',
  padding: '8px 16px',
  transition: 'background-color 200ms ease',
  '&:hover': {
    backgroundColor: 'var(--color-hover)',
    '& .MuiListItemIcon-root': {
      color: 'var(--color-selected)',
    }
  },
  '& .MuiListItemIcon-root': {
    color: 'var(--color-text)',
    minWidth: '32px',
    transition: 'color 200ms ease',
    '& .MuiSvgIcon-root': {
      fontSize: '1.25rem',
    }
  }
}));

export const BasePanel: React.FC<BasePanelProps> = ({
  initialPanelType = 'cc-shapes',
  examMarkerProps,
  isExpanded: controlledIsExpanded,
  isPinned: controlledIsPinned,
  onExpandedChange,
  onPinnedChange,
  currentContext = 'profile',
  onContextChange = () => {},
  currentExtendedContext,
  onExtendedContextChange = () => {},
  isMenuOpen = false,
  onMenuOpenChange = () => {},
}) => {
  const location = useLocation();
  const { tldrawPreferences } = useTLDraw();
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const [menuAnchorEl, setMenuAnchorEl] = React.useState<null | HTMLElement>(null);
  
  // Create a dynamic theme based on TLDraw preferences
  const theme = useMemo(() => {
    let mode: 'light' | 'dark';
    
    if (tldrawPreferences?.colorScheme === 'system') {
      mode = prefersDarkMode ? 'dark' : 'light';
    } else {
      mode = tldrawPreferences?.colorScheme === 'dark' ? 'dark' : 'light';
    }

    return createTheme({
      palette: {
        mode,
        divider: 'var(--color-divider)',
      },
    });
  }, [tldrawPreferences?.colorScheme, prefersDarkMode]);

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

  const getIconForPanel = (panelId: PanelType) => {
    switch (panelId) {
      case 'cc-shapes':
        return <ShapesIcon />;
      case 'slides':
        return <SlidesIcon />;
      case 'youtube':
        return <YouTubeIcon />;
      case 'graph':
        return <GraphIcon />;
      case 'search':
        return <SearchIcon />;
      case 'navigation':
        return <NavigationIcon />;
      case 'node-snapshot':
        return <NodeIcon />;
      case 'exam-marker':
        return <ExamIcon />;
      default:
        return <ShapesIcon />;
    }
  };

  const getDescriptionForPanel = (panelId: PanelType) => {
    switch (panelId) {
      case 'cc-shapes':
        return 'Add shapes and elements to your canvas';
      case 'slides':
        return 'Manage presentation slides';
      case 'youtube':
        return 'Embed YouTube videos';
      case 'graph':
        return 'View and manage graph connections';
      case 'search':
        return 'Search through your content';
      case 'navigation':
        return 'Navigate through different contexts';
      case 'node-snapshot':
        return 'Manage node snapshots';
      case 'exam-marker':
        return 'Mark and grade exams';
      default:
        return '';
    }
  };

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
      case 'navigation':
        return <CCNavigationPanel 
          currentContext={currentContext}
          onContextChange={onContextChange}
          currentExtendedContext={currentExtendedContext}
          onExtendedContextChange={onExtendedContextChange}
        />;
      case 'node-snapshot':
        return <CCNodeSnapshotPanel />;
      default:
        return null;
    }
  };

  // Handle menu button click
  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchorEl(event.currentTarget);
    onMenuOpenChange(true);
  };

  // Handle menu close
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    onMenuOpenChange(false);
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
            <ThemeProvider theme={theme}>
              <PanelTypeButton
                onClick={handleMenuClick}
                endIcon={<ExpandMoreIcon />}
                startIcon={getIconForPanel(currentPanelType)}
              >
                {availablePanels.find(p => p.id === currentPanelType)?.label}
              </PanelTypeButton>

              <Menu
                anchorEl={menuAnchorEl}
                open={isMenuOpen}
                onClose={handleMenuClose}
                PaperProps={{
                  elevation: 8,
                  sx: {
                    border: '1px solid var(--color-divider)',
                    boxShadow: 'var(--shadow-popup)',
                  }
                }}
              >
                {[...availablePanels]
                  .sort((a, b) => a.order - b.order)
                  .map(type => (
                  <StyledMenuItem
                    key={type.id}
                    onClick={() => {
                      setCurrentPanelType(type.id as PanelType);
                      handleMenuClose();
                    }}
                    selected={currentPanelType === type.id}
                  >
                    <ListItemIcon>
                      {getIconForPanel(type.id as PanelType)}
                    </ListItemIcon>
                    <ListItemText 
                      primary={type.label}
                      secondary={getDescriptionForPanel(type.id as PanelType)}
                      primaryTypographyProps={{
                        sx: { color: 'var(--color-text)' }
                      }}
                      secondaryTypographyProps={{
                        sx: { color: 'var(--color-text-secondary)' }
                      }}
                    />
                  </StyledMenuItem>
                ))}
              </Menu>
            </ThemeProvider>

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