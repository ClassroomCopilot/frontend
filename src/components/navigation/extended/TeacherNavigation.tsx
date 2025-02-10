import React from 'react';
import { Box, IconButton, Typography, styled, Tabs, Tab } from '@mui/material';
import {
    Schedule as ScheduleIcon,
    Book as JournalIcon,
    EventNote as PlannerIcon,
    Class as ClassIcon,
    MenuBook as LessonIcon,
    NavigateBefore as NavigateBeforeIcon,
    NavigateNext as NavigateNextIcon,
    Dashboard as DashboardIcon
} from '@mui/icons-material';
import { useNeoUser } from '../../../contexts/NeoUserContext';
import { TeacherExtendedContext } from '../../../types/navigation';
import { logger } from '../../../debugConfig';
import { useTLDraw } from '../../../contexts/TLDrawContext';

const NavigationContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    padding: theme.spacing(0, 2),
}));

const ViewControls = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
}));

const StyledIconButton = styled(IconButton, {
    shouldForwardProp: prop => prop !== 'isDarkMode'
})<{ isDarkMode?: boolean }>(({ theme, isDarkMode }) => ({
    color: isDarkMode ? theme.palette.text.primary : theme.palette.text.secondary,
    transition: theme.transitions.create(['background-color', 'color', 'transform'], {
        duration: theme.transitions.duration.shorter,
    }),
    '&:hover': {
        backgroundColor: theme.palette.action.hover,
        transform: 'scale(1.05)',
    },
    '&.Mui-disabled': {
        color: theme.palette.action.disabled,
    },
    '& .MuiSvgIcon-root': {
        fontSize: '1.25rem',
        transition: theme.transitions.create('transform', {
            duration: theme.transitions.duration.shortest,
        }),
    },
}));

const StyledTabs = styled(Tabs, {
    shouldForwardProp: prop => prop !== 'isDarkMode'
})<{ isDarkMode?: boolean }>(({ theme, isDarkMode }) => ({
    minHeight: 'unset',
    '& .MuiTab-root': {
        minHeight: 'unset',
        padding: theme.spacing(1),
        textTransform: 'none',
        fontSize: '0.875rem',
        color: isDarkMode ? theme.palette.text.primary : theme.palette.text.secondary,
        transition: theme.transitions.create(['color', 'background-color', 'box-shadow'], {
            duration: theme.transitions.duration.shorter,
        }),
        '&:hover': {
            backgroundColor: theme.palette.action.hover,
            color: theme.palette.primary.main,
        },
        '&.Mui-selected': {
            color: theme.palette.primary.main,
            '&:hover': {
                backgroundColor: theme.palette.action.selected,
            },
        },
        '& .MuiSvgIcon-root': {
            fontSize: '1.25rem',
            marginBottom: theme.spacing(0.5),
            transition: theme.transitions.create('transform', {
                duration: theme.transitions.duration.shortest,
            }),
        },
        '&:hover .MuiSvgIcon-root': {
            transform: 'scale(1.1)',
        },
    },
    '& .MuiTabs-indicator': {
        transition: theme.transitions.create(['width', 'left'], {
            duration: theme.transitions.duration.standard,
            easing: theme.transitions.easing.easeInOut,
        }),
    },
}));

interface Props {
    activeView: TeacherExtendedContext;
    onViewChange: (view: TeacherExtendedContext) => void;
}

