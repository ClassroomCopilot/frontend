import {
    DefaultHelperButtons,
    DefaultHelperButtonsContent,
    TLUiHelperButtonsProps,
} from '@tldraw/tldraw';
import { Box } from '@mui/material';

export const RegularHelperButtons = (props: TLUiHelperButtonsProps) => {
    return (
        <Box
            sx={{
                position: 'fixed',
                top: '80px',
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 200,
                pointerEvents: 'none',
                '& > *': {
                    pointerEvents: 'all'
                }
            }}
        >
            <DefaultHelperButtons {...props}>
                <DefaultHelperButtonsContent />
            </DefaultHelperButtons>
        </Box>
    );
};