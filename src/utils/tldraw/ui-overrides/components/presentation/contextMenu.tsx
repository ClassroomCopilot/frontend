import {
    DefaultContextMenu,
    DefaultContextMenuContent,
    TLUiContextMenuProps,
} from '@tldraw/tldraw';

export const PresentationContextMenu = (props: TLUiContextMenuProps) => {
    return (
        <div>
            <DefaultContextMenu {...props}>
                <DefaultContextMenuContent />
            </DefaultContextMenu>
        </div>
    );
};