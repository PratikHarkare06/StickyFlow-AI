import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, X, Send, Bot, User, Loader2 } from 'lucide-react';
import { Note } from '../types';

interface AIChatbotProps {
  notes: Note[];
}

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export const AIChatbot: React.FC<AIChatbotProps> = ({ notes }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'assistant', content: "Hi! I'm your StickyFlow AI Assistant. I know everything about your notes. What would you like to know?" }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const nvidiaKey = import.meta.env.VITE_NVIDIA_API_KEY;
      if (!nvidiaKey) {
        setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: "⚠️ Please add VITE_NVIDIA_API_KEY to your .env.local file to use the AI Assistant." }]);
        setIsLoading(false);
        return;
      }

      // Prepare context from notes
      const activeNotes = notes.filter(n => !n.isTrashed);
      const notesContext = activeNotes.map(n => ({
        content: new DOMParser().parseFromString(n.content, 'text/html').body.textContent || '',
        category: n.category,
        isCompleted: n.isCompleted,
        status: n.status
      }));

      const systemPrompt = `You are the StickyFlow AI Assistant. You help the user manage and understand their sticky notes. 
Here is a summary of all their active notes in JSON format: 
${JSON.stringify(notesContext)}

Answer the user's questions strictly based on this data. Be concise, helpful, and friendly. Do not use complex formatting, just standard text and bullet points.`;

      const apiMessages = [
        { role: 'system', content: systemPrompt },
        ...messages.filter(m => m.role !== 'system').map(m => ({ role: m.role, content: m.content })),
        { role: 'user', content: userMessage.content }
      ];

      const res = await fetch('/api/nvidia/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${nvidiaKey}`
        },
        body: JSON.stringify({
          model: "minimaxai/minimax-m2.7",
          messages: apiMessages,
          temperature: 0.3,
          max_tokens: 1024,
          stream: true
        })
      });

      if (!res.ok) {
        let errMsg = `API request failed with status ${res.status}`;
        try {
          const errData = await res.json();
          if (errData?.error?.message) {
            errMsg = errData.error.message;
          }
        } catch {}
        throw new Error(errMsg);
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder('utf-8');
      
      const assistantId = Date.now().toString();
      setMessages(prev => [...prev, { id: assistantId, role: 'assistant', content: '' }]);

      let fullReply = '';
      let done = false;

      while (!done && reader) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n').filter(l => l.trim().length > 0);
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const dataStr = line.replace('data: ', '').trim();
              if (dataStr === '[DONE]') break;
              try {
                const parsed = JSON.parse(dataStr);
                const token = parsed?.choices?.[0]?.delta?.content || '';
                fullReply += token;
                setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content: fullReply } : m));
              } catch (e) {
                // partial chunks or parsing errors
              }
            }
          }
        }
      }
    } catch (error: any) {
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: `⚠️ Error: ${error.message}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-50 p-4 rounded-full bg-accent-blue text-black shadow-2xl shadow-blue-500/20 transition-all ${isOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
      >
        <MessageSquare className="w-6 h-6" />
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 w-80 sm:w-96 h-[500px] max-h-[80vh] bg-card-app border border-border-app rounded-3xl shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="p-4 border-b border-border-app flex items-center justify-between bg-black/20">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-accent-blue/20 flex items-center justify-center text-accent-blue">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-text-app">AI Assistant</h3>
                  <p className="text-[10px] text-accent-blue uppercase tracking-widest font-black">Online</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map(msg => (
                <div key={msg.id} className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center ${msg.role === 'user' ? 'bg-text-app/10 text-white' : 'bg-accent-blue/20 text-accent-blue'}`}>
                    {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>
                  <div className={`p-3 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-accent-blue text-black rounded-tr-sm' : 'bg-text-app/5 text-gray-300 rounded-tl-sm'}`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3 max-w-[85%]">
                  <div className="w-8 h-8 shrink-0 rounded-full bg-accent-blue/20 text-accent-blue flex items-center justify-center">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="p-3 rounded-2xl bg-text-app/5 rounded-tl-sm flex items-center gap-2">
                    <Loader2 className="w-4 h-4 text-accent-blue animate-spin" />
                    <span className="text-xs text-gray-500 font-medium">Thinking...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-border-app bg-black/20">
              <div className="flex items-center gap-2 bg-black/40 border border-border-app rounded-2xl p-2 focus-within:border-accent-blue/50 transition-colors">
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                  placeholder="Ask about your notes..."
                  className="flex-1 bg-transparent text-sm text-white px-2 py-1 outline-none"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="p-2 bg-accent-blue text-black rounded-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
