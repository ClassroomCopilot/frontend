import React from 'react';
import { useEditor } from '@tldraw/tldraw';
import { CC_SHAPE_CONFIGS } from '../../../cc-base/cc-configs';
import { createYoutubeShapeAtCenter } from '../../../cc-base/shape-helpers/youtube-helpers';
import './panel.css';

export const CCYoutubePanel: React.FC = () => {
  const editor = useEditor();
  const [videoUrl, setVideoUrl] = React.useState<string>(CC_SHAPE_CONFIGS['cc-youtube-embed'].defaultProps.video_url as string);

  return (
    <div className="panel-container">
      <div className="panel-section">
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
          className="panel-input"
        />
        <button 
          onClick={() => editor && createYoutubeShapeAtCenter(editor, videoUrl)}
          className="shape-button"
        >
          Add YouTube Video
        </button>
      </div>
    </div>
  );
}; 