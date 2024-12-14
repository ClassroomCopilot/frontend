import {
    DefaultHelpMenu,
    DefaultHelpMenuContent,
    TLUiHelpMenuProps,
} from '@tldraw/tldraw';

export const PresentationHelpMenu = (props: TLUiHelpMenuProps) => {
    return (
        <div>
            <DefaultHelpMenu {...props}>
                <DefaultHelpMenuContent />
            </DefaultHelpMenu>
        </div>
    );
};