import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  FileText,
  Mail,
  ShieldCheck,
  User,
  GraduationCap,
  RotateCcw,
  BookOpen
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AiAdvisorProps {
  onOpenSopAssistant: () => void;
  onOpenEmailDraft: () => void;
}

interface Message {
  role: 'user' | 'model';
  text: string;
  time?: string;
}

export const AiAdvisor: React.FC<AiAdvisorProps> = ({
  onOpenSopAssistant,
  onOpenEmailDraft
}) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'model',
      text: `Hello ${user?.fullName || 'there'}! I am your AbroadPilot AI Counselor.\n\nI have reviewed your academic record (${user?.degreeTitle || 'Bachelor'}, CGPA ${user?.cgpa || '3.35'}/4.0 from ${user?.institutionName || 'Pakistan'}) and your target destinations (${user?.preferredCountries?.join(', ') || 'Germany, UK, Italy'}).\n\nHow can I help advance your study abroad journey today? You can ask about APS certification in Islamabad, UKVI 28-day bank rules, Italian DSU scholarship requirements, or visa interview strategies.`,
      time: 'Just now'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || loading) return;

    const userMsg: Message = { role: 'user', text, time: 'Just now' };
    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      const res = await fetch('/api/v1/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id || 'student-demo-pk-1'
        },
        body: JSON.stringify({
          message: text,
          history,
          activeContext: `Target Countries: ${user?.preferredCountries?.join(', ')}. Budget: ${user?.maxTuitionBudgetPkr} PKR. Intended: ${user?.intendedMajor}.`
        })
      });

      const data = await res.json();
      if (data.success && data.reply) {
        setMessages(prev => [...prev, { role: 'model', text: data.reply, time: 'Just now' }]);
      } else {
        setMessages(prev => [
          ...prev,
          {
            role: 'model',
            text: 'I could not generate a response. Please check your network and try again.',
            time: 'Just now'
          }
        ]);
      }
    } catch (err) {
      console.error('Chat error:', err);
      setMessages(prev => [
        ...prev,
        {
          role: 'model',
          text: 'Temporary connection delay with the AI counseling engine. Please resend your prompt.',
          time: 'Just now'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const PROMPT_SUGGESTIONS = [
    "What is the step-by-step APS certificate procedure in Islamabad for Germany?",
    "How do I prove the UKVI 28-day maintenance funds using my father's bank account in Pakistan?",
    "Which documents do I need from NADRA and FBR for the Italian DSU scholarship?",
    "What are common F-1 visa interview questions at the US Embassy Islamabad?"
  ];

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-teal-50 text-teal-800 font-bold px-2 py-0.5 rounded uppercase">
              Gemini 3.8 Flash Engine
            </span>
            <span className="text-xs text-slate-500 font-medium">Pakistan Specialist Counselor</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
            Personalized AI Study Abroad Advisor
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Contextual reasoning grounded in your academic transcripts, budget, and destination immigration laws.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenSopAssistant}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold rounded-xl border border-slate-200 shadow-xs transition-colors flex items-center gap-1.5"
          >
            <FileText className="w-3.5 h-3.5 text-teal-600" />
            <span>SOP Assistant</span>
          </button>
          <button
            onClick={onOpenEmailDraft}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold rounded-xl border border-slate-200 shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Mail className="w-3.5 h-3.5 text-indigo-600" />
            <span>Professor Email</span>
          </button>
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden flex flex-col h-[650px]">
        {/* Chat Header Bar */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-sm text-white">AbroadPilot AI Senior Consultant</div>
              <div className="text-[11px] text-teal-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
                <span>Active Profile: {user?.fullName} (CGPA {user?.cgpa})</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              setMessages([
                {
                  role: 'model',
                  text: 'Conversation reset. How can I assist you with your study abroad admissions or visa plan?',
                  time: 'Just now'
                }
              ]);
            }}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            title="Reset conversation"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Message Stream */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-slate-50/50 text-xs">
          {messages.map((m, idx) => {
            const isUser = m.role === 'user';
            return (
              <div
                key={idx}
                className={`flex gap-3 max-w-3xl ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                    isUser
                      ? 'bg-slate-900 text-white'
                      : 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20'
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                <div
                  className={`p-4 rounded-2xl leading-relaxed whitespace-pre-wrap ${
                    isUser
                      ? 'bg-slate-900 text-white rounded-tr-none'
                      : 'bg-white border border-slate-200/90 text-slate-800 shadow-sm rounded-tl-none font-normal'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex items-center gap-3 mr-auto max-w-md">
              <div className="w-8 h-8 rounded-xl bg-teal-500 text-slate-950 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3.5 bg-white border border-slate-200 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2 text-slate-500 text-xs font-medium">
                <div className="w-2 h-2 rounded-full bg-teal-500 animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-teal-500 animate-bounce delay-100" />
                <div className="w-2 h-2 rounded-full bg-teal-500 animate-bounce delay-200" />
                <span>AbroadPilot AI is formulating evidence-based guidance...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggestion Chips */}
        <div className="px-4 py-2 bg-white border-t border-slate-100 flex items-center gap-2 overflow-x-auto scrollbar-none">
          <span className="text-[10px] font-bold text-slate-400 uppercase shrink-0">Quick Inquiries:</span>
          {PROMPT_SUGGESTIONS.map((suggestion, i) => (
            <button
              key={i}
              onClick={() => handleSend(suggestion)}
              className="px-3 py-1 bg-slate-100 hover:bg-teal-50 hover:text-teal-800 text-slate-700 text-[11px] rounded-full whitespace-nowrap transition-colors shrink-0 border border-slate-200/80"
            >
              {suggestion}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-white border-t border-slate-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-3"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about admissions, APS, blocked accounts, SOPs, or visa interviews..."
              className="flex-1 p-3 bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-xs rounded-2xl border border-slate-200 focus:border-teal-500 focus:outline-none transition-all shadow-inner"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="px-5 py-3 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white font-bold rounded-2xl text-xs flex items-center gap-2 shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Send</span>
              <Send className="w-3.5 h-3.5 text-teal-400" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
