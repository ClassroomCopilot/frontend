import { Select, MenuItem, SelectChangeEvent } from '@mui/material';
import { ViewColumn, ViewList, ViewModule, ViewQuilt, ViewStream } from '@mui/icons-material';

// Add panel type icons mapping
const PANEL_TYPE_ICONS = {
    'default': <ViewQuilt />,
    'list': <ViewList />,
    'grid': <ViewModule />,
    'column': <ViewColumn />,
    'stream': <ViewStream />
};

export const BasePanel: React.FC<BasePanelProps> = ({
    // ... existing props ...
}) => {
    // ... existing code ...
    
    return (
        <div className={styles.basePanel}>
            <div className={styles.header}>
                {title && <div className={styles.title}>{title}</div>}
                <div className={styles.controls}>
                    {showTypeSelector && (
                        <Select
                            value={type}
                            onChange={handleTypeChange}
                            size="small"
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
                    {/* ... rest of controls ... */}
                </div>
            </div>
            {/* ... rest of component ... */}
        </div>
    );
};
// ... existing code ... 