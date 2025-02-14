import React, { useState, useCallback, useEffect, useRef } from 'react';
import { 
    IconButton, 
    Tooltip, 
    Box, 
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText,
    Button,
    styled
} from '@mui/material';
import { 
    ArrowBack as ArrowBackIcon,
    ArrowForward as ArrowForwardIcon,
    History as HistoryIcon,
    School as SchoolIcon,
    Person as PersonIcon,
    AccountCircle as AccountCircleIcon,
    CalendarToday as CalendarIcon,
    School as TeachingIcon,
    Business as BusinessIcon,
    AccountTree as DepartmentIcon,
    Class as ClassIcon,
    ExpandMore as ExpandMoreIcon
} from '@mui/icons-material';
import { useNavigationStore } from '../../stores/navigationStore';
import { useNeoUser } from '../../contexts/NeoUserContext';
import { NAVIGATION_CONTEXTS } from '../../config/navigationContexts';
import { 
    BaseContext,
    ViewContext
} from '../../types/navigation';
import { logger } from '../../debugConfig';

const NavigationRoot = styled(Box)`
  display: flex;
  align-items: center;
  gap: 8px;
  height: 100%;
  overflow: hidden;
`;

const NavigationControls = styled(Box)`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const ContextToggleContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    backgroundColor: theme.palette.action.hover,
    borderRadius: theme.shape.borderRadius,
    padding: theme.spacing(0.5),
    gap: theme.spacing(0.5),
    '& .button-label': {
        '@media (max-width: 500px)': {
            display: 'none'
        }
    }
}));

const ContextToggleButton = styled(Button, {
    shouldForwardProp: (prop) => prop !== 'active'
})<{ active?: boolean }>(({ theme, active }) => ({
    minWidth: 0,
    padding: theme.spacing(0.5, 1.5),
    borderRadius: theme.shape.borderRadius,
    backgroundColor: active ? theme.palette.primary.main : 'transparent',
    color: active ? theme.palette.primary.contrastText : theme.palette.text.primary,
    textTransform: 'none',
    transition: theme.transitions.create(['background-color', 'color'], {
        duration: theme.transitions.duration.shorter,
    }),
    '&:hover': {
        backgroundColor: active ? theme.palette.primary.dark : theme.palette.action.hover,
    },
    '@media (max-width: 500px)': {
        padding: theme.spacing(0.5),
    }
}));

export const GraphNavigator: React.FC = () => {
    const {
        context,
        switchContext,
        goBack,
        goForward,
        isLoading
    } = useNavigationStore();

    const { userDbName, workerDbName, isInitialized: isNeoUserInitialized } = useNeoUser();

    const [contextMenuAnchor, setContextMenuAnchor] = useState<null | HTMLElement>(null);
    const [historyMenuAnchor, setHistoryMenuAnchor] = useState<null | HTMLElement>(null);
    const rootRef = useRef<HTMLDivElement>(null);
    const [availableWidth, setAvailableWidth] = useState<number>(0);

    useEffect(() => {
        const calculateAvailableSpace = () => {
            if (!rootRef.current) return;
            
            // Get the header element
            const header = rootRef.current.closest('.MuiToolbar-root');
            if (!header) return;

            // Get the title and menu elements
            const title = header.querySelector('.app-title');
            const menu = header.querySelector('.menu-button');
            
            if (!title || !menu) return;

            // Calculate available width
            const headerWidth = header.clientWidth;
            const titleWidth = title.clientWidth;
            const menuWidth = menu.clientWidth;
            const padding = 48; // Increased buffer space
            
            const newAvailableWidth = headerWidth - titleWidth - menuWidth - padding;
            console.log('Available width:', newAvailableWidth); // Debug log
            setAvailableWidth(newAvailableWidth);
        };

        // Set up ResizeObserver
        const resizeObserver = new ResizeObserver(() => {
            // Use requestAnimationFrame to debounce calculations
            window.requestAnimationFrame(calculateAvailableSpace);
        });

        // Observe both the root element and the header
        if (rootRef.current) {
            const header = rootRef.current.closest('.MuiToolbar-root');
            if (header) {
                resizeObserver.observe(header);
                resizeObserver.observe(rootRef.current);
            }
        }

        // Initial calculation
        calculateAvailableSpace();

        return () => {
            resizeObserver.disconnect();
        };
    }, []);

    // Helper function to determine what should be visible
    const getVisibility = () => {
        // Adjusted thresholds and collapse order:
        // 1. Navigation controls (back/forward/history) collapse first
        // 2. Toggle labels collapse second
        // 3. Context label collapses last
        if (availableWidth < 300) {
            return {
                navigation: false,
                contextLabel: true,  // Keep context label visible longer
                toggleLabels: false
            };
        } else if (availableWidth < 450) {
            return {
                navigation: false,
                contextLabel: true,  // Keep context label visible
                toggleLabels: true
            };
        } else if (availableWidth < 600) {
            return {
                navigation: true,
                contextLabel: true,
                toggleLabels: true
            };
        }
        return {
            navigation: true,
            contextLabel: true,
            toggleLabels: true
        };
    };

    const visibility = getVisibility();

    const handleHistoryClick = (event: React.MouseEvent<HTMLElement>) => {
        setHistoryMenuAnchor(event.currentTarget);
    };

    const handleHistoryClose = () => {
        setHistoryMenuAnchor(null);
    };

    const handleHistoryItemClick = (index: number) => {
        const {currentIndex} = context.history;
        const steps = index - currentIndex;
        
        if (steps < 0) {
            for (let i = 0; i < -steps; i++) {
                goBack();
            }
        } else if (steps > 0) {
            for (let i = 0; i < steps; i++) {
                goForward();
            }
        }
        
        handleHistoryClose();
    };

    const handleContextChange = useCallback(async (newContext: BaseContext) => {
        try {
            // Check if trying to access institute contexts without worker database
            if (['school', 'department', 'class'].includes(newContext) && !workerDbName) {
                logger.error('navigation', '❌ Cannot switch to institute context: missing worker database');
                return;
            }
            // Check if trying to access profile contexts without user database
            if (['profile', 'calendar', 'teaching'].includes(newContext) && !userDbName) {
                logger.error('navigation', '❌ Cannot switch to profile context: missing user database');
                return;
            }

            logger.debug('navigation', '🔄 Changing main context', {
                from: context.main,
                to: newContext,
                userDbName,
                workerDbName
            });

            // Get default view for new context
            const defaultView = getDefaultViewForContext(newContext);
            
            // Use unified context switch with both base and extended contexts
            await switchContext({ 
                main: ['profile', 'calendar', 'teaching'].includes(newContext) ? 'profile' : 'institute',
                base: newContext,
                extended: defaultView,
                skipBaseContextLoad: false
            }, userDbName, workerDbName);

        } catch (error) {
            logger.error('navigation', '❌ Failed to change context:', error);
        }
    }, [context.main, switchContext, userDbName, workerDbName]);

    // Helper function to get default view for a context
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

    const handleContextMenu = (event: React.MouseEvent<HTMLElement>) => {
        setContextMenuAnchor(event.currentTarget);
    };

    const handleContextSelect = useCallback(async (context: BaseContext) => {
        setContextMenuAnchor(null);
        try {
            // Use unified context switch with both base and extended contexts
            const contextDef = NAVIGATION_CONTEXTS[context];
            const defaultExtended = contextDef?.views[0]?.id;
            
            await switchContext({ 
                base: context,
                extended: defaultExtended 
            }, userDbName, workerDbName);
        } catch (error) {
            logger.error('navigation', '❌ Failed to select context:', error);
        }
    }, [switchContext, userDbName, workerDbName]);

    const getContextItems = useCallback(() => {
        if (context.main === 'profile') {
            return [
                { id: 'profile', label: 'Profile', icon: AccountCircleIcon },
                { id: 'calendar', label: 'Calendar', icon: CalendarIcon },
                { id: 'teaching', label: 'Teaching', icon: TeachingIcon },
            ];
        } else {
            return [
                { id: 'school', label: 'School', icon: BusinessIcon },
                { id: 'department', label: 'Department', icon: DepartmentIcon },
                { id: 'class', label: 'Class', icon: ClassIcon },
            ];
        }
    }, [context.main]);

    const getContextIcon = useCallback((contextType: string) => {
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
            default:
                return <AccountCircleIcon />;
        }
    }, []);

    const isDisabled = !isNeoUserInitialized || isLoading;
    const { history } = context;
    const canGoBack = history.currentIndex > 0;
    const canGoForward = history.currentIndex < history.nodes.length - 1;

    return (
        <NavigationRoot ref={rootRef}>
            <NavigationControls sx={{ display: visibility.navigation ? 'flex' : 'none' }}>
                <Tooltip title="Back">
                    <span>
                        <IconButton 
                            onClick={goBack} 
                            disabled={!canGoBack || isDisabled} 
                            size="small"
                        >
                            <ArrowBackIcon fontSize="small" />
                        </IconButton>
                    </span>
                </Tooltip>

                <Tooltip title="History">
                    <span>
                        <IconButton 
                            onClick={handleHistoryClick} 
                            disabled={!history.nodes.length || isDisabled} 
                            size="small"
                        >
                            <HistoryIcon fontSize="small" />
                        </IconButton>
                    </span>
                </Tooltip>

                <Tooltip title="Forward">
                    <span>
                        <IconButton 
                            onClick={goForward} 
                            disabled={!canGoForward || isDisabled} 
                            size="small"
                        >
                            <ArrowForwardIcon fontSize="small" />
                        </IconButton>
                    </span>
                </Tooltip>
            </NavigationControls>

            {/* History Menu */}
            <Menu
                anchorEl={historyMenuAnchor}
                open={Boolean(historyMenuAnchor)}
                onClose={handleHistoryClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'center',
                }}
            >
                {history.nodes.map((node, index) => (
                    <MenuItem
                        key={`${node.id}-${index}`}
                        onClick={() => handleHistoryItemClick(index)}
                        selected={index === history.currentIndex}
                    >
                        <ListItemIcon>
                            {getContextIcon(node.type)}
                        </ListItemIcon>
                        <ListItemText 
                            primary={node.label || node.id}
                            secondary={node.type}
                        />
                    </MenuItem>
                ))}
            </Menu>

            <ContextToggleContainer>
                <ContextToggleButton
                    active={context.main === 'profile'}
                    onClick={() => handleContextChange('profile' as BaseContext)}
                    startIcon={<PersonIcon />}
                    disabled={isDisabled || !userDbName}
                >
                    {visibility.toggleLabels && <span className="button-label">Profile</span>}
                </ContextToggleButton>
                <ContextToggleButton
                    active={context.main === 'institute'}
                    onClick={() => handleContextChange('school' as BaseContext)}
                    startIcon={<SchoolIcon />}
                    disabled={isDisabled || !workerDbName}
                >
                    {visibility.toggleLabels && <span className="button-label">Institute</span>}
                </ContextToggleButton>
            </ContextToggleContainer>

            <Box>
                <Tooltip title={context.base}>
                    <span>
                        <Button
                            onClick={handleContextMenu}
                            disabled={isDisabled}
                            sx={{
                                minWidth: 0,
                                p: 0.5,
                                color: 'text.primary',
                                '&:hover': {
                                    bgcolor: 'action.hover'
                                }
                            }}
                        >
                            {getContextIcon(context.base)}
                            {visibility.contextLabel && (
                                <Box sx={{ ml: 1 }}>
                                    {context.base}
                                </Box>
                            )}
                            <ExpandMoreIcon sx={{ ml: visibility.contextLabel ? 0.5 : 0 }} />
                        </Button>
                    </span>
                </Tooltip>
            </Box>

            <Menu
                anchorEl={contextMenuAnchor}
                open={Boolean(contextMenuAnchor)}
                onClose={() => setContextMenuAnchor(null)}
            >
                {getContextItems().map(item => (
                    <MenuItem 
                        key={item.id} 
                        onClick={() => handleContextSelect(item.id as BaseContext)}
                        disabled={isDisabled}
                    >
                        <ListItemIcon>
                            <item.icon />
                        </ListItemIcon>
                        <ListItemText primary={item.label} />
                    </MenuItem>
                ))}
            </Menu>
        </NavigationRoot>
    );
}; 