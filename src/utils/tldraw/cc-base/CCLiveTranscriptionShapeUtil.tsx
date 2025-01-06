import React from 'react';
import { CCBaseShape, CCBaseShapeUtil } from './CCBaseShapeUtil';
import { TLShapeId } from 'tldraw';
import { TranscriptionManager } from './cc-transcription/TranscriptionManager';
import { ccShapeProps, getDefaultCCLiveTranscriptionProps } from './cc-props';
import { ccShapeMigrations } from './cc-migrations';
import { CC_BASE_STYLE_CONSTANTS } from './cc-styles';

export interface TranscriptionSegment {
  id: string
  text: string
  completed: boolean
  start: string
  end: string
}

export interface CCLiveTranscriptionShape extends CCBaseShape {
  type: 'cc-live-transcription'
  props: {
    title: string
    w: number
    h: number
    headerColor: string
    isLocked: boolean
    isRecording: boolean
    segments: TranscriptionSegment[]
    currentSegment?: TranscriptionSegment
    lastProcessedSegment?: string // Track last processed segment to avoid duplicates
  }
}

export class CCLiveTranscriptionShapeUtil extends CCBaseShapeUtil<CCLiveTranscriptionShape> {
  static override type = 'cc-live-transcription' as const;
  static override props = ccShapeProps.liveTranscription;
  static override migrations = ccShapeMigrations.liveTranscription;

  override getDefaultProps(): CCLiveTranscriptionShape['props'] {
    return getDefaultCCLiveTranscriptionProps() as CCLiveTranscriptionShape['props'];
  }

