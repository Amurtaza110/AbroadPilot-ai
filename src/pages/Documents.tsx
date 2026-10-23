import React, { useState, useEffect } from 'react';
import {
  FolderLock,
  Upload,
  FileText,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Trash2,
  ExternalLink,
  Download,
  FileCheck2,
  Clock
} from 'lucide-react';
import { StudentDocument } from '../types';
import { DocumentUploadModal } from '../components/DocumentUploadModal';
import { useToast } from '../context/ToastContext';

export const Documents: React.FC = () => {
  const { showToast } = useToast();
  const [documents, setDocuments] = useState<StudentDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [targetDestination, setTargetDestination] = useState<string>('Germany');

  const fetchDocuments = async () => {
    try {
      const res = await fetch('/api/v1/documents');
      const data = await res.json();
      if (data.success && data.documents) {
        setDocuments(data.documents);
      }
    } catch (err) {
      console.error('Failed to load documents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleUpload = async (docData: Partial<StudentDocument>) => {
    try {
      const res = await fetch('/api/v1/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(docData)
      });
      const data = await res.json();
      if (data.success) {
        setDocuments(prev => [data.document, ...prev]);
        showToast(`Uploaded document: ${data.document.name}`, 'success');
      }
    } catch (err) {
      console.error('Failed to upload document:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this document from your vault?")) return;
    try {
      const res = await fetch(`/api/v1/documents/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setDocuments(prev => prev.filter(d => d.id !== id));
        showToast("Document deleted", "info");
      }
    } catch (err) {
      console.error('Failed to delete document:', err);
    }
  };

  // Readiness evaluation rules based on destination
  const getReadinessRequirements = (country: string) => {
    const base = [
      { id: 'req-trans', name: 'Bachelor Academic Transcript', category: 'Transcript', requiredAttestation: 'HEC Pakistan' },
      { id: 'req-deg', name: 'Degree Certificate / Provisional', category: 'Degree Certificate', requiredAttestation: 'HEC Pakistan' },
      { id: 'req-pass', name: 'Valid Pakistani Passport', category: 'Passport', requiredAttestation: 'Valid > 12 Months' },
      { id: 'req-sop', name: 'Tailored Statement of Purpose (SOP)', category: 'SOP', requiredAttestation: 'Drafted' },
      { id: 'req-cv', name: 'Academic CV (Europass / Standard)', category: 'CV', requiredAttestation: 'Verified' },
      { id: 'req-lor', name: 'Academic Letters of Recommendation (2)', category: 'LOR', requiredAttestation: 'Signed by Faculty' },
      { id: 'req-eng', name: 'English Test Score (IELTS / TOEFL)', category: 'English Test', requiredAttestation: 'Official TRF' }
    ];

    if (country === 'Germany') {
      base.push({
        id: 'req-aps',
        name: 'APS Certificate (Akademische Prüfstelle)',
        category: 'Attestation',
        requiredAttestation: 'APS Islamabad'
      });
      base.push({
        id: 'req-blocked',
        name: 'Blocked Account (Sperrkonto 11,208 EUR)',
        category: 'Bank Statement',
        requiredAttestation: 'Fintiba / Expatrio'
      });
    } else if (country === 'United Kingdom') {
      base.push({
        id: 'req-tb',
        name: 'IOM Tuberculosis (TB) Medical Clearance',
        category: 'Other',
        requiredAttestation: 'IOM Pakistan'
      });
      base.push({
        id: 'req-28day',
        name: '28-Day Bank Maintenance Certificate',
        category: 'Bank Statement',
        requiredAttestation: 'Bank Manager Signed'
      });
    } else if (country === 'Italy') {
      base.push({
        id: 'req-cimea',
        name: 'CIMEA Statement of Comparability / DoV',
        category: 'Attestation',
        requiredAttestation: 'CIMEA / Italian Embassy'
      });
      base.push({
        id: 'req-dsu',
        name: 'Family Registration Certificate (FRC) & Income for DSU',
        category: 'Bank Statement',
        requiredAttestation: 'NADRA & MOFA Legalized'
      });
    }

    return base;
  };

  const requirements = getReadinessRequirements(targetDestination);

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-teal-50 text-teal-800 font-bold px-2 py-0.5 rounded uppercase">
              Secure Storage
            </span>
            <span className="text-xs text-slate-500 font-medium">Encrypted Private Document Vault</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
            Document Vault & Readiness Checker
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Organize HEC/IBCC attested certificates and verify readiness against target embassy checklists.
          </p>
        </div>

        <button
          onClick={() => setShowUploadModal(true)}
          className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-md shadow-teal-500/20 flex items-center gap-1.5 transition-all self-start sm:self-auto"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Document</span>
        </button>
      </div>

      {/* Readiness Checker Card */}
      <div className="p-6 bg-slate-900 text-white rounded-3xl border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-teal-400" />
              <h2 className="font-bold text-sm">Embassy & University Readiness Matrix</h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Select your target study destination to audit which required files you have uploaded.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Destination:</span>
            <select
              value={targetDestination}
              onChange={(e) => setTargetDestination(e.target.value)}
              className="bg-slate-800 text-teal-300 font-bold text-xs p-2 rounded-xl border border-slate-700 focus:outline-none"
            >
              <option value="Germany">Germany (APS & Sperrkonto)</option>
              <option value="United Kingdom">United Kingdom (CAS & 28-day)</option>
              <option value="Italy">Italy (Universitaly & CIMEA)</option>
              <option value="United States">United States (I-20 & SEVIS)</option>
            </select>
          </div>
        </div>

        {/* Readiness Checklist Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          {requirements.map((req) => {
            const uploaded = documents.find(d => d.category === req.category);
            const isReady = !!uploaded;
            const isAttested = uploaded?.status === 'attested';

            return (
              <div
                key={req.id}
                className={`p-3.5 rounded-2xl border transition-all ${
                  isAttested
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-100'
                    : isReady
                    ? 'bg-teal-950/30 border-teal-500/30 text-teal-100'
                    : 'bg-slate-950/60 border-slate-800 text-slate-300'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <span className="font-bold block line-clamp-1">{req.name}</span>
                    <span className="text-[10px] text-slate-400 block">
                      Target Req: {req.requiredAttestation}
                    </span>
                  </div>

                  {isAttested ? (
                    <span className="text-[9px] font-extrabold bg-emerald-500 text-slate-950 px-2 py-0.5 rounded-full uppercase shrink-0">
                      Attested
                    </span>
                  ) : isReady ? (
                    <span className="text-[9px] font-bold bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded-full uppercase shrink-0 border border-teal-500/30">
                      Uploaded
                    </span>
                  ) : (
                    <span className="text-[9px] font-bold bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded-full uppercase shrink-0 border border-rose-500/30">
                      Missing
                    </span>
                  )}
                </div>

                {uploaded && (
                  <div className="mt-2 text-[10px] text-slate-400 font-mono truncate">
                    File: {uploaded.name}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Uploaded Documents List */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Your Vault Files ({documents.length})</h3>
            <p className="text-xs text-slate-400">All uploaded documents remain private to your student ID.</p>
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center">
            <div className="w-8 h-8 border-4 border-teal-500/30 border-t-teal-500 rounded-full animate-spin mx-auto" />
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center py-12 text-slate-400 space-y-2">
            <FolderLock className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-slate-700">No documents stored in vault</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Click 'Upload Document' above to store your HEC transcript, passport scan, or IELTS TRF.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-all flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700">
                      {doc.category}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        doc.status === 'attested'
                          ? 'bg-emerald-100 text-emerald-800'
                          : doc.status === 'verified'
                          ? 'bg-teal-100 text-teal-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {doc.status.replace('_', ' ')}
                    </span>
                  </div>

                  <h4 className="font-bold text-slate-900 text-xs truncate" title={doc.name}>
                    {doc.name}
                  </h4>

                  {doc.notes && (
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {doc.notes}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-200/60">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {new Date(doc.uploadedAt).toLocaleDateString()}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => showToast(`Previewing verified file: ${doc.name}`, 'info')}
                      className="p-1 text-slate-500 hover:text-teal-700 rounded"
                      title="Preview Document"
                    >
                      <FileCheck2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(doc.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded"
                      title="Delete Document"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showUploadModal && (
        <DocumentUploadModal
          onClose={() => setShowUploadModal(false)}
          onUpload={handleUpload}
        />
      )}
    </div>
  );
};