export const TeacherNavigation: React.FC<Props> = ({ activeView, onViewChange }) => {
    const { tldrawPreferences } = useTLDraw();
    const isDarkMode = tldrawPreferences?.colorScheme === 'dark';
    const { 
        navigateToTimetable,
        navigateToClass,
        navigateToLesson,
        navigateToJournal,
        navigateToPlanner,
        currentWorkerNode,
        workerStructure
    } = useNeoUser();

    const handlePrevious = async () => {
        if (!currentWorkerNode || !workerStructure) return;

        try {
            switch (activeView) {
                case 'overview': {
                    // Overview doesn't have navigation
                    break;
                }
                case 'timetable': {
                    // Find current timetable and get previous
                    const deptId = Object.keys(workerStructure.timetables).find(
                        deptId => workerStructure.timetables[deptId].some(t => t.id === currentWorkerNode.id)
                    );
                    if (deptId) {
                        const timetables = workerStructure.timetables[deptId];
                        const currentIndex = timetables.findIndex(t => t.id === currentWorkerNode.id);
                        if (currentIndex > 0) {
                            await navigateToTimetable(timetables[currentIndex - 1].id);
                        }
                    }
                    break;
                }
                case 'classes': {
                    // Find current class and get previous
                    const deptId = Object.keys(workerStructure.classes).find(
                        deptId => workerStructure.classes[deptId].some(c => c.id === currentWorkerNode.id)
                    );
                    if (deptId) {
                        const classes = workerStructure.classes[deptId];
                        const currentIndex = classes.findIndex(c => c.id === currentWorkerNode.id);
                        if (currentIndex > 0) {
                            await navigateToClass(classes[currentIndex - 1].id);
                        }
                    }
                    break;
                }
                case 'lessons': {
                    // Find current lesson and get previous
                    const deptId = Object.keys(workerStructure.lessons).find(
                        deptId => workerStructure.lessons[deptId].some(l => l.id === currentWorkerNode.id)
                    );
                    if (deptId) {
                        const lessons = workerStructure.lessons[deptId];
                        const currentIndex = lessons.findIndex(l => l.id === currentWorkerNode.id);
                        if (currentIndex > 0) {
                            await navigateToLesson(lessons[currentIndex - 1].id);
                        }
                    }
                    break;
                }
                case 'journal': {
                    // Find current journal and get previous
                    const deptId = Object.keys(workerStructure.journals).find(
                        deptId => workerStructure.journals[deptId].some(j => j.id === currentWorkerNode.id)
                    );
                    if (deptId) {
                        const journals = workerStructure.journals[deptId];
                        const currentIndex = journals.findIndex(j => j.id === currentWorkerNode.id);
                        if (currentIndex > 0) {
                            await navigateToJournal(journals[currentIndex - 1].id);
                        }
                    }
                    break;
                }
                case 'planner': {
                    // Find current planner and get previous
                    const deptId = Object.keys(workerStructure.planners).find(
                        deptId => workerStructure.planners[deptId].some(p => p.id === currentWorkerNode.id)
                    );
                    if (deptId) {
                        const planners = workerStructure.planners[deptId];
                        const currentIndex = planners.findIndex(p => p.id === currentWorkerNode.id);
                        if (currentIndex > 0) {
                            await navigateToPlanner(planners[currentIndex - 1].id);
                        }
                    }
                    break;
                }
            }
        } catch (error) {
            logger.error('navigation', '❌ Failed to navigate to previous:', error);
        }
    };

    const handleNext = async () => {
        if (!currentWorkerNode || !workerStructure) return;

        try {
            switch (activeView) {
                case 'overview': {
                    // Overview doesn't have navigation
                    break;
                }
                case 'timetable': {
                    // Find current timetable and get next
                    const deptId = Object.keys(workerStructure.timetables).find(
                        deptId => workerStructure.timetables[deptId].some(t => t.id === currentWorkerNode.id)
                    );
                    if (deptId) {
                        const timetables = workerStructure.timetables[deptId];
                        const currentIndex = timetables.findIndex(t => t.id === currentWorkerNode.id);
                        if (currentIndex < timetables.length - 1) {
                            await navigateToTimetable(timetables[currentIndex + 1].id);
                        }
                    }
                    break;
                }
                case 'classes': {
                    // Find current class and get next
                    const deptId = Object.keys(workerStructure.classes).find(
                        deptId => workerStructure.classes[deptId].some(c => c.id === currentWorkerNode.id)
                    );
                    if (deptId) {
                        const classes = workerStructure.classes[deptId];
                        const currentIndex = classes.findIndex(c => c.id === currentWorkerNode.id);
                        if (currentIndex < classes.length - 1) {
                            await navigateToClass(classes[currentIndex + 1].id);
                        }
                    }
                    break;
                }
                case 'lessons': {
                    // Find current lesson and get next
                    const deptId = Object.keys(workerStructure.lessons).find(
                        deptId => workerStructure.lessons[deptId].some(l => l.id === currentWorkerNode.id)
                    );
                    if (deptId) {
                        const lessons = workerStructure.lessons[deptId];
                        const currentIndex = lessons.findIndex(l => l.id === currentWorkerNode.id);
                        if (currentIndex < lessons.length - 1) {
                            await navigateToLesson(lessons[currentIndex + 1].id);
                        }
                    }
                    break;
                }
                case 'journal': {
                    // Find current journal and get next
                    const deptId = Object.keys(workerStructure.journals).find(
                        deptId => workerStructure.journals[deptId].some(j => j.id === currentWorkerNode.id)
                    );
                    if (deptId) {
                        const journals = workerStructure.journals[deptId];
                        const currentIndex = journals.findIndex(j => j.id === currentWorkerNode.id);
                        if (currentIndex < journals.length - 1) {
                            await navigateToJournal(journals[currentIndex + 1].id);
                        }
                    }
                    break;
                }
                case 'planner': {
                    // Find current planner and get next
                    const deptId = Object.keys(workerStructure.planners).find(
                        deptId => workerStructure.planners[deptId].some(p => p.id === currentWorkerNode.id)
                    );
                    if (deptId) {
                        const planners = workerStructure.planners[deptId];
                        const currentIndex = planners.findIndex(p => p.id === currentWorkerNode.id);
                        if (currentIndex < planners.length - 1) {
                            await navigateToPlanner(planners[currentIndex + 1].id);
                        }
                    }
                    break;
                }
            }
        } catch (error) {
            logger.error('navigation', '❌ Failed to navigate to next:', error);
        }
    };

    return (
        <NavigationContainer>
            <StyledTabs 
                value={activeView} 
                onChange={(_, value) => onViewChange(value as TeacherExtendedContext)}
                variant="scrollable"
                scrollButtons="auto"
                isDarkMode={isDarkMode}
            >
                <Tab 
                    value="overview"
                    icon={<DashboardIcon />}
                    label="Overview"
                />
                <Tab 
                    value="timetable"
                    icon={<ScheduleIcon />}
                    label="Timetable"
                />
                <Tab 
                    value="classes"
                    icon={<ClassIcon />}
                    label="Classes"
                />
                <Tab 
                    value="lessons"
                    icon={<LessonIcon />}
                    label="Lessons"
                />
                <Tab 
                    value="journal"
                    icon={<JournalIcon />}
                    label="Journal"
                />
                <Tab 
                    value="planner"
                    icon={<PlannerIcon />}
                    label="Planner"
                />
            </StyledTabs>

            <Box sx={{ flex: 1 }} />

            <ViewControls>
                <StyledIconButton 
                    size="small" 
                    onClick={handlePrevious}
                    disabled={!currentWorkerNode || !workerStructure}
                    isDarkMode={isDarkMode}
                >
                    <NavigateBeforeIcon />
                </StyledIconButton>

                {currentWorkerNode && (
                    <Typography 
                        variant="subtitle2" 
                        component="span" 
                        sx={{ 
                            mx: 2,
                            color: 'text.primary',
                            fontWeight: 500
                        }}
                    >
                        {currentWorkerNode.title}
                    </Typography>
                )}

                <StyledIconButton 
                    size="small" 
                    onClick={handleNext}
                    disabled={!currentWorkerNode || !workerStructure}
                    isDarkMode={isDarkMode}
                >
                    <NavigateNextIcon />
                </StyledIconButton>
            </ViewControls>
        </NavigationContainer>
    );
}; 