  override renderContent = (shape: CCLiveTranscriptionShape) => {
    const { isRecording, segments, currentSegment } = shape.props;
    const contentHeight = shape.props.h - CC_BASE_STYLE_CONSTANTS.BASE_HEADER_HEIGHT - 2 * CC_BASE_STYLE_CONSTANTS.CONTENT_PADDING;
    const controlsHeight = 80;
    const transcriptHeight = contentHeight - controlsHeight;

    return (
      <div style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        pointerEvents: 'all'
      }}>
        {/* Microphone Controls */}
        <div style={{
          height: controlsHeight,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '16px',
          borderBottom: '1px solid #e0e0e0',
          padding: '8px'
        }}>
          <div
            role="button"
            tabIndex={0}
            onPointerDown={(e) => {
              e.stopPropagation();
            }}
            onClick={(e) => {
              e.stopPropagation();
              this.toggleRecording(shape);
            }}
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              border: 'none',
              backgroundColor: isRecording ? '#f44336' : '#4CAF50',
              color: 'white',
              fontSize: '24px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
              transition: 'all 0.3s ease',
              userSelect: 'none',
            }}
          >
            {isRecording ? '⏹' : '🎤'}
          </div>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start'
          }}>
            <div style={{ 
              fontSize: '16px', 
              fontWeight: 'bold',
              color: isRecording ? '#f44336' : '#4CAF50'
            }}>
              {isRecording ? 'Recording...' : 'Ready'}
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              {isRecording ? 'Click to stop' : 'Click to start recording'}
            </div>
          </div>
        </div>

        {/* Transcription Content */}
        <AutoScrollContainer height={transcriptHeight}>
          {/* Completed Segments */}
          {segments.map((segment) => (
            <div
              key={segment.id}
              style={{
                padding: '8px',
                backgroundColor: '#FFF',
                borderRadius: '8px',
                fontSize: '14px',
                lineHeight: '1.4',
                color: '#000000',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                width: '100%',
                transition: 'color 0.3s ease',
                display: 'flex',
                flexDirection: 'column',
                gap: '2px'
              }}
            >
              <div style={{ 
                fontSize: '11px', 
                color: '#888',
                fontFamily: 'monospace'
              }}>
                {segment.start}s - {segment.end}s
              </div>
              <div>
                {segment.text}
              </div>
            </div>
          ))}
          
          {/* Current Segment */}
          {currentSegment && (
            <div
              style={{
                padding: '8px',
                backgroundColor: '#f5f5f5',
                borderRadius: '8px',
                fontSize: '14px',
                lineHeight: '1.4',
                color: '#666666',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                width: '100%',
                transition: 'color 0.3s ease',
                display: 'flex',
                flexDirection: 'column',
                gap: '2px'
              }}
            >
              <div style={{ 
                fontSize: '11px', 
                color: '#888',
                fontFamily: 'monospace'
              }}>
                {currentSegment.start}s - {currentSegment.end}s
              </div>
              <div>
                {currentSegment.text}
              </div>
            </div>
          )}
          
          {/* Initial State */}
          {!isRecording && segments.length === 0 && !currentSegment && (
            <div
              style={{
                padding: '8px',
                backgroundColor: '#FFF',
                borderRadius: '8px',
                fontSize: '18px',
                lineHeight: '1.5',
                color: '#666666',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                width: '100%',
                textAlign: 'center'
              }}
            >
              Click the microphone to start
            </div>
          )}
        </AutoScrollContainer>
      </div>
    )
  }

  private toggleRecording(shape: CCLiveTranscriptionShape) {
    console.log('🎤 Toggle recording clicked');
    const { id } = shape;
    const { isRecording } = shape.props;

    console.log('Current state:', { id, isRecording });

    // When starting new recording, reset to default props
    const newProps = !isRecording ? {
      ...this.getDefaultProps(),
      isRecording: true,
      w: shape.props.w,
      h: shape.props.h,
    } : {
      ...shape.props,
      isRecording: false,
    };

    this.editor.updateShape<CCLiveTranscriptionShape>({
      id,
      type: 'cc-live-transcription',
      props: newProps,
    });

    const manager = TranscriptionManager.getManager(this.editor);
    console.log('Got transcription manager');

    if (!isRecording) {
      console.log('Starting transcription...');
      manager.startTranscription(id);
    } else {
      console.log('Stopping transcription...');
      manager.stopTranscription();
    }
  }

  updateText(
    id: TLShapeId, 
    text: string, 
    isConfirmed: boolean,
    metadata?: { start: string | number, end: string | number }
  ) {
    console.log('📝 Updating text:', { id, text, isConfirmed, metadata });
    const shape = this.editor.getShape<CCLiveTranscriptionShape>(id);
    if (!shape) {
      console.warn('❌ Shape not found for updating text:', id);
      return;
    }

    // Format timestamps consistently
    const start = typeof metadata?.start === 'number' ? metadata.start.toFixed(3) : metadata?.start;
    const end = typeof metadata?.end === 'number' ? metadata.end.toFixed(3) : metadata?.end;

    const segmentId = isConfirmed ? crypto.randomUUID() : 'current';
    const newSegment: TranscriptionSegment = {
      id: segmentId,
      text,
      completed: isConfirmed,
      start: start || '0.000',
      end: end || '0.000'
    };

    // Handle current (incomplete) segment
    if (!isConfirmed) {
      // Only update if text has changed
      if (shape.props.currentSegment?.text !== text) {
        this.editor.updateShape<CCLiveTranscriptionShape>({
          id,
          type: 'cc-live-transcription',
          props: { 
            ...shape.props,
            currentSegment: newSegment
          },
        });
      }
      return;
    }

    // Handle completed segment
    let segments = [...shape.props.segments];
    
    // Check if this segment is different from the last processed one
    // and not already in our segments list
    const isDuplicate = segments.some(s => s.text === text);
    if (shape.props.lastProcessedSegment !== text && !isDuplicate) {
      // Add new completed segment
      segments.push(newSegment);

      this.editor.updateShape<CCLiveTranscriptionShape>({
        id,
        type: 'cc-live-transcription',
        props: { 
          ...shape.props,
          segments,
          lastProcessedSegment: text,
          // Clear current segment if it matches the completed one
          currentSegment: shape.props.currentSegment?.text === text ? undefined : shape.props.currentSegment
        },
      });
    }

    console.log('✅ Text updated');
  }
}

// Auto-scrolling container component
function AutoScrollContainer({ children, height }: { children: React.ReactNode, height: number }) {
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [children]);

  return (
    <div 
      ref={containerRef}
      style={{
        height,
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        gap: '8px',
        overflow: 'auto',
        scrollBehavior: 'smooth'
      }}
    >
      {children}
    </div>
  );
} 