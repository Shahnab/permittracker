
import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("API_KEY environment variable not set. AI Assistant will not work.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

const systemInstruction = `You are an expert assistant for Vietnamese immigration law and expat work permits.
Your audience is HR professionals who may be new to their roles.
Provide clear, accurate, and step-by-step guidance based on user queries.
Format your responses using markdown for readability, including headings, lists, and bold text.
Always be concise and professional.`;

export const getProcessGuidance = async (prompt: string): Promise<string> => {
  if (!API_KEY) {
    return "API Key is not configured. Please contact your administrator.";
  }
  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            systemInstruction: systemInstruction,
        }
    });
    return response.text;
  } catch (error) {
    console.error("Error fetching guidance from Gemini API:", error);
    return "Sorry, I encountered an error while processing your request. Please try again later.";
  }
};
