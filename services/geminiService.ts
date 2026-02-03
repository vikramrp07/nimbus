import { GoogleGenAI } from "@google/genai";
import { Transaction } from "../types";

const SYSTEM_INSTRUCTION = `You are Nimbus, a minimalist and wise financial assistant. 
Analyze the user's recent transactions and provide a SINGLE, short, helpful, and calm sentence of advice or observation. 
Focus on spending patterns, encouraging saving, or pointing out unusual expenses. 
Do not use markdown. Keep it under 20 words. Be friendly but professional.`;

export const getFinancialInsight = async (transactions: Transaction[]): Promise<string> => {
  try {
    if (!process.env.API_KEY) {
      return "Connect your API key to unlock smart insights.";
    }

    const recentTx = transactions.slice(0, 10).map(t => 
      `${t.date.split('T')[0]}: ${t.description} - ₹${t.amount} (${t.category})`
    ).join('\n');

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Here are my recent transactions:\n${recentTx}\n\nWhat is your insight?`,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        thinkingConfig: { thinkingBudget: 0 } // Disable thinking for faster, simple response
      }
    });

    return response.text || "Your spending looks balanced today.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Unable to generate insights right now.";
  }
};