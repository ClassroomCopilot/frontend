import React from 'react';
import { useEditor } from '@tldraw/tldraw';
import { BUTTON_STYLES } from './panel-styles';
import { CC_SHAPE_CONFIGS } from '../../../cc-base/cc-configs';
import { createYoutubeShapeAtCenter } from '../../../cc-base/shape-helpers/youtube-helpers';

export const CCYoutubePanel: React.FC = () => {
  const editor = useEditor();
  const [videoUrl, setVideoUrl] = React.useState<string>(CC_SHAPE_CONFIGS['cc-youtube-embed'].defaultProps.video_url as string);

  return (
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
        onClick={() => editor && createYoutubeShapeAtCenter(editor, videoUrl)}
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
  );
}; 