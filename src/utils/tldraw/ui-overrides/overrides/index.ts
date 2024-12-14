import { TLUiOverrides } from '@tldraw/tldraw';
import { toolsPresentationUiOverrides } from './presentation/tools';
import { actionsPresentationUiOverrides } from './presentation/actions';
import { toolsRegularUiOverrides } from './regular/tools';
import { actionsRegularUiOverrides } from './regular/actions';

export const regularUiOverridesIndex: TLUiOverrides = {
    ...actionsRegularUiOverrides,
    ...toolsRegularUiOverrides,
};

export const presentationUiOverridesIndex: TLUiOverrides = {
    ...actionsPresentationUiOverrides,
    ...toolsPresentationUiOverrides,
};