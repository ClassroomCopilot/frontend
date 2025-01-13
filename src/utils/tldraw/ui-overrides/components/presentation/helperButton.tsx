import {
    DefaultHelperButtons,
    DefaultHelperButtonsContent,
    TLUiHelperButtonsProps,
} from '@tldraw/tldraw';
import { CCShapesPanel } from '../shared/CCShapesPanel';

export const PresentationHelperButtons = (props: TLUiHelperButtonsProps) => {
    return (
        <div>
            <CCShapesPanel />
            <DefaultHelperButtons {...props}>
                <DefaultHelperButtonsContent />
            </DefaultHelperButtons>
        </div>
    );
};