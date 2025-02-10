import React from 'react';
import { Select, MenuItem, SelectChangeEvent } from '@mui/material';
import { ViewColumn, ViewList, ViewModule, ViewQuilt, ViewStream } from '@mui/icons-material';
import '../panel.css';  // Import the CSS file from parent directory

// Add panel type icons mapping
const PANEL_TYPE_ICONS = {
    'default': <ViewQuilt />,
    'list': <ViewList />,
    'grid': <ViewModule />,
    'column': <ViewColumn />,
    'stream': <ViewStream />
};

interface BasePanelProps {
    title?: string;
    showTypeSelector?: boolean;
    type?: keyof typeof PANEL_TYPE_ICONS;
    handleTypeChange?: (event: SelectChangeEvent) => void;
    children?: React.ReactNode;
}

export const BasePanel: React.FC<BasePanelProps> = ({
    title,
    showTypeSelector = false,
    type = 'default',
    handleTypeChange,
    children
}) => {
    return (
        <div className="panel-root">
            <div className="panel-header">
                {title && <div className="panel-section-title">{title}</div>}
                <div className="panel-header-actions">
                    {showTypeSelector && (
                        <Select
                            value={type}
                            onChange={handleTypeChange}
                            size="small"
                            className="panel-type-select"
                            sx={{
                                '.MuiSelect-select': {
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '4px 8px',
                                },
                                '.MuiOutlinedInput-notchedOutline': {
                                    border: 'none'
                                },
                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                    border: 'none'
                                },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                    border: 'none'
                                }
                            }}
                        >
                            {Object.entries(PANEL_TYPE_ICONS).map(([value, icon]) => (
                                <MenuItem 
                                    key={value} 
                                    value={value}
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px'
                                    }}
                                >
                                    {icon}
                                    {value.charAt(0).toUpperCase() + value.slice(1)}
                                </MenuItem>
                            ))}
                        </Select>
                    )}
                </div>
            </div>
            <div className="panel-content">
                {children}
            </div>
        </div>
    );
}; 
// ... existing code ... 