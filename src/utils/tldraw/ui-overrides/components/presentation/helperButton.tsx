import {
    DefaultHelperButtons,
    DefaultHelperButtonsContent,
    TLUiHelperButtonsProps,
} from '@tldraw/tldraw';
import { SlidesPanel } from './../../../slides/SlidesPanel';

export const PresentationHelperButtons = (props: TLUiHelperButtonsProps) => {
    return (
        <div>
            <DefaultHelperButtons {...props}>
                <SlidesPanel />
                <DefaultHelperButtonsContent />
            </DefaultHelperButtons>
        </div>
    );
};