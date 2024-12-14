import { supabase } from '../../../supabaseClient';
import axios from '../../../axiosConfig';

export interface StandardizedOneNoteDetails {
  id: string;
  displayName: string;
  createdDateTime: string;
  lastModifiedDateTime: string;
  links: {
    oneNoteClientUrl: string;
    oneNoteWebUrl: string;
  };
}

export async function updateUserOneNoteDetails(userId: string, oneNoteDetails: StandardizedOneNoteDetails) {
  const { error } = await supabase
    .from('user_profiles')
    .update({ 
      one_note_details: oneNoteDetails,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId);

  if (error) {
    console.error('Error updating OneNote details:', error);
    throw error;
  }
}

export async function getOneNoteNotebooks(msAccessToken: string) {
  try {
    const response = await axios.get(`/api/msgraph/onenote/get-onenote-notebooks`, {
      headers: {
        'Authorization': `Bearer ${msAccessToken}`,
        'Content-Type': 'application/json'
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error getting notebooks:', error);
    throw error;
  }
}

export async function createOneNoteNotebook(msAccessToken: string, uid: string): Promise<StandardizedOneNoteDetails> {
  if (!msAccessToken) {
    throw new Error('Microsoft token not found');
  }

  try {
    const notebooks = await getOneNoteNotebooks(msAccessToken);
    const existingNotebook = notebooks.value.find((notebook: any) => 
      notebook.displayName === 'Classroom Copilot'
    );

    if (existingNotebook) {
      const standardizedNotebook = standardizeNotebookDetails(existingNotebook);
      await updateUserOneNoteDetails(uid, standardizedNotebook);
      return standardizedNotebook;
    }

    const response = await axios.post(
      `/api/msgraph/onenote/create-onenote-notebook?notebook_name=${encodeURIComponent('Classroom Copilot')}`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${msAccessToken}`,
          'Content-Type': 'application/json'
        },
      }
    );

    if (response.status !== 200) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const standardizedNotebook = standardizeNotebookDetails(response.data);
    await updateUserOneNoteDetails(uid, standardizedNotebook);
    return standardizedNotebook;
  } catch (error) {
    console.error('Error creating notebook:', error);
    throw error;
  }
}

export async function registerOneNoteUser(msAccessToken: string, uid: string) {
  try {
    return await createOneNoteNotebook(msAccessToken, uid);
  } catch (error) {
    console.error('Error registering Microsoft user:', error);
    throw error;
  }
}

function standardizeNotebookDetails(notebook: any): StandardizedOneNoteDetails {
  const notebookData = notebook.data || notebook;
  return {
    id: notebookData.id || '',
    displayName: notebookData.displayName || '',
    createdDateTime: notebookData.createdDateTime || '',
    lastModifiedDateTime: notebookData.lastModifiedDateTime || '',
    links: {
      oneNoteClientUrl: notebookData.links?.oneNoteClientUrl?.href || '',
      oneNoteWebUrl: notebookData.links?.oneNoteWebUrl?.href || '',
    },
  };
} 