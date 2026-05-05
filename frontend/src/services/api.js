import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

export const generateHeadlineHF = async (article, params = {}) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/generate-headline`, {
      article,
      params
    });
    // The backend sends back the raw array: [{ "generated_text": "..." }, ...]
    // Previous code returned `response.data.map(...)` but we updated our tabs to expect an array of objects.
    // It's safer to just return response.data to let tabs parse it out.
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || "Headline generation failed.");
  }
};

export const improveHeadlineGemini = async (article, currentHeadline) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/improve-headline`, {
      article,
      currentHeadline
    });
    return response.data.improvedText;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error(error.response?.data?.error || "Failed to contact local backend API");
  }
};
