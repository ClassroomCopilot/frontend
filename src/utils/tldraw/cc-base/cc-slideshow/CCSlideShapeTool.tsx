import { BaseBoxShapeTool, StateNode } from '@tldraw/tldraw'

export class CCSlideShowShapeTool extends BaseBoxShapeTool {
  static override id = 'cc-slideshow'
  static override initial = 'idle'
  override shapeType = 'cc-slideshow'

  override onPointerDown = () => {
    return this.transition('pointing')
  }

  override onPointerUp: StateNode['onPointerUp'] = () => {
    const shape = this.editor.getSelectedShapes()[0]
    if (shape?.type === 'cc-slideshow') {
      // Switch to select tool after creating slideshow
      this.editor.setCurrentTool('select')
    }
    return this.transition('idle')
  }
}

export class CCSlideShapeTool extends BaseBoxShapeTool {
  static override id = 'cc-slide'
  static override initial = 'idle'
  override shapeType = 'cc-slide'

  override onPointerDown = () => {
    // Check if there's a selected slideshow before allowing slide creation
    const selectedShapes = this.editor.getSelectedShapes()
    const slideshow = selectedShapes.find((s) => s.type === 'cc-slideshow')
    
    if (!slideshow) {
      this.editor.setCurrentTool('select')
      return this.transition('idle')
    }

    return this.transition('pointing')
  }

  override onPointerUp: StateNode['onPointerUp'] = () => {
    return this.transition('idle')
  }
} 