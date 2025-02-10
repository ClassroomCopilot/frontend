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
    activeView: CalendarExtendedContext;
    onViewChange: (view: CalendarExtendedContext) => void;
}

export const CalendarNavigation: React.FC<Props> = ({ activeView, onViewChange }) => {
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
                <IconButton 
                    size="small" 
                    onClick={() => onViewChange('day')}
                    color={activeView === 'day' ? 'primary' : 'default'}
                >
                    <TodayIcon />
                </IconButton>
                <IconButton 
                    size="small" 
                    onClick={() => onViewChange('week')}
                    color={activeView === 'week' ? 'primary' : 'default'}
                >
                    <ViewWeekIcon />
                </IconButton>
                <IconButton 
                    size="small" 
                    onClick={() => onViewChange('month')}
                    color={activeView === 'month' ? 'primary' : 'default'}
                >
                    <DateRangeIcon />
                </IconButton>
                <IconButton 
                    size="small" 
                    onClick={() => onViewChange('year')}
                    color={activeView === 'year' ? 'primary' : 'default'}
                >
                    <EventIcon />
                </IconButton>
            </ViewControls>

            <Box sx={{ width: 1, px: 2 }}>
                <IconButton 
                    size="small" 
                    onClick={handlePrevious}
                    disabled={!currentCalendarNode || !calendarStructure}
                >
                    <NavigateBeforeIcon />
                </IconButton>

                {currentCalendarNode && (
                    <Typography variant="subtitle2" component="span" sx={{ mx: 2 }}>
                        {currentCalendarNode.title}
                    </Typography>
                )}

                <IconButton 
                    size="small" 
                    onClick={handleNext}
                    disabled={!currentCalendarNode || !calendarStructure}
                >
                    <NavigateNextIcon />
                </IconButton>
            </Box>

            <Button 
                size="small" 
                startIcon={<TodayIcon />}
                onClick={handleToday}
                disabled={!calendarStructure}
            >
                Today
            </Button>
        </NavigationContainer>
    );
}; 