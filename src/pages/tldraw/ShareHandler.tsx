import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { logger } from '../../debugConfig';

interface LaunchParams {
  files: FileSystemFileHandle[];
}

interface LaunchQueue {
  setConsumer(callback: (params: LaunchParams) => Promise<void>): void;
}

interface WindowWithLaunchQueue extends Window {
  launchQueue: LaunchQueue;
}

const ShareHandler = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const processSharedData = async () => {
      try {
        // Handle files shared through Web Share Target API
        if ('launchQueue' in window) {
          (window as WindowWithLaunchQueue).launchQueue.setConsumer(async (launchParams: LaunchParams) => {
            if (!launchParams.files.length) {
              logger.debug('share-handler', 'No files shared');
              return;
            }

            for (const fileHandle of launchParams.files) {
              const file = await fileHandle.getFile();
              logger.info('share-handler', 'Processing shared file', { 
                name: file.name,
                type: file.type,
                size: file.size
              });

              // Navigate to single player with the shared file
              // You might want to modify this based on your needs
              navigate('/single-player', { 
                state: { 
                  sharedFile: file 
                }
              });
            }
          });
        }

        // Handle URL parameters for text/url sharing
        const urlParams = new URLSearchParams(window.location.search);
        const title = urlParams.get('title');
        const text = urlParams.get('text');
        const url = urlParams.get('url');

        if (title || text || url) {
          logger.info('share-handler', 'Processing shared content', { 
            title, 
            text, 
            url 
          });

          // Navigate to single player with the shared content
          navigate('/single-player', { 
            state: { 
              sharedContent: { title, text, url } 
            }
          });
        }
      } catch (error) {
        logger.error('share-handler', 'Error processing shared content', { error });
      }
    };

    processSharedData();
  }, [navigate]);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh' 
    }}>
      Processing shared content...
    </div>
  );
};

export default ShareHandler; 