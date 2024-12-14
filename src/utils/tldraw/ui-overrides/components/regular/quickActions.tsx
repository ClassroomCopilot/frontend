import {
    DefaultQuickActions,
    DefaultQuickActionsContent,
    TLUiQuickActionsProps,
} from '@tldraw/tldraw';

export const RegularQuickActions = (props: TLUiQuickActionsProps) => {
    return (
        <DefaultQuickActions {...props}>
            <DefaultQuickActionsContent />
        </DefaultQuickActions>
    );
};