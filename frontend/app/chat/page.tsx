'use client';
import { useState, useRef, useEffect } from 'react';
import { api } from '@/lib/api';

interface Message { role: 'user' | 'assistant'; content: string; }

const SUGGESTIONS = [
  'How much fertiliser should I apply for wheat?',
  'What is the MSP for rice this year?',
  'How do I treat leaf blight in cotton?',
  'Recommend intercropping for mustard',
];

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  async function send(text?: string) {
    const msg = (text ?? input).trim();
    if (!msg || loading) return;
    setInput(''); setLoading(true);
    const newMsgs: Message[] = [...messages, { role: 'user', content: msg }];
    setMessages(newMsgs);
    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }));
      const r = await api.post<{ reply: string }>('/api/chat/message', { message: msg, history });
      setMessages([...newMsgs, { role: 'assistant', content: r.reply }]);
    } catch { setMessages([...newMsgs, { role: 'assistant', content: 'Sorry, I could not process your request. Please check your API configuration.' }]); }
    finally { setLoading(false); }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-136px)] max-w-3xl">
      <div className="mb-4">
        <h1 className="text-xl font-semibold text-[#0f1a10]">Farm AI Chat</h1>
        <p className="text-[13px] text-[#7a9e80] mt-0.5">Ask anything about crops, pests, irrigation, or market prices</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-1">
        {messages.length === 0 && (
          <div className="text-center py-10">
            <div className="text-4xl mb-3">🤖</div>
            <div className="text-[14px] font-medium text-[#1a2b1c] mb-1">Agro Mind AI</div>
            <div className="text-[12px] text-[#7a9e80] mb-6">Your expert advisor for Indian agriculture</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {SUGGESTIONS.map((s, i) => (
                <button key={i} onClick={() => send(s)}
                  className="text-left p-3 bg-white border border-[#d4e8d6] rounded-lg text-[12.5px] text-[#1a2b1c] hover:border-[#4caf60] hover:bg-[#f3faf4] transition-colors">
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {m.role === 'assistant' && <div className="w-7 h-7 rounded-full bg-[#1a3a1f] flex items-center justify-center text-sm mr-2 mt-0.5 flex-shrink-0">🤖</div>}
            <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-[13px] leading-relaxed ${
              m.role === 'user' ? 'bg-[#2d6a35] text-white rounded-br-sm' : 'bg-white border border-[#d4e8d6] text-[#1a2b1c] rounded-bl-sm'
            }`}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="w-7 h-7 rounded-full bg-[#1a3a1f] flex items-center justify-center text-sm mr-2 flex-shrink-0">🤖</div>
            <div className="bg-white border border-[#d4e8d6] rounded-2xl rounded-bl-sm px-4 py-3">
              <div className="flex gap-1 items-center h-5">
                {[0,1,2].map(i => <div key={i} className="w-2 h-2 rounded-full bg-[#4caf60] animate-bounce" style={{ animationDelay: `${i*0.15}s` }} />)}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2 bg-white border border-[#d4e8d6] rounded-xl p-2">
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()}
          placeholder="Ask about crops, soil, pests, market prices…"
          className="flex-1 px-3 py-2 text-[13px] text-[#1a2b1c] placeholder-[#adc4b0] focus:outline-none bg-transparent" />
        <button onClick={() => send()} disabled={!input.trim() || loading}
          className="px-4 py-2 bg-[#3d8b47] text-white rounded-lg text-[13px] font-medium hover:bg-[#2d6a35] transition-colors disabled:opacity-50">
          Send
        </button>
      </div>
    </div>
  );
}
