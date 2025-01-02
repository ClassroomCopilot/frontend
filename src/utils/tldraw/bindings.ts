// TLDraw bindings
import { TLAnyBindingUtilConstructor } from '@tldraw/tldraw'
import { SlideLayoutBindingUtil } from './slides/SlideLayoutBindingUtil'

// Define all binding utils in a single object for easy maintenance
export const BindingUtils = {
	SlideLayout: SlideLayoutBindingUtil
};

export const allBindingUtils: TLAnyBindingUtilConstructor[] = Object.values(BindingUtils);
