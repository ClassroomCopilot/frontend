import {
    DefaultDebugMenu,
    DefaultDebugMenuContent,
    TLUiDebugMenuProps,
} from '@tldraw/tldraw';

export const PresentationDebugMenu = (props: TLUiDebugMenuProps) => {
    return (
        <div>
            <DefaultDebugMenu {...props}>
                <DefaultDebugMenuContent />
            </DefaultDebugMenu>
        </div>
    );
};