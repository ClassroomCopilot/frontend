import React, { useMemo } from 'react';
import { Box, IconButton, Button, Typography, styled, ThemeProvider, createTheme, useMediaQuery } from '@mui/material';
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

const NavigationContainer = styled(Box)(() => ({
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '0 8px',
    minHeight: '48px',
    width: '100%',
    overflow: 'hidden',
    '@media (max-width: 600px)': {
        flexWrap: 'wrap',
        padding: '4px',
        gap: '4px',
    },
}));

const ViewControls = styled(Box)(() => ({
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    flexShrink: 0,
}));

const NavigationSection = styled(Box)(() => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px',
    flex: 1,
    minWidth: 0, // Allows the container to shrink below its content size
    '@media (max-width: 600px)': {
        order: -1,
        flex: '1 1 100%',
        justifyContent: 'space-between',
    },
}));

const TitleTypography = styled(Typography)(() => ({
    color: 'var(--color-text)',
    fontWeight: 500,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    margin: '0 8px',
}));

const ActionButtonContainer = styled(Box)(() => ({
    flexShrink: 0,
    '@media (max-width: 600px)': {
        width: 'auto',
    },
}));

const StyledIconButton = styled(IconButton)(() => ({
    color: 'var(--color-text)',
    transition: 'background-color 200ms ease, color 200ms ease, transform 200ms ease',
    '&:hover': {
        backgroundColor: 'var(--color-hover)',
        transform: 'scale(1.05)',
    },
    '&.Mui-disabled': {
        color: 'var(--color-text-disabled)',
    },
    '&.active': {
        color: 'var(--color-selected)',
        backgroundColor: 'var(--color-selected-background)',
        '&:hover': {
            backgroundColor: 'var(--color-selected-hover)',
            transform: 'scale(1.05)',
        }
    },
    '& .MuiSvgIcon-root': {
        fontSize: '1.25rem',
        transition: 'transform 150ms ease',
    },
}));

const ActionButton = styled(Button)(() => ({
    textTransform: 'none',
    padding: '6px 16px',
    gap: '8px',
    color: 'var(--color-text)',
    transition: 'background-color 200ms ease, transform 200ms ease, box-shadow 200ms ease',
    '&:hover': {
        backgroundColor: 'var(--color-hover)',
        transform: 'translateY(-1px)',
    },
    '&:active': {
        transform: 'translateY(0)',
    },
    '&.Mui-disabled': {
        color: 'var(--color-text-disabled)',
    },
    '& .MuiSvgIcon-root': {
        fontSize: '1.25rem',
        color: 'inherit',
        transition: 'transform 150ms ease',
    },
}));

interface Props {
    activeView: CalendarExtendedContext;
    onViewChange: (view: CalendarExtendedContext) => void;
}

export const CalendarNavigation: React.FC<Props> = ({ activeView, onViewChange }) => {
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
        <ThemeProvider theme={theme}>
            <NavigationContainer>
                <NavigationSection>
                    <StyledIconButton 
                        size="small" 
                        onClick={handlePrevious}
                        disabled={!currentCalendarNode || !calendarStructure}
                    >
                        <NavigateBeforeIcon />
                    </StyledIconButton>

                    {currentCalendarNode && (
                        <TitleTypography 
                            variant="subtitle2"
                        >
                            {currentCalendarNode.title}
                        </TitleTypography>
                    )}

                    <StyledIconButton 
                        size="small" 
                        onClick={handleNext}
                        disabled={!currentCalendarNode || !calendarStructure}
                    >
                        <NavigateNextIcon />
                    </StyledIconButton>
                </NavigationSection>

                <ViewControls>
                    <StyledIconButton 
                        size="small" 
                        onClick={() => onViewChange('day')}
                        className={activeView === 'day' ? 'active' : ''}
                    >
                        <TodayIcon />
                    </StyledIconButton>
                    <StyledIconButton 
                        size="small" 
                        onClick={() => onViewChange('week')}
                        className={activeView === 'week' ? 'active' : ''}
                    >
                        <ViewWeekIcon />
                    </StyledIconButton>
                    <StyledIconButton 
                        size="small" 
                        onClick={() => onViewChange('month')}
                        className={activeView === 'month' ? 'active' : ''}
                    >
                        <DateRangeIcon />
                    </StyledIconButton>
                    <StyledIconButton 
                        size="small" 
                        onClick={() => onViewChange('year')}
                        className={activeView === 'year' ? 'active' : ''}
                    >
                        <EventIcon />
                    </StyledIconButton>
                </ViewControls>

                <ActionButtonContainer>
                    <ActionButton 
                        size="small" 
                        startIcon={<TodayIcon />}
                        onClick={handleToday}
                        disabled={!calendarStructure}
                    >
                        Today
                    </ActionButton>
                </ActionButtonContainer>
            </NavigationContainer>
        </ThemeProvider>
    );
}; 