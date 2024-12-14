import {
  HTMLContainer,
  Rectangle2d,
  ShapeUtil,
  getDefaultColorTheme,
  resizeBox,
} from '@tldraw/tldraw'
import { microphoneShapeMigrations } from './microphone-shape-migrations'
import { microphoneShapeProps } from './microphone-shape-props'
import { IMicrophoneShape } from './microphone-shape-types'
import MicrophoneStateTool from './MicrophoneStateTool'

const TRANSCRIPTION_MANAGER_KEY = Symbol('transcriptionManager');

export class MicrophoneShapeUtil extends ShapeUtil<IMicrophoneShape> {
  static override type = 'microphone' as const
  static override props = microphoneShapeProps
  static override migrations = microphoneShapeMigrations

  override isAspectRatioLocked = () => false
  override canResize = () => true

  getDefaultProps(): IMicrophoneShape['props'] {
    return {
      w: 100,
      h: 200,
      color: 'red',
      isOn: false,
      buttonX: 37.5, // 37.5% from left
      buttonY: 50,   // 50% from top
      buttonWidth: 25, // 25% of shape width
      buttonHeight: 25, // 25% of shape height
    }
  }

  getGeometry(shape: IMicrophoneShape) {
    return new Rectangle2d({
      width: shape.props.w,
      height: shape.props.h,
      isFilled: true,
    })
  }

  component(shape: IMicrophoneShape) {
    const bounds = this.editor.getShapeGeometry(shape).bounds
    const theme = getDefaultColorTheme({ isDarkMode: this.editor.user.getIsDarkMode() })

    const toggleState = () => {
      this.toggleMicrophone(shape);
    }

    return (
      <HTMLContainer
        id={shape.id}
        style={{
          border: '1px solid black',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'all',
          backgroundColor: theme[shape.props.color].semi,
          color: theme[shape.props.color].solid,
        }}
      >
        <div className="relative inline-block" style={{ width: bounds.width, height: bounds.height }}>
          <div className="w-1/2 h-1/3 bg-gray-300 rounded-full mx-auto"></div>
          <div 
            className="absolute"
            style={{
              left: `${shape.props.buttonX}%`,
              top: `${shape.props.buttonY}%`,
              width: `${shape.props.buttonWidth}%`,
              height: `${shape.props.buttonHeight}%`,
            }}
          >
            <button
              className={`w-full h-full ${
                shape.props.isOn ? 'bg-green-500' : 'bg-red-500'
              } rounded`}
              onClick={toggleState}
            ></button>
          </div>
        </div>
      </HTMLContainer>
    )
  }

  override onResize = (shape: IMicrophoneShape, info: any) => {
    return resizeBox(shape, info)
  }

  private toggleMicrophone(shape: IMicrophoneShape) {
    const { id } = shape
    const { isOn } = shape.props
  
    this.editor.updateShape<IMicrophoneShape>({
      id,
      type: 'microphone',
      props: { isOn: !isOn },
    })
  
    // Check the current tool
    if (this.editor.getCurrentToolId() === 'microphone') {
      const transcriptionManager = this.editor.store.get(TRANSCRIPTION_MANAGER_KEY);
      console.log("If an error occured, look at the line above this one");
      if (transcriptionManager instanceof MicrophoneStateTool) {
        if (!isOn) {
          transcriptionManager.startTranscription();
        } else {
          transcriptionManager.stopTranscription();
        }
      } else {
        console.log('TranscriptionManager not available or not of correct type');
      }
    }
  }

  indicator(shape: IMicrophoneShape) {
    const bounds = this.editor.getShapeGeometry(shape).bounds
    return (
      <rect
        x={bounds.minX}
        y={bounds.minY}
        width={bounds.width}
        height={bounds.height}
        fill="none"
        stroke="blue"
        strokeWidth={1}
      />
    )
  }
}