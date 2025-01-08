// TLDraw bindings
import { TLAnyBindingUtilConstructor } from '@tldraw/tldraw'
import { CCSlideLayoutBindingUtil } from './cc-base/cc-slideshow/CCSlideLayoutBindingUtil'
import { ccBindingProps } from './cc-base/cc-props'

// Export CC bindings
export { ccBindingProps }

// Define all binding utils in a single object for easy maintenance
export const BindingUtils = {
	CCSlideLayout: CCSlideLayoutBindingUtil,
}

export const allBindingUtils: TLAnyBindingUtilConstructor[] = Object.values(BindingUtils)
