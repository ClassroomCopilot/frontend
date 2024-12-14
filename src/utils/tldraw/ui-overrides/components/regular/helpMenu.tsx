import {
    DefaultHelpMenu,
    DefaultHelpMenuContent,
    TLUiHelpMenuProps,
} from '@tldraw/tldraw';

export const RegularHelpMenu = (props: TLUiHelpMenuProps) => {
    return (
        <DefaultHelpMenu {...props}>
            <DefaultHelpMenuContent />
        </DefaultHelpMenu>
    );
};