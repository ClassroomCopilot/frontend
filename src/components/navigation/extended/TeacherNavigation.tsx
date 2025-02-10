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

const NavigationContainer = styled(Box)`
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 0 16px;
`;

const ViewControls = styled(Box)`
    display: flex;
    align-items: center;
    gap: 4px;
`;

interface Props {
    activeView: TeacherExtendedContext;
    onViewChange: (view: TeacherExtendedContext) => void;
}

export const TeacherNavigation: React.FC<Props> = ({ activeView, onViewChange }) => {
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
            <Tabs 
                value={activeView} 
                onChange={(_, value) => onViewChange(value as TeacherExtendedContext)}
                variant="scrollable"
                scrollButtons="auto"
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
            </Tabs>

            <Box sx={{ flex: 1 }} />

            <ViewControls>
                <IconButton 
                    size="small" 
                    onClick={handlePrevious}
                    disabled={!currentWorkerNode || !workerStructure}
                >
                    <NavigateBeforeIcon />
                </IconButton>

                {currentWorkerNode && (
                    <Typography variant="subtitle2" component="span" sx={{ mx: 2 }}>
                        {currentWorkerNode.title}
                    </Typography>
                )}

                <IconButton 
                    size="small" 
                    onClick={handleNext}
                    disabled={!currentWorkerNode || !workerStructure}
                >
                    <NavigateNextIcon />
                </IconButton>
            </ViewControls>
        </NavigationContainer>
    );
}; 