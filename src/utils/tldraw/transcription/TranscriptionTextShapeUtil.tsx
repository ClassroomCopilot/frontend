import { ShapeUtil, Rectangle2d } from '@tldraw/tldraw';
import { ITranscriptionTextShape } from './microphone-shape-types';
import { transcriptionTextShapeProps } from './microphone-shape-props';

export class TranscriptionTextShapeUtil extends ShapeUtil<ITranscriptionTextShape> {
  static override type = 'transcriptionText' as const;
  static override props = transcriptionTextShapeProps;

  getDefaultProps(): ITranscriptionTextShape['props'] {
    return {
      text: '',
      w: 200,
      h: 30,
      sentenceId: '',
      isComplete: false,
    };
  }

  component(shape: ITranscriptionTextShape) {
    const { text, isComplete } = shape.props;
    return (
      <div style={{ color: isComplete ? 'white' : 'grey', width: shape.props.w, height: shape.props.h }}>
        {text}
      </div>
    );
  }

  getGeometry(shape: ITranscriptionTextShape) {
    return new Rectangle2d({
      width: shape.props.w,
      height: shape.props.h,
      isFilled: true,
    });
  }

  indicator(shape: ITranscriptionTextShape) {
    return (
      <rect
        x={shape.x}
        y={shape.y}
        width={shape.props.w}
        height={shape.props.h}
        fill="none"
        stroke="blue"
        strokeWidth="1"
      />
    );
  }
}