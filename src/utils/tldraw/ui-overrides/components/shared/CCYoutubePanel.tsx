import React from 'react';
import { useEditor, createShapeId } from '@tldraw/tldraw';
import { BasePanel } from './BasePanel';
import { BUTTON_STYLES } from './panel-styles';
import { CC_SHAPE_CONFIGS } from '../../../cc-base/cc-configs';

const PANEL_TYPES = [
  { id: 'cc-shapes', label: 'Shapes' },
  { id: 'slides', label: 'Slides' },
  { id: 'youtube', label: 'YouTube' },
];

interface CCYoutubePanelProps {
  onPanelTypeChange: (type: string) => void;
  isExpanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
}

export const CCYoutubePanel: React.FC<CCYoutubePanelProps> = ({
  onPanelTypeChange,
  isExpanded,
  onExpandedChange,
}) => {
  const editor = useEditor();
  const [videoUrl, setVideoUrl] = React.useState<string>(CC_SHAPE_CONFIGS['cc-youtube-embed'].defaultProps.video_url as string);

  const handleCreateYoutubeEmbed = () => {
    if (!editor) return;

    const { x, y } = editor.getViewportScreenCenter();
    const config = CC_SHAPE_CONFIGS['cc-youtube-embed'];
    const shapeId = createShapeId();

    editor.createShape({
      id: shapeId,
      type: 'cc-youtube-embed',
      x: x - config.xOffset,
      y: y - config.yOffset,
      rotation: 0,
      isLocked: false,
      props: {
        ...config.defaultProps,
        w: config.width,
        h: config.height,
        video_url: videoUrl,
      },
    });
  };

  return (
    <BasePanel
      panelTypes={PANEL_TYPES}
      currentPanelType="youtube"
      onPanelTypeChange={onPanelTypeChange}
      isExpanded={isExpanded}
      onExpandedChange={onExpandedChange}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '8px' }}>
        <input
          type="text"
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          onPaste={(e) => {
            e.preventDefault();
            const pastedText = e.clipboardData.getData('text');
            setVideoUrl(pastedText);
          }}
          placeholder="Enter YouTube URL"
          style={{
            padding: '8px',
            borderRadius: '4px',
            border: '1px solid var(--color-muted-1)',
            fontSize: '14px',
            backgroundColor: 'var(--color-background)',
            color: 'var(--color-text)',
            width: '100%',
          }}
        />
        <button 
          onClick={handleCreateYoutubeEmbed}
          style={BUTTON_STYLES.SHAPE_BUTTON}
          onMouseOver={(e) => {
            Object.assign(e.currentTarget.style, BUTTON_STYLES.SHAPE_BUTTON_HOVER);
          }}
          onMouseOut={(e) => {
            Object.assign(e.currentTarget.style, BUTTON_STYLES.SHAPE_BUTTON);
          }}
        >
          Add YouTube Video
        </button>
      </div>
    </BasePanel>
  );
}; 