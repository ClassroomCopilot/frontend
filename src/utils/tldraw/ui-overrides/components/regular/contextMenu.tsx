import {
    DefaultContextMenu,
    DefaultContextMenuContent,
    TLUiContextMenuProps,
} from '@tldraw/tldraw';

export const RegularContextMenu = (props: TLUiContextMenuProps) => {
    return (
        <DefaultContextMenu {...props}>
            <DefaultContextMenuContent />
        </DefaultContextMenu>
    );
};