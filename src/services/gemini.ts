import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const getCountryFact = async (country: string, topic: string) => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Tell me one fascinating, punchy fact about ${topic} in ${country}. Keep it under 3 sentences.`,
    config: {
      systemInstruction: `You are a world-class cultural historian and travel guide. Your goal is to provide "bite-sized" learning. Be engaging but extremely concise. No long paragraphs.`,
    },
  });
  return response.text;
};

export const askCountryQuestion = async (country: string, question: string) => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: question,
    config: {
      systemInstruction: `You are the 'Desh Pardesh Explorer' guide. Answer questions about ${country} in 2-3 short sentences max. Use Markdown for formatting. Be brief and direct.`,
    },
  });
  return response.text;
};

export const generateQuiz = async (country: string, topics: string[], difficulty: 'easy' | 'medium' | 'hard' = 'medium') => {
  const topicsList = topics.length > 0 ? topics.join(", ") : "general culture, history, and geography";
  const count = difficulty === 'easy' ? 5 : difficulty === 'medium' ? 8 : 10;
  
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Generate ${count} multiple-choice questions about ${country} at a ${difficulty} difficulty level. 
    Focus on these topics: ${topicsList}. 
    ${difficulty === 'easy' ? 'Questions should be basic and well-known facts.' : difficulty === 'hard' ? 'Questions should be challenging, obscure, or highly detailed.' : 'Questions should be of moderate difficulty.'}
    Include 4 options for each and indicate the correct answer.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: "array",
        items: {
          type: "object",
          properties: {
            question: { type: "string" },
            options: { type: "array", items: { type: "string" } },
            correctAnswer: { type: "string" },
            explanation: { type: "string" }
          },
          required: ["question", "options", "correctAnswer", "explanation"]
        }
      }
    }
  });
  return JSON.parse(response.text);
};
