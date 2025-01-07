import {
    DefaultHelperButtons,
    DefaultHelperButtonsContent,
    TLUiHelperButtonsProps,
} from '@tldraw/tldraw';

export const RegularHelperButtons = (props: TLUiHelperButtonsProps) => {
    return (
        <DefaultHelperButtons {...props}>
            <DefaultHelperButtonsContent />
        </DefaultHelperButtons>
    );
};