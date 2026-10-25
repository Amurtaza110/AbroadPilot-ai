// ============================================================
// Setup Banner — Shows when Firebase/Gemini keys not configured
// ============================================================
import React, { useState } from 'react';
import { AlertTriangle, X, ExternalLink, Copy, Check, Key } from 'lucide-react';
import { isFirebaseConfigured } from '../lib/firebase';

const isGeminiConfigured = !!(
  import.meta.env.VITE_GEMINI_API_KEY &&
  import.meta.env.VITE_GEMINI_API_KEY !== 'your_gemini_api_key_here'
);

export const SetupBanner: React.FC = () => {
  const [dismissed, setDismissed] = useState(false);
  const [copiedItem, setCopiedItem] = useState<string | null>(null);

  const allConfigured = isFirebaseConfigured && isGeminiConfigured;
  if (allConfigured || dismissed) return null;

  const copy = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedItem(id);
    setTimeout(() => setCopiedItem(null), 2000);
  };

  const ENV_TEMPLATE = `# .env — Place in project root (d:\\Abroadpilot\\.env)
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

VITE_GEMINI_API_KEY=your_gemini_key`;

  return (
    <div className="fixed top-0 left-0 right-0 z-[10000] bg-amber-950 border-b border-amber-800">
      <div className="max-w-6xl mx-auto px-4 py-3">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-amber-200">Setup Required — Add API Keys to .env</p>
            <div className="flex flex-wrap gap-3 mt-2 text-xs text-amber-300">
              {!isFirebaseConfigured && (
                <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1 hover:text-amber-100 underline">
                  <ExternalLink className="w-3 h-3" /> 1. Get Firebase keys
                </a>
              )}
              {!isGeminiConfigured && (
                <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1 hover:text-amber-100 underline">
                  <Key className="w-3 h-3" /> {!isFirebaseConfigured ? '2.' : '1.'} Get Gemini API key
                </a>
              )}
              <button onClick={() => copy(ENV_TEMPLATE, 'env')}
                className="flex items-center gap-1 hover:text-amber-100">
                {copiedItem === 'env'
                  ? <><Check className="w-3 h-3 text-emerald-400" /> Copied!</>
                  : <><Copy className="w-3 h-3" /> Copy .env template</>}
              </button>
              <span className="text-amber-500">→ Paste keys into <code className="bg-amber-900 px-1 rounded">d:\Abroadpilot\.env</code> and restart dev server</span>
            </div>
          </div>
          <button onClick={() => setDismissed(true)} className="p-1 text-amber-500 hover:text-amber-200 shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
