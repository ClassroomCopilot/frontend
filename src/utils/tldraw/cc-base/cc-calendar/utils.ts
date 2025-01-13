import { Editor } from '@tldraw/tldraw'
import { LoadingState, loadNodeSnapshotFromDatabase } from '../../../../services/tldraw/snapshotService'
import logger from '../../../../debugConfig'

export const openTldrawFile = async (
  path: string, 
  dbName: string,
  editor: Editor,
  setFileLoadingState: (state: LoadingState) => void
) => {
  logger.info('calendar-shape', '📂 Opening tldraw file', { 
    path,
    db_name: dbName
  });

  try {
    await loadNodeSnapshotFromDatabase(
      path,
      dbName,
      editor.store,
      setFileLoadingState
    );
  } catch (error) {
    logger.error('calendar-shape', '❌ Failed to open tldraw file', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};