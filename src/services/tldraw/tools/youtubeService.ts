import axios from '../../../axiosConfig';

interface TranscriptLine {
  start: number;
  duration: number;
  text: string;
}

export async function getYoutubeTranscript(videoUrl: string): Promise<TranscriptLine[]> {
  try {
    const videoId = extractVideoId(videoUrl);
    if (!videoId) {
      throw new Error('Invalid YouTube URL');
    }

    const response = await axios.get(`/api/external/youtube-proxy?videoId=${videoId}`);
    console.log('Got Youtube video data:', response.data);
    return response.data.transcript;
  } catch (error) {
    console.error('Error fetching YouTube video data:', error);
    throw error;
  }
}

export function extractVideoId(url: string): string | null {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
}
