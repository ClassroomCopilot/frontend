import {
    DefaultDebugMenu,
    DefaultDebugMenuContent,
    TLUiDebugMenuProps,
} from '@tldraw/tldraw';

export const RegularDebugMenu = (props: TLUiDebugMenuProps) => {
    return (
        <DefaultDebugMenu {...props}>
            <DefaultDebugMenuContent />
        </DefaultDebugMenu>
    );
};