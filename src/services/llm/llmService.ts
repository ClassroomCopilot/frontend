import axios from '../../axiosConfig';

export const sendPrompt = async (data: { model: string, prompt: string }) => {
  const response = await axios.post('/api/llm/ollama_text_prompt', data);
  return response.data;
};

export const sendVisionPrompt = async (data: { model: string, imagePath: string, prompt: string }) => {
  const response = await axios.post('/api/llm/ollama_vision_prompt', data);
  return response.data;
};
