import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// In a real app, we would maintain a map of chat sessions per conversation
const chatSessions: Record<string, Chat> = {};

export const getOrCreateChatSession = (conversationId: string): Chat => {
  if (!chatSessions[conversationId]) {
    chatSessions[conversationId] = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: `You are a helpful, witty, and professional AI assistant in a chat application. 
        Keep your responses concise and conversational, suitable for a messaging app interface. 
        Do not use markdown headers or long paragraphs unless asked.`,
      },
    });
  }
  return chatSessions[conversationId];
};

export const sendMessageToGemini = async (
  conversationId: string, 
  message: string
): Promise<AsyncIterable<GenerateContentResponse>> => {
  const chat = getOrCreateChatSession(conversationId);
  
  try {
    const result = await chat.sendMessageStream({ message });
    return result;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};