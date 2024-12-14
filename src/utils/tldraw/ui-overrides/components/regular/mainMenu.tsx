import {
    DefaultMainMenu,
    DefaultMainMenuContent,
    TLUiMainMenuProps,
} from '@tldraw/tldraw';

export const RegularMainMenu = (props: TLUiMainMenuProps) => {
    return (
        <DefaultMainMenu {...props}>
            <DefaultMainMenuContent />
        </DefaultMainMenu>
    );
};