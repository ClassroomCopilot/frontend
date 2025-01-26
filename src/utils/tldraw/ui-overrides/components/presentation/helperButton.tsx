import {
    DefaultHelperButtons,
    DefaultHelperButtonsContent,
    TLUiHelperButtonsProps,
} from '@tldraw/tldraw';

export const PresentationHelperButtons = (props: TLUiHelperButtonsProps) => {
    return (
        <div>
            <DefaultHelperButtons {...props}>
                <DefaultHelperButtonsContent />
            </DefaultHelperButtons>
        </div>
    );
};