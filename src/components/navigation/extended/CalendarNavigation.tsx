import React from 'react';
import { Box, IconButton, Button, Typography, styled } from '@mui/material';
import {
    NavigateBefore as NavigateBeforeIcon,
    NavigateNext as NavigateNextIcon,
    Today as TodayIcon,
    ViewWeek as ViewWeekIcon,
    DateRange as DateRangeIcon,
    Event as EventIcon
} from '@mui/icons-material';
import { useNeoUser } from '../../../contexts/NeoUserContext';
import { CalendarExtendedContext } from '../../../types/navigation';
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
    '&.active': {
        color: theme.palette.primary.main,
        backgroundColor: theme.palette.action.selected,
        '&:hover': {
            backgroundColor: theme.palette.action.selected,
            transform: 'scale(1.05)',
        }
    },
    '& .MuiSvgIcon-root': {
        fontSize: '1.25rem',
        transition: theme.transitions.create('transform', {
            duration: theme.transitions.duration.shortest,
        }),
    },
}));

const ActionButton = styled(Button, {
    shouldForwardProp: prop => prop !== 'isDarkMode'
})<{ isDarkMode?: boolean }>(({ theme, isDarkMode }) => ({
    textTransform: 'none',
    padding: theme.spacing(0.75, 2),
    gap: theme.spacing(1),
    color: isDarkMode ? theme.palette.text.primary : theme.palette.text.secondary,
    transition: theme.transitions.create(['background-color', 'transform', 'box-shadow'], {
        duration: theme.transitions.duration.shorter,
    }),
    '&:hover': {
        backgroundColor: theme.palette.action.hover,
        transform: 'translateY(-1px)',
        boxShadow: theme.shadows[2],
    },
    '&:active': {
        transform: 'translateY(0)',
        boxShadow: theme.shadows[1],
    },
    '&.Mui-disabled': {
        color: theme.palette.action.disabled,
    },
    '& .MuiSvgIcon-root': {
        fontSize: '1.25rem',
        color: 'inherit',
        transition: theme.transitions.create('transform', {
            duration: theme.transitions.duration.shortest,
        }),
    },
}));

interface Props {
    activeView: CalendarExtendedContext;
    onViewChange: (view: CalendarExtendedContext) => void;
}

