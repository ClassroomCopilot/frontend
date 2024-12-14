import { BaseBoxShapeTool, StateNode, TLPointerEventInfo } from '@tldraw/tldraw'

export class SlideShowShapeTool extends BaseBoxShapeTool {
	static override id = 'slideshow'
	static override initial = 'idle'
	override shapeType = 'slideshow'

	override onPointerDown = () => {
		return this.transition('pointing')
	}

	override onPointerUp: StateNode['onPointerUp'] = () => {
		const shape = this.editor.getSelectedShapes()[0]
		if (shape?.type === 'slideshow') {
			// Switch to select tool after creating freeform slideshow
			this.editor.setCurrentTool('select')
		}
		return this.transition('idle')
	}
}

export class SlideShapeTool extends BaseBoxShapeTool {
	static override id = 'slide'
	static override initial = 'idle'
	override shapeType = 'slide'

	override onPointerDown = (info: TLPointerEventInfo) => {
		// Check if there's a selected slideshow before allowing slide creation
		const selectedShapes = this.editor.getSelectedShapes()
		const slideshow = selectedShapes.find((s) => s.type === 'slideshow')
		
		/*
		if (!slideshow) {
			console.log
			this.editor.setCurrentTool('select')
			return this.transition('idle')
		}
		*/

		// Call the parent class's method using super
		// super.onPointerDown?.(info)

		// Start creating the shape
		return this.transition('pointing')
	}

	override onPointerUp: StateNode['onPointerUp'] = () => {
		console.log('SlideShapeTool: onPointerUp')
		return this.transition('idle')
	}
}