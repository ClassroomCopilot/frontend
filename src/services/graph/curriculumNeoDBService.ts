export async function uploadCurriculum(file: File, backendUrl: string) {
    const formData = new FormData();
    formData.append("file", file);
    
    try {
      const response = await fetch(`${backendUrl}/api/database/curriculum/upload-subject-curriculum`, {
        method: 'POST',
        body: formData,
      });
  
      if (response.status === 200) {
        const result = await response.json();
        console.log(result);
        alert('Upload Successful!');
      } else {
        alert('Upload failed!');
      }
    } catch (error) {
      console.error('Error uploading curriculum:', error);
      alert('Upload failed!');
    }
  }

export async function uploadSubjectCurriculum(file: File, backendUrl: string) {
    const formData = new FormData();
    formData.append("file", file);
  
    try {
      const response = await fetch(`${backendUrl}/api/database/curriculum/upload-subject-curriculum`, {
        method: 'POST',
        body: formData,
      });
  
      if (response.status === 200) {
        const result = await response.json();
        console.log(result);
        alert('Upload Successful!');
      } else {
        alert('Upload failed!');
      }
    } catch (error) {
      console.error('Error uploading curriculum:', error);
      alert('Upload failed!');
    }
  }