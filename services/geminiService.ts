import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

let chatSession: Chat | null = null;

export const getChatSession = (): Chat => {
  if (!chatSession) {
    chatSession = ai.chats.create({
      model: 'gemini-3-pro-preview',
      config: {
        systemInstruction: "You are 'Al', a knowledgeable and chill music enthusiast assistant for the 'Albumaldia' app. You help users discover music, explain genres, and discuss the albums featured on the site. Keep your responses concise, engaging, and musically literate.",
      },
    });
  }
  return chatSession;
};

export const sendMessageToGemini = async (message: string): Promise<AsyncIterable<string>> => {
  const chat = getChatSession();
  
  // Create a generator to yield chunks of text
  async function* generateResponse() {
      const responseStream = await chat.sendMessageStream({ message });
      
      for await (const chunk of responseStream) {
        const c = chunk as GenerateContentResponse;
        if (c.text) {
          yield c.text;
        }
      }
  }

  return generateResponse();
};
