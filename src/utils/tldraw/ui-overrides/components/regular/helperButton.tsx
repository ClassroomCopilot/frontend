import {
    DefaultHelperButtons,
    DefaultHelperButtonsContent,
    TLUiHelperButtonsProps,
} from '@tldraw/tldraw';
import { SlidesPanel } from './../../../slides/SlidesPanel';

export const RegularHelperButtons = (props: TLUiHelperButtonsProps) => {
    return (
        <DefaultHelperButtons {...props}>
            <SlidesPanel />
            <DefaultHelperButtonsContent />
        </DefaultHelperButtons>
    );
};