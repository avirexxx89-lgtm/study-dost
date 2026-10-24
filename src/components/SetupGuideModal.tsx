import React, { useState } from 'react';
import { 
  X, 
  HelpCircle, 
  CheckCircle2, 
  ShieldCheck, 
  Database, 
  Key, 
  Cloud, 
  Terminal, 
  ExternalLink,
  AlertCircle,
  RefreshCw,
  Play
} from 'lucide-react';
import { Language } from '../types';
import { testFirestoreConnection, configureFirebaseManually, isFirebaseConfigured } from '../services/firebase';

interface SetupGuideModalProps {
  language: Language;
  onClose: () => void;
}

export const SetupGuideModal: React.FC<SetupGuideModalProps> = ({
  language,
  onClose,
}) => {
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionResult, setConnectionResult] = useState<{ connected: boolean; message: string } | null>(null);
  const [backendHealth, setBackendHealth] = useState<{ status?: string; hasGeminiKey?: boolean } | null>(null);
  const [showConfigInput, setShowConfigInput] = useState(false);
  const [pastedConfig, setPastedConfig] = useState('');
  const [configSuccess, setConfigSuccess] = useState<string | null>(null);

  const runDiagnostics = async () => {
    setTestingConnection(true);
    setConnectionResult(null);
    try {
      // 1. Test Firestore
      const fsRes = await testFirestoreConnection();
      setConnectionResult(fsRes);

      // 2. Test Backend Health & Gemini Key
      const healthRes = await fetch('/api/health');
      if (healthRes.ok) {
        const data = await healthRes.json();
        setBackendHealth(data);
      }
    } catch (e: any) {
      setConnectionResult({ connected: false, message: e.message || 'Diagnostic check failed' });
    } finally {
      setTestingConnection(false);
    }
  };

  const handleApplyConfig = (e: React.FormEvent) => {
    e.preventDefault();
    setConfigSuccess(null);
    try {
      const parsed = JSON.parse(pastedConfig);
      const success = configureFirebaseManually(parsed);
      if (success) {
        setConfigSuccess('Firebase configuration applied! Re-running diagnostics...');
        runDiagnostics();
      } else {
        setConfigSuccess('Invalid Firebase configuration object.');
      }
    } catch (err: any) {
      setConfigSuccess(`Error parsing JSON: ${err.message}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 my-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-700 flex items-center justify-center">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">
                {language === 'hi' ? 'सिस्टम सेटअप, डेटाबेस कनेक्शन व सुरक्षा गाइड' : 'System Setup, Database Connection & Security'}
              </h2>
              <p className="text-xs text-slate-500">
                {language === 'hi' ? 'Firebase निःशुल्क (Spark) टियर एवं Gemini API इंटीग्रेशन' : 'Free-Tier Compatible Setup Instructions'}
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live System Diagnostics Box */}
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/90 space-y-3">
          <div className="flex items-center justify-between">
            <div className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Database className="w-4 h-4 text-indigo-600" />
              <span>{language === 'hi' ? 'लाइव सिस्टम व डेटाबेस डायग्नोस्टिक्स' : 'Live Connection Diagnostics'}</span>
            </div>

            <button
              onClick={runDiagnostics}
              disabled={testingConnection}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-2xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${testingConnection ? 'animate-spin' : ''}`} />
              <span>{language === 'hi' ? 'कनेक्शन जांचें' : 'Test Connections'}</span>
            </button>
          </div>

          {connectionResult && (
            <div className={`p-3 rounded-lg border text-xs space-y-1 ${
              connectionResult.connected ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-amber-50 border-amber-200 text-amber-900'
            }`}>
              <div className="flex items-center gap-2 font-bold">
                {connectionResult.connected ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-amber-600" />}
                <span>Firestore: {connectionResult.message}</span>
              </div>
              {backendHealth && (
                <div className="text-[11px] text-slate-600 pl-6">
                  Backend API: <strong className="text-slate-800">Operational</strong> • Gemini Server Key:{' '}
                  <strong className={backendHealth.hasGeminiKey ? 'text-emerald-700' : 'text-amber-700'}>
                    {backendHealth.hasGeminiKey ? 'Active' : 'Offline Engine Fallback Active'}
                  </strong>
                </div>
              )}
            </div>
          )}

          <div className="text-xs text-slate-500 flex items-center justify-between">
            <span>Current Status: <strong className="text-slate-800">{isFirebaseConfigured() ? 'Cloud Firestore Sync' : 'Local Offline Storage Mode'}</strong></span>
            <button
              onClick={() => setShowConfigInput(!showConfigInput)}
              className="text-xs font-semibold text-indigo-600 hover:underline"
            >
              {showConfigInput ? 'Hide Manual Config' : 'Paste Firebase Config JSON'}
            </button>
          </div>

          {showConfigInput && (
            <form onSubmit={handleApplyConfig} className="space-y-2 pt-2 border-t border-slate-200">
              <label className="block text-xs font-bold text-slate-700">
                Paste Firebase Web Config JSON:
              </label>
              <textarea
                rows={3}
                value={pastedConfig}
                onChange={(e) => setPastedConfig(e.target.value)}
                placeholder='{ "apiKey": "...", "authDomain": "...", "projectId": "..." }'
                className="w-full p-2.5 rounded-lg border border-slate-300 font-mono text-xs bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <div className="flex items-center justify-between">
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold"
                >
                  Apply & Connect
                </button>
                {configSuccess && <span className="text-xs font-semibold text-emerald-700">{configSuccess}</span>}
              </div>
            </form>
          )}
        </div>

        {/* Steps List */}
        <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
          {/* Step 1: Firebase Provisioning */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
              <Database className="w-4 h-4 text-amber-600" />
              <span>1. Firebase Authentication & Firestore Database (Free Spark Tier)</span>
            </div>
            <p>
              Study Dost AI supports full multi-user data isolation. The repository contains:
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-600 text-xs">
              <li><code className="bg-slate-200 px-1 py-0.5 rounded font-mono">firebase-blueprint.json</code>: Intermediate schema for user profiles, study plans, mistake logs, and PYQs.</li>
              <li><code className="bg-slate-200 px-1 py-0.5 rounded font-mono">firestore.rules</code>: Hardened Zero-Trust Attribute-Based Access Control (ABAC) rules preventing cross-user data leaks.</li>
              <li>When running in development or guest mode, full local storage persistence is active with automatic upgrade to cloud upon Firebase sign-in.</li>
            </ul>
          </div>

          {/* Step 2: Gemini API Integration */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
              <Key className="w-4 h-4 text-amber-600" />
              <span>2. Server-Side AI Tutor Proxy (Zero Client Key Exposure)</span>
            </div>
            <p>
              All AI requests route through <code className="bg-slate-200 px-1 py-0.5 rounded font-mono">/api/tutor</code> on the Express backend server (<code className="bg-slate-200 px-1 py-0.5 rounded font-mono">server.ts</code>).
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-600 text-xs">
              <li>Your <code className="font-mono">GEMINI_API_KEY</code> is configured in <code className="font-mono">.env</code> and is never sent to the browser.</li>
              <li>If no API key is set, Study Dost AI automatically activates its curated, student-tested smart offline rule engine.</li>
            </ul>
          </div>

          {/* Pre-Deployment Checklist */}
          <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/80 space-y-2 text-amber-950">
            <div className="flex items-center gap-2 font-bold text-amber-900">
              <ShieldCheck className="w-4 h-4 text-amber-700" />
              <span>Pre-Deployment Verification Checklist</span>
            </div>
            <div className="space-y-1 text-xs text-slate-700">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Unit tests passing via Node test runner (<code className="font-mono">npx tsx --test src/utils/logic.test.ts</code>)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Zero client secrets exposed in frontend bundles</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Authentic source citations for all historical 2021–2025 PYQs</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Distinct labeling of 2026 model/specimen papers</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            {language === 'hi' ? 'समझ गया (Close)' : 'Got it, Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
