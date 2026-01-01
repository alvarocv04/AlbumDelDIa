import { GoogleGenAI } from "@google/genai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

// Log API key status (not the key itself for security)
console.log("🔑 Gemini API Key configured:", apiKey ? `Yes (${apiKey.length} chars)` : "❌ NO - Check .env file");

const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

import { db } from './firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

// ... (existing imports and setup)

export const generateAlbumDescription = async (albumId: string, artist: string, album: string, language: string = 'es'): Promise<string> => {
  if (!ai) {
    console.error("❌ Gemini API not initialized - missing VITE_GEMINI_API_KEY in .env");
    return language === 'es'
      ? "Descubre los sonidos únicos de este álbum. Una experiencia musical por explorar."
      : "Discover the unique sounds of this album. A journey waiting to be heard.";
  }

  try {
    const descriptionField = language === 'es' ? 'description_es' : 'description_en';

    // 1. Check Cache in Firestore
    if (albumId) {
      const albumRef = doc(db, 'albums', albumId);
      const albumSnap = await getDoc(albumRef);

      if (albumSnap.exists()) {
        const data = albumSnap.data();
        if (data[descriptionField]) {
          console.log(`📖 Description found in cache (${language})`);
          return data[descriptionField];
        }
      }
    }

    // 2. Generate content if not in cache
    console.log(`🎵 Generating description for: "${album}" by "${artist}"...`);

    const prompt = language === 'es'
      ? `Escribe una descripción breve y atractiva (máximo 100 palabras) para el álbum "${album}" de "${artist}". 
         Incluye: contexto histórico del álbum, datos interesantes de la banda/artista, estilo musical y su importancia. 
         No uses encabezados markdown ni listas. Escribe en un tono informativo pero apasionado.`
      : `Write a short, engaging description (max 100 words) for the album "${album}" by "${artist}". 
         Include: historical context, interesting facts about the band/artist, musical style, and significance. 
         Don't use markdown headers or lists. Write in an informative but passionate tone.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
    });

    const text = response.text || "";

    // 3. Save to Cache
    if (albumId && text) {
      try {
        const albumRef = doc(db, 'albums', albumId);
        await updateDoc(albumRef, { [descriptionField]: text });
        console.log(`💾 Description cached to Firestore (${language})`);
      } catch (saveError) {
        console.error("⚠️ Failed to save description to cache:", saveError);
      }
    }

    console.log(`✅ Description generated successfully (${text.length} chars)`);
    return text;
  } catch (error: any) {
    console.error("❌ Error generating description:", error?.message || error);
    console.error("Full error:", error);

    return language === 'es'
      ? "Descubre los sonidos únicos de este álbum. Una experiencia musical por explorar."
      : "Discover the unique sounds of this album. A journey waiting to be heard.";
  }
};


export const getAlbumChatResponse = async (
  artist: string,
  album: string,
  messages: { role: 'user' | 'model'; parts: { text: string }[] }[],
  language: string = 'es'
): Promise<string> => {
  if (!ai) {
    return language === 'es' ? "Servicio no disponible." : "Service unavailable.";
  }

  try {
    // Construct a prompt that includes the history and system instruction context
    // because we are using the simple generateContent method.
    const systemInstruction = language === 'es'
      ? `Eres un experto musical. Tu misión es responder datos sobre el álbum "${album}" de "${artist}". 
         RESTRICCIONES CRÍTICAS:
         1. Mantén un tono apasionado y profesional.
         2. No des opiniones subjetivas sobre temas políticos, religiosos ni feministas
         `
      : `You are a music expert. Your mission is to answer information about the album "${album}" by "${artist}".
         CRITICAL RESTRICTIONS:
         1. Maintain a passionate and professional tone.
         2. Do not give a subjective opinion about political, religious or feminist topics `;

    // Flatten history for the prompt
    let fullPrompt = `${systemInstruction}\n\n`;
    messages.forEach(msg => {
      fullPrompt += `${msg.role === 'user' ? 'User' : 'Model'}: ${msg.parts[0].text}\n`;
    });
    fullPrompt += `Model: `;

    console.log(`💬 Sending chat prompt (${fullPrompt.length} chars)`);

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: fullPrompt, // Using prompt construction to avoid SDK ambiguity
    });

    const text = response.text || "";
    return text;
  } catch (error: any) {
    console.error("❌ Error in chat:", error);
    return language === 'es' ? "Lo siento, hubo un error." : "Sorry, there was an error.";
  }
};

