
import { GoogleGenAI } from "@google/genai";

// Fix: Strictly following @google/genai initialization guidelines
export const getCampusInsights = async (attendanceStats: any) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are an AI Campus Administrator. Analyze the following weekly attendance percentages and provide 3 short, actionable bullet points to improve student engagement: ${JSON.stringify(attendanceStats)}. Keep it brief and professional.`,
      config: {
        temperature: 0.7,
        topP: 0.8,
      }
    });
    return response.text || "No insights available at this time.";
  } catch (error) {
    console.error("Gemini AI Error:", error);
    return "Failed to fetch AI insights. Please check your connectivity.";
  }
};
