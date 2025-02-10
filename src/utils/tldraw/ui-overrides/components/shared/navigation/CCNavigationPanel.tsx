import React, { useEffect } from 'react';
import { Box, Typography, ListItemText, ListItemIcon, styled, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import {
  AccountCircle as AccountCircleIcon,
  CalendarToday as CalendarIcon,
  School as TeachingIcon,
  Business as BusinessIcon,
  AccountTree as DepartmentIcon,
  Class as ClassIcon,
  Dashboard as DashboardIcon,
  Settings as SettingsIcon,
  History as HistoryIcon,
  Book as JournalIcon,
  Event as PlannerIcon,
  ViewDay as DayIcon,
  ViewWeek as WeekIcon,
  ViewModule as MonthIcon,
  ViewAgenda as YearIcon,
  Schedule as TimetableIcon,
  Group as StaffIcon,
  School as TeachersIcon,
  MenuBook as SubjectsIcon,
} from '@mui/icons-material';
import { useTLDraw } from '../../../../../../contexts/TLDrawContext';
import {
  BaseContext,
  ExtendedContext,
  ViewContext,
  ViewDefinition,
  CalendarExtendedContext,
  TeacherExtendedContext
} from '../../../../../../types/navigation';
import { NAVIGATION_CONTEXTS } from '../../../../../../config/navigationContexts';
import { useNavigationStore } from '../../../../../../stores/navigationStore';
import { useNeo4j } from '../../../../../../contexts/Neo4jContext';
import { CalendarNavigation } from '../../../../../../components/navigation/extended/CalendarNavigation';
import { TeacherNavigation } from '../../../../../../components/navigation/extended/TeacherNavigation';

const PanelContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  padding: theme.spacing(2),
  gap: theme.spacing(2),
  overflow: 'auto',
  transition: theme.transitions.create('background-color', {
    duration: theme.transitions.duration.standard,
  }),
}));

const StyledSelect = styled(Select)(({ theme }) => ({
  '& .MuiSelect-select': {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    transition: theme.transitions.create(['background-color', 'box-shadow'], {
      duration: theme.transitions.duration.shorter,
    }),
  },
  '&:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: theme.palette.primary.main,
  },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderColor: theme.palette.primary.main,
  },
  '& .MuiSvgIcon-root': {
    transition: theme.transitions.create('transform', {
      duration: theme.transitions.duration.shortest,
    }),
  },
  '&:hover .MuiSvgIcon-root': {
    transform: 'scale(1.1)',
  },
}));

const StyledMenuItem = styled(MenuItem, {
  shouldForwardProp: prop => prop !== 'isDarkMode'
})<{ isDarkMode?: boolean }>(({ theme, isDarkMode }) => ({
  gap: theme.spacing(1),
  transition: theme.transitions.create(['background-color', 'color'], {
    duration: theme.transitions.duration.shortest,
  }),
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
    '& .MuiListItemIcon-root': {
      color: theme.palette.primary.main,
      transform: 'scale(1.1)',
    },
    '& .MuiSvgIcon-root': {
      transform: 'scale(1.1)',
    },
  },
  '& .MuiListItemIcon-root': {
    color: isDarkMode ? theme.palette.text.primary : theme.palette.text.secondary,
    minWidth: '40px',
    '& .MuiSvgIcon-root': {
      fontSize: '1.25rem',
      transition: theme.transitions.create('transform', {
        duration: theme.transitions.duration.shortest,
      }),
    },
  },
  '&.Mui-selected': {
    '& .MuiListItemIcon-root': {
      color: theme.palette.primary.main,
    },
    '&:hover': {
      backgroundColor: theme.palette.action.selected,
    },
  },
}));

interface CCNavigationPanelProps {
  currentContext: BaseContext;
  onContextChange: (context: BaseContext) => void;
  currentExtendedContext?: ViewContext;
  onExtendedContextChange?: (context: ViewContext) => void;
}

