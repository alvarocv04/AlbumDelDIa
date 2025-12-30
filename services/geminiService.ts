import { GoogleGenAI } from "@google/genai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

// Log API key status (not the key itself for security)
console.log("🔑 Gemini API Key configured:", apiKey ? `Yes (${apiKey.length} chars)` : "❌ NO - Check .env file");

const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const generateAlbumDescription = async (artist: string, album: string, language: string = 'es'): Promise<string> => {
  if (!ai) {
    console.error("❌ Gemini API not initialized - missing VITE_GEMINI_API_KEY in .env");
    return language === 'es'
      ? "Descubre los sonidos únicos de este álbum. Una experiencia musical por explorar."
      : "Discover the unique sounds of this album. A journey waiting to be heard.";
  }

  try {
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

