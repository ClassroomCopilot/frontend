import {
    DefaultZoomMenu,
    DefaultZoomMenuContent,
    TLUiZoomMenuProps,
} from '@tldraw/tldraw';

export const RegularZoomMenu = (props: TLUiZoomMenuProps) => {
    return (
        <DefaultZoomMenu {...props}>
            <DefaultZoomMenuContent />
        </DefaultZoomMenu>
    );
};