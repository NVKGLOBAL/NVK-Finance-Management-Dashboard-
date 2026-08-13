import React, { useState, useRef, useEffect } from 'react';
import Markdown from 'react-markdown';
import { 
  Send, 
  Bot, 
  User, 
  Loader2, 
  Sparkles,
  Info
} from 'lucide-react';
import { getFinancialAdvice } from '../services/geminiService';
import { ChatMessage, Asset, Transaction } from '../types';

interface ChatAssistantProps {
  assets: Asset[];
  transactions: Transaction[];
}

const ChatAssistant: React.FC<ChatAssistantProps> = ({ assets, transactions }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: "Hello! I'm your NVK-AI Financial Co-pilot. Based on your current portfolio and transaction history, I can provide personalized insights on budgeting, investments, and long-term planning. How can I help you today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const advice = await getFinancialAdvice(input, assets, transactions);
      setMessages(prev => [...prev, { role: 'assistant', content: advice }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: "I'm sorry, I encountered an error processing your request. Please try again later." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border-l border-slate-700 w-full lg:w-[400px] shadow-2xl relative">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50 backdrop-blur-md">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/20">
            <Bot className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm">NVK-AI Strategy</h3>
            <div className="flex items-center">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2 animate-pulse"></span>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Active Insight Mode</span>
            </div>
          </div>
        </div>
        <div className="p-2 text-slate-500 hover:text-slate-300 transition-colors cursor-help">
          <Sparkles className="h-4 w-4" />
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start hover:bg-slate-800/10 rounded-2xl p-2 -m-2 transition-colors'}`}>
            <div className={`flex max-w-[85%] ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'} items-start`}>
              <div className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center mt-1 border ${
                m.role === 'user' 
                  ? 'bg-slate-800 border-slate-700 ml-3' 
                  : 'bg-blue-600/10 border-blue-500/20 text-blue-400 mr-3'
              }`}>
                {m.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </div>
              <div className={`p-4 rounded-2xl ${
                m.role === 'user' 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20 rounded-tr-none' 
                  : 'bg-slate-800/50 border border-slate-700 text-slate-200 rounded-tl-none'
              }`}>
                <div className="markdown-body">
                  <Markdown>{m.content}</Markdown>
                </div>
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex items-center space-x-3 bg-slate-800/30 p-4 rounded-2xl border border-slate-800 rounded-tl-none">
              <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
              <span className="text-xs text-slate-400 font-medium font-mono uppercase tracking-tighter">Analyzing...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 bg-slate-900 border-t border-slate-800">
        <div className="relative group">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about allocation, savings..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl py-4 pl-5 pr-14 text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-slate-600 group-hover:border-slate-700"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className={`absolute right-2 top-2 bottom-2 w-10 flex items-center justify-center rounded-lg transition-all ${
              !input.trim() || isLoading 
                ? 'text-slate-700 cursor-not-allowed' 
                : 'text-blue-500 hover:bg-blue-500/10'
            }`}
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-3 flex items-center justify-center space-x-2">
          <Info className="h-3 w-3 text-slate-600" />
          <p className="text-[10px] text-slate-500 italic">
            NVK-AI is for projection purposes. Consult a CPA for tax/legal advice.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatAssistant;
