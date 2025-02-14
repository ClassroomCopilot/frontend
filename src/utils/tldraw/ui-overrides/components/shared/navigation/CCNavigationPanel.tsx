import React, { useEffect, useMemo } from 'react';
import { Box, Typography, ListItemText, ListItemIcon, styled, Select, MenuItem, FormControl, InputLabel, ThemeProvider, createTheme, useMediaQuery } from '@mui/material';
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
import { useNeoUser } from '../../../../../../contexts/NeoUserContext';
import { CalendarNavigation } from '../../../../../../components/navigation/extended/CalendarNavigation';
import { TeacherNavigation } from '../../../../../../components/navigation/extended/TeacherNavigation';
import { useTLDraw } from '../../../../../../contexts/TLDrawContext';
import { logger } from '../../../../../../debugConfig';

const PanelContainer = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  padding: '16px',
  gap: '16px',
  overflow: 'auto',
  color: 'var(--color-text)',
}));

const menuProps = {
  PaperProps: {
    elevation: 8,
    sx: {
      border: '1px solid var(--color-divider)',
      boxShadow: 'var(--shadow-popup)',
    },
  },
};

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
  const {
    context: navigationContext,
    setBaseContext,
    setExtendedContext,
    isLoading,
    error,
  } = useNavigationStore();

  const { userDbName, workerDbName } = useNeoUser();
  const { tldrawPreferences } = useTLDraw();
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  
  // Create a dynamic theme based on TLDraw preferences
  const theme = useMemo(() => {
    let mode: 'light' | 'dark';
    
    // Determine mode based on TLDraw preferences
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
    logger.debug('navigation-panel', '🔄 Starting context change', {
      from: currentContext,
      to: newContext
    });

    try {
      // Get default view for new context
      const defaultView = getDefaultViewForContext(newContext);
      logger.debug('navigation-panel', '📍 Determined default view', {
        context: newContext,
        defaultView
      });

      // Use unified context switch with both base and extended contexts
      const contextUpdate = {
        base: newContext,
        extended: isValidViewContext(defaultView) ? defaultView : undefined
      };
      
      logger.debug('navigation-panel', '🚀 Initiating context switch', contextUpdate);
      
      await setBaseContext(newContext, userDbName, workerDbName);
      
      logger.debug('navigation-panel', '✅ Context switch successful', {
        context: newContext,
        view: defaultView
      });

      // Update local state
      onContextChange(newContext);
      if (isValidViewContext(defaultView)) {
        await setExtendedContext(defaultView, userDbName, workerDbName);
        onExtendedContextChange?.(defaultView);
      }
    } catch (error) {
      logger.error('navigation-panel', '❌ Failed to change context', {
        error,
        attemptedContext: newContext
      });
      console.error('Failed to change context:', error);
    }
  };

  const handleExtendedContextChange = async (newContext: ViewContext) => {
    logger.debug('navigation-panel', '🔄 Starting extended context change', {
      from: currentExtendedContext,
      to: newContext
    });

    try {
      // Validate that the new context is valid for current base context
      if (!isValidExtendedContextForBase(newContext, currentContext)) {
        logger.warn('navigation-panel', '⚠️ Invalid extended context combination', {
          baseContext: currentContext,
          attemptedExtendedContext: newContext
        });
        return;
      }

      const contextUpdate = { extended: newContext };
      logger.debug('navigation-panel', '🚀 Initiating extended context switch', contextUpdate);

      // Use unified context switch for extended context only
      await setExtendedContext(newContext, userDbName, workerDbName);
      
      logger.debug('navigation-panel', '✅ Extended context switch successful', {
        newView: newContext
      });

      // Update local state
      onExtendedContextChange?.(newContext);
    } catch (error) {
      logger.error('navigation-panel', '❌ Failed to change extended context', {
        error,
        attemptedContext: newContext
      });
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
    const iconProps = { 
      sx: { 
        color: 'var(--color-text)',
      } 
    };
    
    switch (contextType) {
      case 'profile':
        return <AccountCircleIcon {...iconProps} />;
      case 'calendar':
        return <CalendarIcon {...iconProps} />;
      case 'teaching':
        return <TeachingIcon {...iconProps} />;
      case 'school':
        return <BusinessIcon {...iconProps} />;
      case 'department':
        return <DepartmentIcon {...iconProps} />;
      case 'class':
        return <ClassIcon {...iconProps} />;
      case 'overview':
        return <DashboardIcon {...iconProps} />;
      case 'settings':
        return <SettingsIcon {...iconProps} />;
      case 'history':
        return <HistoryIcon {...iconProps} />;
      case 'journal':
        return <JournalIcon {...iconProps} />;
      case 'planner':
        return <PlannerIcon {...iconProps} />;
      case 'day':
        return <DayIcon {...iconProps} />;
      case 'week':
        return <WeekIcon {...iconProps} />;
      case 'month':
        return <MonthIcon {...iconProps} />;
      case 'year':
        return <YearIcon {...iconProps} />;
      case 'timetable':
        return <TimetableIcon {...iconProps} />;
      case 'staff':
        return <StaffIcon {...iconProps} />;
      case 'teachers':
        return <TeachersIcon {...iconProps} />;
      case 'subjects':
        return <SubjectsIcon {...iconProps} />;
      default:
        return <AccountCircleIcon {...iconProps} />;
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
      <ThemeProvider theme={theme}>
        <FormControl fullWidth variant="outlined" size="small">
          <InputLabel>Context</InputLabel>
          <Select
            value={currentContext}
            onChange={(e) => handleContextChange(e.target.value as BaseContext)}
            label="Context"
            MenuProps={menuProps}
          >
            {items.map(item => (
              <MenuItem key={item.id} value={item.id}>
                <ListItemIcon>
                  {getContextIcon(item.id)}
                </ListItemIcon>
                <ListItemText primary={item.label} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </ThemeProvider>
    );
  };

  const renderExtendedContextDropdown = () => {
    const contextDef = NAVIGATION_CONTEXTS[currentContext];
    if (!contextDef?.views?.length) return null;

    return (
      <ThemeProvider theme={theme}>
        <FormControl fullWidth variant="outlined" size="small">
          <InputLabel>View</InputLabel>
          <Select
            value={currentExtendedContext || contextDef.views[0].id}
            onChange={(e) => handleExtendedContextChange(e.target.value as ViewContext)}
            label="View"
            MenuProps={menuProps}
          >
            {contextDef.views.map((view: ViewDefinition) => (
              <MenuItem key={view.id} value={view.id}>
                <ListItemIcon>
                  {getContextIcon(view.id)}
                </ListItemIcon>
                <ListItemText 
                  primary={view.label}
                  secondary={view.description}
                />
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </ThemeProvider>
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
    <ThemeProvider theme={theme}>
      <PanelContainer>
        {renderContextDropdown()}
        {renderExtendedContextDropdown()}
        {renderContextSpecificNavigation()}
        
        {error && (
          <Typography 
            variant="body2" 
            sx={{ 
              mt: 2,
              color: 'var(--color-error)'
            }}
          >
            {error}
          </Typography>
        )}
        
        {isLoading && (
          <Typography 
            variant="body2" 
            sx={{ 
              mt: 2,
              color: 'var(--color-text-secondary)'
            }}
          >
            Loading...
          </Typography>
        )}
      </PanelContainer>
    </ThemeProvider>
  );
};
