import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });



export const generateAlbumDescription = async (artist: string, album: string): Promise<string> => {
  try {
    const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `Write a short, engaging description (max 80 words) for the album "${album}" by "${artist}". Focus on its musical style, significance, and vibe. Don't use markdown headers.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Error generating description:", error);
    return "Discover the unique sounds of this album. A journey waiting to be heard.";
  }
};