export const CCNavigationPanel: React.FC<CCNavigationPanelProps> = ({
  currentContext,
  onContextChange,
  currentExtendedContext,
  onExtendedContextChange,
}) => {
  const { tldrawPreferences } = useTLDraw();
  const isDarkMode = tldrawPreferences?.colorScheme === 'dark';

  const {
    context: navigationContext,
    setBaseContext,
    setExtendedContext,
    isLoading,
    error,
  } = useNavigationStore();

  const { userDbName, workerDbName } = useNeo4j();

  const getDefaultViewForContext = (context: BaseContext): ViewContext => {
    switch (context) {
      case 'calendar':
        return 'overview';
      case 'teaching':
        return 'overview';
      case 'school':
        return 'overview';
      case 'department':
        return 'overview';
      case 'class':
        return 'overview';
      default:
        return 'overview';
    }
  };

  const isValidExtendedContextForBase = (extendedContext: ExtendedContext, baseContext: BaseContext): boolean => {
    const contextDef = NAVIGATION_CONTEXTS[baseContext];
    return contextDef?.views?.some(view => view.id === extendedContext) ?? false;
  };

  // Sync with navigation store's main context
  useEffect(() => {
    if (navigationContext.main !== 'profile' && navigationContext.main !== 'institute') {
      return;
    }
    
    const contextDef = NAVIGATION_CONTEXTS[navigationContext.base];
    if (!contextDef) return;

    // Update local state to match navigation store
    if (navigationContext.base !== currentContext) {
      onContextChange(navigationContext.base);
      
      // When base context changes, set appropriate default view
      const defaultView = getDefaultViewForContext(navigationContext.base);
      if (isValidViewContext(defaultView)) {
        onExtendedContextChange?.(defaultView);
      }
    }

    // If current extended context is not valid for this base context, reset to default
    if (currentExtendedContext && !isValidExtendedContextForBase(currentExtendedContext, navigationContext.base)) {
      const defaultView = getDefaultViewForContext(navigationContext.base);
      if (isValidViewContext(defaultView)) {
        onExtendedContextChange?.(defaultView);
      }
    }
  }, [navigationContext.main, navigationContext.base, currentContext, currentExtendedContext, onContextChange, onExtendedContextChange]);

  const handleContextChange = async (newContext: BaseContext) => {
    try {
      // First update the store
      await setBaseContext(newContext, userDbName, workerDbName);
      
      // Then update local state
      onContextChange(newContext);
      
      // Set appropriate default view for the new context
      const defaultView = getDefaultViewForContext(newContext);
      if (isValidViewContext(defaultView)) {
        // Update store first
        await setExtendedContext(defaultView, userDbName, workerDbName);
        // Then update local state
        onExtendedContextChange?.(defaultView);
      }
    } catch (error) {
      console.error('Failed to change context:', error);
    }
  };

  const handleExtendedContextChange = async (newContext: ViewContext) => {
    try {
      // Validate that the new context is valid for current base context
      if (!isValidExtendedContextForBase(newContext, currentContext)) {
        console.warn(`Invalid extended context ${newContext} for base context ${currentContext}`);
        return;
      }

      // Update store first
      await setExtendedContext(newContext, userDbName, workerDbName);
      // Then update local state
      onExtendedContextChange?.(newContext);
    } catch (error) {
      console.error('Failed to change extended context:', error);
    }
  };

  // Add helper function to validate ViewContext
  const isValidViewContext = (context: ExtendedContext): context is ViewContext => {
    const validViewContexts: ViewContext[] = [
      // Common views
      'overview',
      // User views
      'settings', 'history', 'journal', 'planner',
      // Calendar views
      'day', 'week', 'month', 'year',
      // Teaching views
      'timetable', 'classes', 'lessons',
      // School views
      'departments', 'staff',
      // Department views
      'teachers', 'subjects',
      // Class views
      'students'
    ];
    return validViewContexts.includes(context as ViewContext);
  };

  const getContextIcon = (contextType: string) => {
    switch (contextType) {
      case 'profile':
        return <AccountCircleIcon />;
      case 'calendar':
        return <CalendarIcon />;
      case 'teaching':
        return <TeachingIcon />;
      case 'school':
        return <BusinessIcon />;
      case 'department':
        return <DepartmentIcon />;
      case 'class':
        return <ClassIcon />;
      case 'overview':
        return <DashboardIcon />;
      case 'settings':
        return <SettingsIcon />;
      case 'history':
        return <HistoryIcon />;
      case 'journal':
        return <JournalIcon />;
      case 'planner':
        return <PlannerIcon />;
      case 'day':
        return <DayIcon />;
      case 'week':
        return <WeekIcon />;
      case 'month':
        return <MonthIcon />;
      case 'year':
        return <YearIcon />;
      case 'timetable':
        return <TimetableIcon />;
      case 'staff':
        return <StaffIcon />;
      case 'teachers':
        return <TeachersIcon />;
      case 'subjects':
        return <SubjectsIcon />;
      default:
        return <AccountCircleIcon />;
    }
  };

  const renderContextDropdown = () => {
    const items = navigationContext.main === 'profile' ? [
      { id: 'profile', label: 'Profile' },
      { id: 'calendar', label: 'Calendar' },
      { id: 'teaching', label: 'Teaching' }
    ] : [
      { id: 'school', label: 'School' },
      { id: 'department', label: 'Department' },
      { id: 'class', label: 'Class' }
    ];

    return (
      <FormControl fullWidth variant="outlined" size="small">
        <InputLabel>Context</InputLabel>
        <StyledSelect
          value={currentContext}
          onChange={(e) => handleContextChange(e.target.value as BaseContext)}
          label="Context"
        >
          {items.map(item => (
            <StyledMenuItem key={item.id} value={item.id} isDarkMode={isDarkMode}>
              <ListItemIcon>
                {getContextIcon(item.id)}
              </ListItemIcon>
              <ListItemText primary={item.label} />
            </StyledMenuItem>
          ))}
        </StyledSelect>
      </FormControl>
    );
  };

  const renderExtendedContextDropdown = () => {
    const contextDef = NAVIGATION_CONTEXTS[currentContext];
    if (!contextDef?.views?.length) return null;

    return (
      <FormControl fullWidth variant="outlined" size="small">
        <InputLabel>View</InputLabel>
        <StyledSelect
          value={currentExtendedContext || contextDef.views[0].id}
          onChange={(e) => handleExtendedContextChange(e.target.value as ViewContext)}
          label="View"
        >
          {contextDef.views.map((view: ViewDefinition) => (
            <StyledMenuItem key={view.id} value={view.id} isDarkMode={isDarkMode}>
              <ListItemIcon>
                {getContextIcon(view.id)}
              </ListItemIcon>
              <ListItemText 
                primary={view.label}
                secondary={view.description}
              />
            </StyledMenuItem>
          ))}
        </StyledSelect>
      </FormControl>
    );
  };

  const renderContextSpecificNavigation = () => {
    if (!currentExtendedContext) return null;

    switch (currentContext) {
      case 'calendar':
        return (
          <CalendarNavigation
            activeView={currentExtendedContext as CalendarExtendedContext}
            onViewChange={(view) => handleExtendedContextChange(view)}
          />
        );
      case 'teaching':
        return (
          <TeacherNavigation
            activeView={currentExtendedContext as TeacherExtendedContext}
            onViewChange={(view) => handleExtendedContextChange(view)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <PanelContainer>
      {renderContextDropdown()}
      {renderExtendedContextDropdown()}
      {renderContextSpecificNavigation()}
      
      {error && (
        <Typography color="error" variant="body2" sx={{ mt: 2 }}>
          {error}
        </Typography>
      )}
      
      {isLoading && (
        <Typography variant="body2" sx={{ mt: 2 }}>
          Loading...
        </Typography>
      )}
    </PanelContainer>
  );
};
