
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getMarketInsights = async (currentPrice: number, history: any[]) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `The current Bitcoin price is $${currentPrice.toLocaleString()}. Recent history: ${JSON.stringify(history.slice(-5))}. Provide a short, professional market sentiment analysis in 2 sentences.`,
    });
    return response.text || "Market stable. Watching key resistance levels.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Error fetching AI market insights.";
  }
};

export const getCryptoAssistance = async (userPrompt: string, walletInfo: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are a helpful crypto trading assistant for an app called BitFlow.
      The user's wallet status: ${walletInfo}.
      The user asks: "${userPrompt}"
      Provide a concise, helpful, and friendly response. If they ask about buying, explain the steps briefly.`,
    });
    return response.text || "I'm here to help with your Bitcoin journey.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Sorry, I'm having trouble connecting to my brain right now.";
  }
};

export const getPricePrediction = async (currentPrice: number) => {
    // Using thinking for a complex reasoning task
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: `Analyze the hypothetical scenario: Bitcoin is at $${currentPrice}. Based on historical halving cycles and current macro trends, what is a likely target for the next 6 months? provide a JSON response.`,
            config: {
                thinkingConfig: { thinkingBudget: 4000 },
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        targetPrice: { type: Type.NUMBER },
                        reasoning: { type: Type.STRING },
                        confidence: { type: Type.STRING }
                    },
                    required: ["targetPrice", "reasoning", "confidence"]
                }
            }
        });
        return JSON.parse(response.text || "{}");
    } catch (e) {
        return null;
    }
}