export const CalendarNavigation: React.FC<Props> = ({ activeView, onViewChange }) => {
    const { tldrawPreferences } = useTLDraw();
    const isDarkMode = tldrawPreferences?.colorScheme === 'dark';
    const { 
        navigateToDay,
        navigateToWeek,
        navigateToMonth,
        navigateToYear,
        currentCalendarNode,
        calendarStructure
    } = useNeoUser();

    const handlePrevious = async () => {
        if (!currentCalendarNode || !calendarStructure) return;

        try {
            switch (activeView) {
                case 'day': {
                    // Find current day and get previous
                    const days = Object.values(calendarStructure.days);
                    const currentIndex = days.findIndex(d => d.id === currentCalendarNode.id);
                    if (currentIndex > 0) {
                        await navigateToDay(days[currentIndex - 1].id);
                    }
                    break;
                }
                case 'week': {
                    // Find current week and get previous
                    const weeks = Object.values(calendarStructure.weeks);
                    const currentIndex = weeks.findIndex(w => w.id === currentCalendarNode.id);
                    if (currentIndex > 0) {
                        await navigateToWeek(weeks[currentIndex - 1].id);
                    }
                    break;
                }
                case 'month': {
                    // Find current month and get previous
                    const months = Object.values(calendarStructure.months);
                    const currentIndex = months.findIndex(m => m.id === currentCalendarNode.id);
                    if (currentIndex > 0) {
                        await navigateToMonth(months[currentIndex - 1].id);
                    }
                    break;
                }
                case 'year': {
                    // Find current year and get previous
                    const years = calendarStructure.years;
                    const currentIndex = years.findIndex(y => y.id === currentCalendarNode.id);
                    if (currentIndex > 0) {
                        await navigateToYear(years[currentIndex - 1].id);
                    }
                    break;
                }
            }
        } catch (error) {
            logger.error('navigation', '❌ Failed to navigate to previous:', error);
        }
    };

    const handleNext = async () => {
        if (!currentCalendarNode || !calendarStructure) return;

        try {
            switch (activeView) {
                case 'day': {
                    // Find current day and get next
                    const days = Object.values(calendarStructure.days);
                    const currentIndex = days.findIndex(d => d.id === currentCalendarNode.id);
                    if (currentIndex < days.length - 1) {
                        await navigateToDay(days[currentIndex + 1].id);
                    }
                    break;
                }
                case 'week': {
                    // Find current week and get next
                    const weeks = Object.values(calendarStructure.weeks);
                    const currentIndex = weeks.findIndex(w => w.id === currentCalendarNode.id);
                    if (currentIndex < weeks.length - 1) {
                        await navigateToWeek(weeks[currentIndex + 1].id);
                    }
                    break;
                }
                case 'month': {
                    // Find current month and get next
                    const months = Object.values(calendarStructure.months);
                    const currentIndex = months.findIndex(m => m.id === currentCalendarNode.id);
                    if (currentIndex < months.length - 1) {
                        await navigateToMonth(months[currentIndex + 1].id);
                    }
                    break;
                }
                case 'year': {
                    // Find current year and get next
                    const years = calendarStructure.years;
                    const currentIndex = years.findIndex(y => y.id === currentCalendarNode.id);
                    if (currentIndex < years.length - 1) {
                        await navigateToYear(years[currentIndex + 1].id);
                    }
                    break;
                }
            }
        } catch (error) {
            logger.error('navigation', '❌ Failed to navigate to next:', error);
        }
    };

    const handleToday = async () => {
        if (!calendarStructure) return;

        try {
            // Navigate to current day based on active view
            switch (activeView) {
                case 'day':
                    await navigateToDay(calendarStructure.currentDay);
                    break;
                case 'week': {
                    const currentDay = calendarStructure.days[calendarStructure.currentDay];
                    if (currentDay) {
                        const week = Object.values(calendarStructure.weeks)
                            .find(w => w.days.includes(currentDay));
                        if (week) {
                            await navigateToWeek(week.id);
                        }
                    }
                    break;
                }
                case 'month': {
                    const currentDay = calendarStructure.days[calendarStructure.currentDay];
                    if (currentDay) {
                        const month = Object.values(calendarStructure.months)
                            .find(m => m.days.includes(currentDay));
                        if (month) {
                            await navigateToMonth(month.id);
                        }
                    }
                    break;
                }
                case 'year': {
                    const currentDay = calendarStructure.days[calendarStructure.currentDay];
                    if (currentDay) {
                        const month = Object.values(calendarStructure.months)
                            .find(m => m.days.includes(currentDay));
                        if (month) {
                            const year = calendarStructure.years
                                .find(y => y.months.includes(month));
                            if (year) {
                                await navigateToYear(year.id);
                            }
                        }
                    }
                    break;
                }
            }
        } catch (error) {
            logger.error('navigation', '❌ Failed to navigate to today:', error);
        }
    };

    return (
        <NavigationContainer>
            <ViewControls>
                <StyledIconButton 
                    size="small" 
                    onClick={() => onViewChange('day')}
                    className={activeView === 'day' ? 'active' : ''}
                    isDarkMode={isDarkMode}
                >
                    <TodayIcon />
                </StyledIconButton>
                <StyledIconButton 
                    size="small" 
                    onClick={() => onViewChange('week')}
                    className={activeView === 'week' ? 'active' : ''}
                    isDarkMode={isDarkMode}
                >
                    <ViewWeekIcon />
                </StyledIconButton>
                <StyledIconButton 
                    size="small" 
                    onClick={() => onViewChange('month')}
                    className={activeView === 'month' ? 'active' : ''}
                    isDarkMode={isDarkMode}
                >
                    <DateRangeIcon />
                </StyledIconButton>
                <StyledIconButton 
                    size="small" 
                    onClick={() => onViewChange('year')}
                    className={activeView === 'year' ? 'active' : ''}
                    isDarkMode={isDarkMode}
                >
                    <EventIcon />
                </StyledIconButton>
            </ViewControls>

            <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <StyledIconButton 
                    size="small" 
                    onClick={handlePrevious}
                    disabled={!currentCalendarNode || !calendarStructure}
                    isDarkMode={isDarkMode}
                >
                    <NavigateBeforeIcon />
                </StyledIconButton>

                {currentCalendarNode && (
                    <Typography 
                        variant="subtitle2" 
                        component="span" 
                        sx={{ 
                            mx: 2,
                            color: 'text.primary',
                            fontWeight: 500
                        }}
                    >
                        {currentCalendarNode.title}
                    </Typography>
                )}

                <StyledIconButton 
                    size="small" 
                    onClick={handleNext}
                    disabled={!currentCalendarNode || !calendarStructure}
                    isDarkMode={isDarkMode}
                >
                    <NavigateNextIcon />
                </StyledIconButton>
            </Box>

            <ActionButton 
                size="small" 
                startIcon={<TodayIcon />}
                onClick={handleToday}
                disabled={!calendarStructure}
                isDarkMode={isDarkMode}
            >
                Today
            </ActionButton>
        </NavigationContainer>
    );
}; 