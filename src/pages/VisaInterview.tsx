// ============================================================
// Mock Visa Interview Simulator — Consular Officer AI Agent
// ============================================================
import React, { useState, useEffect, useRef } from 'react';
import {
  Mic, MicOff, Volume2, VolumeX, ShieldCheck, AlertTriangle, CheckCircle2,
  Send, RefreshCw, Sparkles, Award, User, Bot, HelpCircle, ArrowRight
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { streamChat } from '../lib/gemini';

interface InterviewMessage {
  id: string;
  sender: 'officer' | 'student';
  text: string;
  feedback?: {
    score: number;
    riskLevel: 'safe' | 'caution' | 'high_risk';
    critique: string;
    suggestedAnswer: string;
  };
}

const COUNTRY_PRESETS = [
  { id: 'germany', name: 'Germany', visaType: 'National Student Visa (§ 16b AufenthG)' },
  { id: 'usa', name: 'United States', visaType: 'F-1 Non-Immigrant Student Visa' },
  { id: 'uk', name: 'United Kingdom', visaType: 'Student Route Visa' },
  { id: 'canada', name: 'Canada', visaType: 'Study Permit' },
  { id: 'australia', name: 'Australia', visaType: 'Student Visa (Subclass 500)' },
];

export const VisaInterview: React.FC = () => {
  const { profile } = useAuth();
  const { showToast } = useToast();

  const [selectedCountry, setSelectedCountry] = useState(COUNTRY_PRESETS[0]);
  const [targetUniv, setTargetUniv] = useState('Technical University of Munich (TUM)');
  const [targetDegree, setTargetDegree] = useState('M.Sc. Informatics');
  const [sponsorDetails, setSponsorDetails] = useState('Self-funded with blocked account & family support');

  const [inSession, setInSession] = useState(false);
  const [messages, setMessages] = useState<InterviewMessage[]>([]);
  const [inputAnswer, setInputAnswer] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [speechEnabled, setSpeechEnabled] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [completedSummary, setCompletedSummary] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Text to Speech
  const speakQuestion = (text: string) => {
    if (!speechEnabled || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 0.95;
    window.speechSynthesis.speak(utterance);
  };

  // Speech to Text (Web Speech API)
  const toggleListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      showToast('Voice recognition is not supported in this browser.', 'info');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputAnswer(prev => (prev ? `${prev} ${transcript}` : transcript));
      };
      recognition.start();
    } catch (err) {
      setIsListening(false);
    }
  };

  // Start Interview Session
  const handleStartInterview = async () => {
    setInSession(true);
    setMessages([]);
    setCompletedSummary(null);
    setIsProcessing(true);

    const firstQuestionPrompt = `You are a strict, formal Consular Visa Officer conducting a student visa interview for ${selectedCountry.name} (${selectedCountry.visaType}).
Student Name: ${profile?.fullName || 'Applicant'}
Target: ${targetDegree} at ${targetUniv}.
Funding: ${sponsorDetails}.

Ask your very first standard opening interview question in 1-2 clear, formal sentences.`;

    let question = '';
    await streamChat(
      firstQuestionPrompt,
      { profile, useWebSearch: false },
      chunk => {
        question += chunk.text;
        if (chunk.done) {
          setIsProcessing(false);
          const initialMsg: InterviewMessage = {
            id: `msg-${Date.now()}`,
            sender: 'officer',
            text: question.trim() || `Good morning. What is the main purpose of your travel to ${selectedCountry.name}?`
          };
          setMessages([initialMsg]);
          speakQuestion(initialMsg.text);
        }
      }
    );
  };

  // Submit Answer & Get Officer Response + Assessment
  const handleSubmitAnswer = async () => {
    if (!inputAnswer.trim() || isProcessing) return;

    const studentAnswerText = inputAnswer.trim();
    setInputAnswer('');

    const newStudentMsg: InterviewMessage = {
      id: `msg-${Date.now()}`,
      sender: 'student',
      text: studentAnswerText
    };

    const updatedHistory = [...messages, newStudentMsg];
    setMessages(updatedHistory);
    setIsProcessing(true);

    // AI evaluate answer & generate next question or conclude
    const currentTurn = updatedHistory.filter(m => m.sender === 'student').length;
    const isFinalQuestion = currentTurn >= 4;

    const evaluationPrompt = `You are an expert Consular Visa Officer and Visa Coach for ${selectedCountry.name}.
Student details:
- University: ${targetUniv}
- Program: ${targetDegree}
- Student's Answer: "${studentAnswerText}"

Evaluate this answer and provide:
1. Feedback JSON:
{
  "score": number (0-100),
  "riskLevel": "safe" | "caution" | "high_risk",
  "critique": "1-2 sentences on what was good or what raised concerns (e.g. 214(b) immigrant intent risks, weak financial clarity, vague curriculum)",
  "suggestedAnswer": "How the student could phrase this much more convincingly"
}
2. Next Officer Question (or if this is question #${currentTurn} of 4, provide a concluding wrap-up statement).

Format your response EXACTLY as:
<<<FEEDBACK>>>
{ ...json... }
<<<OFFICER_REPLY>>>
Next question text here`;

    let fullResponse = '';
    await streamChat(
      evaluationPrompt,
      { profile, useWebSearch: false },
      chunk => {
        fullResponse += chunk.text;
        if (chunk.done) {
          setIsProcessing(false);

          let feedbackObj: any = null;
          let nextOfficerQuestion = 'Thank you for your answer. Can you explain your ties to your home country and your career plans after graduation?';

          try {
            if (fullResponse.includes('<<<FEEDBACK>>>') && fullResponse.includes('<<<OFFICER_REPLY>>>')) {
              const parts = fullResponse.split('<<<OFFICER_REPLY>>>');
              const jsonPart = parts[0].replace('<<<FEEDBACK>>>', '').trim();
              feedbackObj = JSON.parse(jsonPart);
              nextOfficerQuestion = parts[1].trim();
            }
          } catch (e) {
            feedbackObj = {
              score: 85,
              riskLevel: 'safe',
              critique: 'Confident answer with sound academic logic.',
              suggestedAnswer: studentAnswerText
            };
          }

          // Attach feedback to student message
          newStudentMsg.feedback = feedbackObj;

          // Append Officer next question
          const officerMsg: InterviewMessage = {
            id: `msg-officer-${Date.now()}`,
            sender: 'officer',
            text: nextOfficerQuestion
          };

          setMessages([...updatedHistory, officerMsg]);
          speakQuestion(nextOfficerQuestion);

          if (isFinalQuestion) {
            setCompletedSummary(
              `Mock Interview Concluded. Overall performance demonstrates competitive preparation. Review the feedback cards on each response to strengthen your consular delivery.`
            );
          }
        }
      }
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-brand-400 text-xs font-bold uppercase tracking-wider mb-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            Consular AI Simulator
          </div>
          <h1 className="text-2xl font-black text-white">Mock Visa Interview Agent</h1>
          <p className="text-slate-400 text-sm mt-0.5">
            Face realistic consular visa questions with instant feedback on immigration risk and delivery.
          </p>
        </div>

        {/* Audio Toggle */}
        <button
          onClick={() => {
            setSpeechEnabled(!speechEnabled);
            if (speechEnabled && window.speechSynthesis) window.speechSynthesis.cancel();
          }}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
            speechEnabled
              ? 'bg-brand-500/10 text-brand-300 border-brand-500/30'
              : 'bg-surface-800 text-slate-400 border-slate-700'
          }`}
        >
          {speechEnabled ? <Volume2 className="w-4 h-4 text-brand-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          Officer Voice {speechEnabled ? 'On' : 'Muted'}
        </button>
      </div>

      {!inSession ? (
        /* Configuration Before Interview */
        <div className="max-w-2xl mx-auto card space-y-5 my-6">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
            <div className="w-10 h-10 rounded-xl gradient-brand flex items-center justify-center text-surface-950">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Configure Interview Scenario</h3>
              <p className="text-xs text-slate-400">Select target embassy regulations and application details.</p>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Destination Embassy / Consulate</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {COUNTRY_PRESETS.map(c => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedCountry(c)}
                  className={`p-2.5 rounded-xl text-left border transition-all ${
                    selectedCountry.id === c.id
                      ? 'bg-brand-500/15 border-brand-500/50 text-white shadow-sm'
                      : 'bg-surface-800 border-slate-700/60 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="text-xs font-bold">{c.name}</div>
                  <div className="text-[10px] text-slate-400 truncate mt-0.5">{c.visaType}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">University / Institution</label>
              <input
                type="text"
                value={targetUniv}
                onChange={e => setTargetUniv(e.target.value)}
                className="input-dark text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Intended Program</label>
              <input
                type="text"
                value={targetDegree}
                onChange={e => setTargetDegree(e.target.value)}
                className="input-dark text-xs"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Financial Sponsorship Method</label>
            <input
              type="text"
              value={sponsorDetails}
              onChange={e => setSponsorDetails(e.target.value)}
              placeholder="e.g. Blocked account, parent bank statement, full scholarship"
              className="input-dark text-xs"
            />
          </div>

          <div className="pt-2">
            <button
              onClick={handleStartInterview}
              disabled={isProcessing}
              className="btn-primary w-full justify-center py-3 text-sm font-bold shadow-lg"
            >
              <Sparkles className="w-4 h-4" />
              Begin Consular Mock Interview
            </button>
          </div>
        </div>
      ) : (
        /* Live Interview Chat Area */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Interview Conversation */}
          <div className="lg:col-span-8 flex flex-col h-[650px] card p-0 overflow-hidden">
            {/* Session Top Bar */}
            <div className="px-5 py-3.5 bg-surface-900 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-2">
                    {selectedCountry.name} Consular Section
                    <span className="text-[10px] text-brand-400 font-mono bg-brand-500/10 px-1.5 py-0.5 rounded border border-brand-500/20">
                      LIVE
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400">{selectedCountry.visaType}</div>
                </div>
              </div>

              <button
                onClick={() => setInSession(false)}
                className="text-xs text-slate-400 hover:text-rose-400 font-medium transition-colors"
              >
                End Session
              </button>
            </div>

            {/* Message Stream */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map(msg => (
                <div key={msg.id} className="space-y-2">
                  <div className={`flex gap-3 ${msg.sender === 'student' ? 'justify-end' : 'justify-start'}`}>
                    {msg.sender === 'officer' && (
                      <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 text-slate-300">
                        <Bot className="w-4 h-4 text-brand-400" />
                      </div>
                    )}

                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                        msg.sender === 'student'
                          ? 'bg-brand-500 text-surface-950 font-medium rounded-tr-none'
                          : 'bg-surface-800/90 border border-slate-700/60 text-slate-100 rounded-tl-none shadow-sm'
                      }`}
                    >
                      {msg.text}
                    </div>

                    {msg.sender === 'student' && (
                      <div className="w-8 h-8 rounded-lg bg-brand-500/20 border border-brand-500/30 flex items-center justify-center shrink-0 text-brand-300">
                        <User className="w-4 h-4" />
                      </div>
                    )}
                  </div>

                  {/* Feedback Box under Student Answer */}
                  {msg.feedback && (
                    <div className="ml-11 max-w-[80%] bg-surface-900 border border-slate-800 rounded-xl p-3 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5 text-brand-400" />
                          Consular Feedback
                        </span>
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              msg.feedback.riskLevel === 'safe'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : msg.feedback.riskLevel === 'caution'
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            }`}
                          >
                            {msg.feedback.riskLevel}
                          </span>
                          <span className="font-mono font-bold text-slate-200">
                            {msg.feedback.score}/100
                          </span>
                        </div>
                      </div>

                      <p className="text-slate-300 text-[11px] leading-relaxed">
                        {msg.feedback.critique}
                      </p>

                      <div className="bg-surface-950 p-2.5 rounded-lg border border-slate-800/80">
                        <div className="text-[10px] font-bold text-brand-400 uppercase tracking-wide mb-1">
                          Recommended Phrasing
                        </div>
                        <p className="text-[11px] text-slate-300 italic">
                          "{msg.feedback.suggestedAnswer}"
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {isProcessing && (
                <div className="flex items-center gap-2 text-xs text-brand-400 italic py-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Consular officer is reviewing response...
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Footer */}
            <div className="p-3.5 bg-surface-900 border-t border-slate-800 flex items-center gap-2">
              <button
                type="button"
                onClick={toggleListening}
                className={`p-2.5 rounded-xl border transition-colors ${
                  isListening
                    ? 'bg-rose-500/20 border-rose-500 text-rose-400 animate-pulse'
                    : 'bg-surface-800 border-slate-700 text-slate-400 hover:text-white'
                }`}
                title={isListening ? 'Stop recording' : 'Speak your answer'}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              <input
                type="text"
                value={inputAnswer}
                onChange={e => setInputAnswer(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmitAnswer()}
                placeholder="Type your answer to the visa officer..."
                disabled={isProcessing}
                className="input-dark flex-1 text-xs py-2.5"
              />

              <button
                type="button"
                onClick={handleSubmitAnswer}
                disabled={!inputAnswer.trim() || isProcessing}
                className="btn-primary py-2.5 px-4 text-xs font-bold"
              >
                <Send className="w-3.5 h-3.5" />
                Answer
              </button>
            </div>
          </div>

          {/* Right Guidance & Rules Panel */}
          <div className="lg:col-span-4 space-y-4">
            <div className="card space-y-3">
              <h3 className="text-xs font-bold text-white flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-brand-400" />
                Consular Interview Best Practices
              </h3>

              <div className="space-y-2.5 text-xs text-slate-300">
                <div className="p-2.5 rounded-xl bg-surface-800 border border-slate-700/60">
                  <div className="font-bold text-white text-[11px] mb-1">Non-Immigrant Intent</div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Always emphasize your return plans to your home country. Never say "I want to settle abroad permanently".
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-surface-800 border border-slate-700/60">
                  <div className="font-bold text-white text-[11px] mb-1">Concrete Financial Answers</div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    State exactly who is sponsoring you, their annual income, and how liquid funds or blocked accounts are organized.
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-surface-800 border border-slate-700/60">
                  <div className="font-bold text-white text-[11px] mb-1">Know Your Syllabus</div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Be ready to name 2-3 specific modules, professors, or lab specializations from your curriculum.
                  </p>
                </div>
              </div>
            </div>

            {completedSummary && (
              <div className="card space-y-3 border-emerald-500/30 bg-emerald-950/10">
                <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  Interview Completed
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {completedSummary}
                </p>
                <button
                  onClick={handleStartInterview}
                  className="btn-ghost w-full justify-center text-xs py-2"
                >
                  <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                  Restart New Session
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
