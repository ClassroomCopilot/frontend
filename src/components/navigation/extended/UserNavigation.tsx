import React from 'react';
import { Box, IconButton, Typography, styled, Tabs, Tab } from '@mui/material';
import {
    AccountCircle as ProfileIcon,
    Book as JournalIcon,
    EventNote as PlannerIcon
} from '@mui/icons-material';
import { useNeoUser } from '../../../contexts/NeoUserContext';
import { UserExtendedContext } from '../../../types/navigation';

const NavigationContainer = styled(Box)`
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 0 16px;
`;

interface Props {
    activeView: UserExtendedContext;
    onViewChange: (view: UserExtendedContext) => void;
}

export const UserNavigation: React.FC<Props> = ({ activeView, onViewChange }) => {
    const { currentNode } = useNeoUser();

    return (
        <NavigationContainer>
            <Tabs 
                value={activeView} 
                onChange={(_, value) => onViewChange(value as UserExtendedContext)}
                variant="scrollable"
                scrollButtons="auto"
            >
                <Tab 
                    value="profile"
                    icon={<ProfileIcon />}
                    label="Profile"
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

            {currentNode && (
                <Typography variant="subtitle2" sx={{ px: 2 }}>
                    {currentNode.label}
                </Typography>
            )}
        </NavigationContainer>
    );
}; 