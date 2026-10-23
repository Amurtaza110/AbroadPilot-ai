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
  BookOpen,
  Globe,
  ExternalLink,
  Search,
  CheckCircle2,
  Award,
  Layers,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { GroundingSource } from '../types';
import { LiveSearchModal } from '../components/LiveSearchModal';

interface AiAdvisorProps {
  onOpenSopAssistant: () => void;
  onOpenEmailDraft: () => void;
  initialQuery?: string;
}

interface Message {
  role: 'user' | 'model';
  text: string;
  time?: string;
  sources?: GroundingSource[];
  webSearchQueries?: string[];
  isGrounded?: boolean;
}

export const AiAdvisor: React.FC<AiAdvisorProps> = ({
  onOpenSopAssistant,
  onOpenEmailDraft,
  initialQuery
}) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'model',
      text: `Hello ${user?.fullName || 'there'}! I am your AbroadPilot AI Counselor.\n\nI have reviewed your academic record (${user?.degreeTitle || 'Bachelor'}, CGPA ${user?.cgpa || '3.35'}/4.0 from ${user?.institutionName || 'Pakistan'}) and your target destinations (${user?.preferredCountries?.join(', ') || 'Germany, UK, Italy'}).\n\nGoogle Search Grounding is ENABLED. You can ask me to find live universities, upcoming application deadlines, scholarship rounds (e.g., DAAD, Chevening, Erasmus, DSU), tuition fee changes, or APS Islamabad procedures!`,
      time: 'Just now',
      isGrounded: true,
      sources: [
        { title: "APS Islamabad Official Portal", uri: "https://aps-pakistan.de" },
        { title: "DAAD International Programs in Germany", uri: "https://www.daad.de/en/study-and-research-in-germany/courses-of-study-in-germany" }
      ]
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [useGoogleSearch, setUseGoogleSearch] = useState(true);
  const [showLiveSearchModal, setShowLiveSearchModal] = useState(false);
  const [liveSearchCategory, setLiveSearchCategory] = useState<'universities' | 'scholarships'>('universities');
  const [promptCategory, setPromptCategory] = useState<'universities' | 'scholarships' | 'visa'>('universities');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (initialQuery && initialQuery.trim()) {
      handleSend(initialQuery);
    }
  }, [initialQuery]);

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
          activeContext: `Target Countries: ${user?.preferredCountries?.join(', ')}. Budget: ${user?.maxTuitionBudgetPkr} PKR. Intended: ${user?.intendedMajor}.`,
          useGoogleSearch
        })
      });

      const data = await res.json();
      if (data.success && data.reply) {
        setMessages(prev => [
          ...prev,
          {
            role: 'model',
            text: data.reply,
            sources: data.sources,
            webSearchQueries: data.webSearchQueries,
            isGrounded: Boolean(data.sources && data.sources.length > 0),
            time: 'Just now'
          }
        ]);
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

  const UNIVERSITY_PROMPTS = [
    "Find English-taught Computer Science masters in Germany with upcoming deadlines and low tuition",
    "Which UK universities offer Data Science with a 1-year placement year under £16,000?",
    "Find public universities in Italy with English programs and eligibility for Pakistani students",
    "Search US universities offering Graduate Teaching Assistantships (GTA) for Master applicants"
  ];

  const SCHOLARSHIP_PROMPTS = [
    "Find 100% funded European scholarships for Pakistani students in 2025/2026",
    "What are the step-by-step document requirements for the Italian DSU regional grant?",
    "Find DAAD scholarships currently accepting Pakistani applications for engineering",
    "What is the eligibility criteria for the Chevening UK scholarship for Pakistani applicants?"
  ];

  const VISA_PROMPTS = [
    "What is the step-by-step APS certificate procedure in Islamabad for Germany?",
    "How do I prove the UKVI 28-day maintenance funds using my father's bank account in Pakistan?",
    "What are common F-1 visa interview questions at the US Embassy Islamabad?",
    "What are the latest visa appointment wait times for German Embassy Islamabad?"
  ];

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-teal-50 text-teal-800 font-bold px-2 py-0.5 rounded uppercase flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-teal-600" />
              Gemini 3.8 Flash
            </span>
            <span className="text-xs bg-indigo-50 text-indigo-800 font-bold px-2 py-0.5 rounded uppercase flex items-center gap-1">
              <Globe className="w-3 h-3 text-indigo-600" />
              Google Search Grounding
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
            Personalized AI Study Abroad Advisor
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time conversational counselor backed by live Google Search grounding to discover universities, scholarships, and verified visa rules.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => {
              setLiveSearchCategory('universities');
              setShowLiveSearchModal(true);
            }}
            className="px-3.5 py-2 bg-teal-50 hover:bg-teal-100 text-teal-900 text-xs font-bold rounded-xl border border-teal-200 transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <GraduationCap className="w-3.5 h-3.5 text-teal-700" />
            <span>Search Universities</span>
          </button>
          <button
            onClick={() => {
              setLiveSearchCategory('scholarships');
              setShowLiveSearchModal(true);
            }}
            className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 text-xs font-bold rounded-xl border border-indigo-200 transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Award className="w-3.5 h-3.5 text-indigo-700" />
            <span>Search Scholarships</span>
          </button>
          <button
            onClick={onOpenSopAssistant}
            className="px-3 py-2 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold rounded-xl border border-slate-200 shadow-xs transition-colors flex items-center gap-1.5"
          >
            <FileText className="w-3.5 h-3.5 text-slate-600" />
            <span>SOP</span>
          </button>
          <button
            onClick={onOpenEmailDraft}
            className="px-3 py-2 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold rounded-xl border border-slate-200 shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Mail className="w-3.5 h-3.5 text-slate-600" />
            <span>Email</span>
          </button>
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden flex flex-col h-[700px]">
        {/* Chat Header Bar */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-white">AbroadPilot AI Senior Consultant</span>
                {useGoogleSearch && (
                  <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-800">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Google Search Active
                  </span>
                )}
              </div>
              <div className="text-[11px] text-teal-400 flex items-center gap-1.5">
                <span>Active Profile: {user?.fullName} (CGPA {user?.cgpa}, {user?.targetDegree} {user?.intendedMajor})</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Google Search Toggle */}
            <button
              onClick={() => setUseGoogleSearch(!useGoogleSearch)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                useGoogleSearch
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
              }`}
              title="Toggle Google Search Grounding for live web intelligence"
            >
              <Globe className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Google Search</span>
              <span className={`text-[10px] font-mono px-1 py-0.2 rounded ${useGoogleSearch ? 'bg-emerald-400/30 text-emerald-200' : 'bg-slate-700'}`}>
                {useGoogleSearch ? 'ON' : 'OFF'}
              </span>
            </button>

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
        </div>

        {/* Message Stream */}
        <div className="flex-1 p-5 overflow-y-auto space-y-5 bg-slate-50/50 text-xs">
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

                <div className="space-y-2 max-w-2xl">
                  {/* Message Bubble */}
                  <div
                    className={`p-4 rounded-2xl leading-relaxed whitespace-pre-wrap ${
                      isUser
                        ? 'bg-slate-900 text-white rounded-tr-none'
                        : 'bg-white border border-slate-200/90 text-slate-800 shadow-sm rounded-tl-none font-normal'
                    }`}
                  >
                    {m.text}
                  </div>

                  {/* Grounded Web Sources / Citations */}
                  {!isUser && m.sources && m.sources.length > 0 && (
                    <div className="bg-white/90 border border-teal-200/90 rounded-2xl p-3 shadow-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-teal-900">
                          <Globe className="w-3.5 h-3.5 text-teal-600" />
                          <span>Google Search Grounding Sources ({m.sources.length})</span>
                        </div>
                        <span className="text-[10px] bg-teal-50 text-teal-700 font-semibold px-2 py-0.5 rounded-full border border-teal-100">
                          Verified Portals
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-0.5">
                        {m.sources.map((src, sIdx) => (
                          <a
                            key={sIdx}
                            href={src.uri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between p-2 rounded-xl bg-slate-50 hover:bg-teal-50 border border-slate-200/70 hover:border-teal-300 text-slate-700 hover:text-teal-900 text-[11px] transition-colors group"
                          >
                            <span className="truncate pr-1 font-medium">{src.title}</span>
                            <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-teal-600 shrink-0" />
                          </a>
                        ))}
                      </div>

                      {m.webSearchQueries && m.webSearchQueries.length > 0 && (
                        <div className="pt-1 border-t border-slate-100 text-[10px] text-slate-400 flex items-center gap-1 flex-wrap">
                          <span className="font-semibold">Search executed:</span>
                          {m.webSearchQueries.map((q, qIdx) => (
                            <span key={qIdx} className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                              "{q}"
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
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
                <span>
                  {useGoogleSearch
                    ? 'AbroadPilot AI is searching Google and formulating verified counsel...'
                    : 'AbroadPilot AI is formulating evidence-based guidance...'}
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggestion Chips with Category Tabs */}
        <div className="px-4 py-2 bg-white border-t border-slate-100 space-y-2">
          <div className="flex items-center justify-between gap-2 overflow-x-auto scrollbar-none">
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => setPromptCategory('universities')}
                className={`px-2 py-0.5 text-[11px] font-bold rounded-lg transition-colors flex items-center gap-1 ${
                  promptCategory === 'universities'
                    ? 'bg-teal-100 text-teal-800'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <GraduationCap className="w-3 h-3" />
                <span>Find Universities</span>
              </button>
              <button
                onClick={() => setPromptCategory('scholarships')}
                className={`px-2 py-0.5 text-[11px] font-bold rounded-lg transition-colors flex items-center gap-1 ${
                  promptCategory === 'scholarships'
                    ? 'bg-indigo-100 text-indigo-800'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Award className="w-3 h-3" />
                <span>Scholarships</span>
              </button>
              <button
                onClick={() => setPromptCategory('visa')}
                className={`px-2 py-0.5 text-[11px] font-bold rounded-lg transition-colors flex items-center gap-1 ${
                  promptCategory === 'visa'
                    ? 'bg-slate-200 text-slate-800'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <ShieldCheck className="w-3 h-3" />
                <span>Visa & Rules</span>
              </button>
            </div>

            <span className="text-[10px] text-slate-400 font-medium hidden sm:inline">
              Click any inquiry to send immediately
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
            {(promptCategory === 'universities'
              ? UNIVERSITY_PROMPTS
              : promptCategory === 'scholarships'
              ? SCHOLARSHIP_PROMPTS
              : VISA_PROMPTS
            ).map((suggestion, i) => (
              <button
                key={i}
                onClick={() => handleSend(suggestion)}
                className="px-3 py-1 bg-slate-100 hover:bg-teal-50 hover:text-teal-900 text-slate-700 text-[11px] rounded-full whitespace-nowrap transition-colors shrink-0 border border-slate-200/80 font-medium"
              >
                {suggestion}
              </button>
            ))}
          </div>
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
            <div className="relative flex-1">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about universities, scholarships, APS Islamabad, blocked accounts, or visa interviews..."
                className="w-full p-3 bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-xs rounded-2xl border border-slate-200 focus:border-teal-500 focus:outline-none transition-all shadow-inner"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="px-5 py-3 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white font-bold rounded-2xl text-xs flex items-center gap-2 shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Ask</span>
              <Send className="w-3.5 h-3.5 text-teal-400" />
            </button>
          </form>
        </div>
      </div>

      {/* Live Search Modal */}
      {showLiveSearchModal && (
        <LiveSearchModal
          initialCategory={liveSearchCategory}
          onClose={() => setShowLiveSearchModal(false)}
          onNavigateToAdvisor={(query) => {
            if (query) handleSend(query);
          }}
        />
      )}
    </div>
  );
};
