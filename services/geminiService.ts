
import { GoogleGenAI } from "@google/genai";
import { Asset, Transaction } from "../types";

export const getFinancialAdvice = async (
  prompt: string, 
  assets: Asset[], 
  transactions: Transaction[]
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
  
  const assetSummary = assets.map(a => `${a.name} (${a.symbol}): $${a.value.toLocaleString()} (${a.allocation}%)`).join('\n');
  const expenseSummary = transactions
    .filter(t => t.type === 'Expense')
    .map(t => `${t.category}: $${t.amount}`).join('\n');

  const systemInstruction = `
    You are NVK-AI, a world-class certified financial planner and investment strategist. 
    Analyze the user's financial data and provide highly professional, concise, and actionable advice.
    
    User Current Portfolio:
    ${assetSummary}
    
    Recent Monthly Expenses:
    ${expenseSummary}
    
    Focus on risk management, tax efficiency, and long-term growth. Use professional financial terminology but keep answers readable.
    Format your response with clean Markdown. Always be encouraging but realistic about market risks.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    return response.text || "I'm sorry, I couldn't generate a response at this time.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error communicating with the financial strategist. Please check your connection.";
  }
};
