// ============================================================
// AI Advisor Page — Streaming Chat with Gemini + Web Search
// ============================================================
import React, { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Bot, Send, Sparkles, RotateCcw, Globe, User,
  GraduationCap, Award, ShieldCheck, FileText,
  Mail, ExternalLink, Loader2, Copy, Check, Zap
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { ChatMessage, GroundingSource } from '../types';
import { streamChat } from '../lib/gemini';
import { useToast } from '../contexts/ToastContext';

const SUGGESTION_CATEGORIES = {
  universities: {
    label: 'Find Universities',
    icon: <GraduationCap className="w-3 h-3" />,
    color: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
    prompts: [
      'Find top-ranked universities for Computer Science in Germany with English programs',
      'Which universities in Canada offer Data Science masters with scholarship opportunities?',
      'Compare PhD programs in AI across MIT, Stanford, and CMU — requirements and funding',
      'Find universities in Netherlands with tuition under €10,000 for Business programs',
    ]
  },
  scholarships: {
    label: 'Scholarships',
    icon: <Award className="w-3 h-3" />,
    color: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
    prompts: [
      'Find fully funded scholarships in Europe for international students in 2025-2026',
      'What are the DAAD scholarship requirements and application process?',
      'Find Chevening UK scholarships — eligibility, value, and deadline 2025',
      'Erasmus Mundus scholarships — how to apply and best programs?',
    ]
  },
  visa: {
    label: 'Visa & Rules',
    icon: <ShieldCheck className="w-3 h-3" />,
    color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    prompts: [
      'Step-by-step student visa process for Germany from scratch',
      'What financial proof is required for a UK Tier 4 student visa?',
      'Canada study permit requirements and processing time in 2025',
      'What documents are needed for a USA F-1 visa application?',
    ]
  },
  sop: {
    label: 'SOP & Email',
    icon: <FileText className="w-3 h-3" />,
    color: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
    prompts: [
      'Write a compelling SOP for Computer Science master\'s at TU Munich',
      'Draft a cold email to Professor asking about research opportunities',
      'Help me strengthen my SOP — what makes admissions committees approve?',
      'Write a scholarship motivation letter for Erasmus Mundus',
    ]
  }
};

export const AiAdvisor: React.FC = () => {
  const { profile } = useAuth();
  const { showToast } = useToast();
  const [searchParams] = useSearchParams();
  const initialTask = searchParams.get('task');

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: profile?.isOnboarded
        ? `Hello ${profile.fullName?.split(' ')[0]}! 👋 I'm your AbroadPilot AI Advisor.\n\nI've reviewed your profile — you're targeting a **${profile.targetDegree}** in **${profile.intendedMajors.join(', ')}** across **${profile.preferredCountries.join(', ')}**.\n\n🔍 **Google Search is enabled** — I can find live university deadlines, scholarship rounds, tuition fees, and visa requirements in real-time.\n\nWhat would you like to explore?`
        : `Hello! 👋 I'm your **AbroadPilot AI Advisor** — your intelligent study abroad consultant.\n\n🔍 Google Search grounding is enabled, so I can find the latest university deadlines, scholarship rounds, tuition fees, and visa information in real-time.\n\nTell me what you're looking for, or try one of the suggested prompts below!`,
      timestamp: new Date().toISOString(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [useWebSearch, setUseWebSearch] = useState(true);
  const [activeCategory, setActiveCategory] = useState<keyof typeof SUGGESTION_CATEGORIES>('universities');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    // Handle task param from navigation
    if (initialTask === 'sop' && !isStreaming) {
      handleSend('Help me write a Statement of Purpose (SOP) for my target programs. Ask me the details you need.');
    } else if (initialTask === 'email' && !isStreaming) {
      handleSend('I need to write a professor inquiry email. Help me draft a compelling cold email for research opportunities.');
    }
  }, [initialTask]);

  const handleSend = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText || isStreaming) return;

    if (!text) setInput('');

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsStreaming(true);

    // Create streaming AI message placeholder
    const aiMessageId = (Date.now() + 1).toString();
    const aiMessage: ChatMessage = {
      id: aiMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString(),
      isStreaming: true,
    };
    setMessages(prev => [...prev, aiMessage]);

    // Build history for context
    const history = messages.slice(-10).map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));

    let fullContent = '';
    let finalSources: GroundingSource[] = [];

    await streamChat(
      messageText,
      { useWebSearch, profile, history },
      (chunk) => {
        fullContent += chunk.text;
        if (chunk.sources) finalSources = chunk.sources;

        setMessages(prev => prev.map(m =>
          m.id === aiMessageId
            ? { ...m, content: fullContent, isStreaming: !chunk.done, sources: chunk.sources }
            : m
        ));
      }
    );

    setMessages(prev => prev.map(m =>
      m.id === aiMessageId
        ? { ...m, content: fullContent, isStreaming: false, sources: finalSources }
        : m
    ));

    setIsStreaming(false);
    inputRef.current?.focus();
  };

  const resetChat = () => {
    setMessages([{
      id: 'welcome-reset',
      role: 'assistant',
      content: 'Chat cleared. How can I help you with your study abroad plans?',
      timestamp: new Date().toISOString(),
    }]);
  };

  const copyMessage = async (id: string, content: string) => {
    await navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    showToast('Copied to clipboard', 'success');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const renderContent = (content: string) => {
    // Basic markdown rendering
    return content
      .split('\n')
      .map((line, i) => {
        if (line.startsWith('**') && line.endsWith('**')) {
          return <p key={i} className="font-bold text-white">{line.slice(2, -2)}</p>;
        }
        if (line.startsWith('# ')) return <h2 key={i} className="text-base font-black text-white mt-3 mb-1">{line.slice(2)}</h2>;
        if (line.startsWith('## ')) return <h3 key={i} className="text-sm font-bold text-brand-300 mt-2 mb-1">{line.slice(3)}</h3>;
        if (line.startsWith('- ') || line.startsWith('• ')) {
          return <li key={i} className="ml-4 text-slate-300">{line.slice(2).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</li>;
        }
        if (line.trim() === '') return <br key={i} />;
        // Handle inline bold
        const parts = line.split(/\*\*(.*?)\*\*/g);
        return (
          <p key={i} className="text-slate-300">
            {parts.map((part, j) => j % 2 === 1 ? <strong key={j} className="text-white font-semibold">{part}</strong> : part)}
          </p>
        );
      });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)] animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="badge badge-brand">
              <Sparkles className="w-3 h-3" /> Gemini 2.0 Flash
            </span>
            <span className={`badge ${useWebSearch ? 'badge-brand' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>
              <Globe className="w-3 h-3" /> Web Search {useWebSearch ? 'ON' : 'OFF'}
            </span>
          </div>
          <h1 className="text-xl font-black text-white">AI Advisor</h1>
          <p className="text-xs text-slate-400">Your intelligent study abroad consultant with live web search</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setUseWebSearch(!useWebSearch)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
              useWebSearch
                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            {useWebSearch ? 'Live Search On' : 'Live Search Off'}
          </button>
          <button
            onClick={resetChat}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800 transition-all"
            title="Reset conversation"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Chat Container */}
      <div className="flex-1 flex flex-col card overflow-hidden min-h-0">
        {/* Chat Header Bar */}
        <div className="flex items-center gap-3 px-5 py-3 bg-slate-900 border-b border-slate-800 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-brand-500/20 border border-brand-500/30 flex items-center justify-center">
            <Bot className="w-4 h-4 text-brand-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white">AbroadPilot AI Advisor</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <div className="text-[11px] text-slate-500">
              {profile?.isOnboarded
                ? `Personalized for ${profile.fullName} · ${profile.targetDegree} in ${profile.intendedMajors[0]}`
                : 'Ready to help with your study abroad journey'}
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6 bg-slate-950/50">
          {messages.map(msg => {
            const isUser = msg.role === 'user';
            return (
              <div key={msg.id} className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''} max-w-4xl ${isUser ? 'ml-auto' : 'mr-auto w-full'}`}>
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                  isUser ? 'bg-slate-700 text-white' : 'bg-brand-500 text-surface-950 shadow-lg shadow-brand-500/20'
                }`}>
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                <div className="space-y-2 min-w-0 flex-1">
                  {/* Bubble */}
                  <div className={`relative group ${isUser ? 'chat-bubble-user' : 'chat-bubble-ai'} p-4 text-sm leading-relaxed`}>
                    {isUser ? (
                      <p>{msg.content}</p>
                    ) : (
                      <div className="space-y-1 prose-sm">
                        {msg.isStreaming ? (
                          <div className="flex items-center gap-2 text-slate-400">
                            <div className="flex gap-1">
                              <div className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-bounce" />
                              <div className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-bounce delay-100" />
                              <div className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-bounce delay-200" />
                            </div>
                            <span className="text-xs">
                              {useWebSearch ? 'Searching the web & thinking...' : 'Thinking...'}
                            </span>
                          </div>
                        ) : null}
                        {msg.content && (
                          <div className="space-y-1">
                            {renderContent(msg.content)}
                          </div>
                        )}
                        {msg.isStreaming && msg.content && (
                          <span className="inline-block w-0.5 h-4 bg-brand-400 animate-pulse ml-0.5" />
                        )}
                      </div>
                    )}

                    {/* Copy button */}
                    {!isUser && !msg.isStreaming && msg.content && (
                      <button
                        onClick={() => copyMessage(msg.id, msg.content)}
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 transition-all"
                      >
                        {copiedId === msg.id ? <Check className="w-3 h-3 text-brand-400" /> : <Copy className="w-3 h-3 text-slate-400" />}
                      </button>
                    )}
                  </div>

                  {/* Sources */}
                  {!isUser && msg.sources && msg.sources.length > 0 && (
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400">
                        <Globe className="w-3 h-3 text-brand-400" />
                        <span>Web Sources ({msg.sources.length})</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        {msg.sources.slice(0, 6).map((src, i) => (
                          <a key={i} href={src.uri} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-2 p-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-brand-500/30 text-[11px] text-slate-300 hover:text-white transition-all group">
                            <span className="truncate flex-1">{src.title || src.uri}</span>
                            <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-brand-400 shrink-0" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggestions */}
        <div className="border-t border-slate-800 bg-slate-900/80 px-4 pt-2 pb-1 shrink-0">
          <div className="flex items-center gap-1 mb-2">
            {Object.entries(SUGGESTION_CATEGORIES).map(([key, cat]) => (
              <button key={key}
                onClick={() => setActiveCategory(key as keyof typeof SUGGESTION_CATEGORIES)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all ${
                  activeCategory === key ? cat.color : 'text-slate-500 border-transparent hover:text-slate-300'
                }`}>
                {cat.icon} {cat.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {SUGGESTION_CATEGORIES[activeCategory].prompts.map((p, i) => (
              <button key={i}
                onClick={() => handleSend(p)}
                disabled={isStreaming}
                className="shrink-0 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-brand-500/40 text-slate-300 hover:text-white text-[11px] rounded-full transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div className="px-4 py-3 border-t border-slate-800 bg-slate-900 shrink-0">
          <div className="flex items-end gap-3">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about universities, scholarships, visas, SOPs, costs..."
                rows={1}
                className="w-full bg-slate-800 border border-slate-700 focus:border-brand-500 text-slate-100 placeholder-slate-500 text-sm rounded-2xl px-4 py-3 pr-12 resize-none outline-none transition-all leading-relaxed"
                style={{ maxHeight: '120px', overflowY: 'auto' }}
                disabled={isStreaming}
              />
            </div>
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isStreaming}
              className="btn-primary shrink-0 py-3 px-5 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isStreaming ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-[10px] text-slate-600 mt-1.5 text-center">
            Press Enter to send · Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
};
