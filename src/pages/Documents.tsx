// ============================================================
// Documents Vault Page — Document Management
// ============================================================
import React, { useState, useEffect } from 'react';
import {
  FolderOpen, Plus, FileText, CheckCircle2,
  AlertCircle, Trash2, Edit2, X, Save, CreditCard
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { StudentDocument, DocumentCategory, DocumentStatus } from '../types';
import { getDocuments, createDocument, updateDocument, deleteDocument } from '../lib/firestore';

const CATEGORIES: DocumentCategory[] = [
  'Transcript', 'Degree Certificate', 'Passport', 'National ID',
  'SOP', 'CV / Resume', 'Letter of Recommendation', 'Language Test',
  'Bank Statement', 'Visa Document', 'Scholarship Document', 'Other'
];

const STATUS_STYLES: Record<DocumentStatus, string> = {
  Draft: 'text-slate-400 bg-slate-800 border-slate-700',
  Complete: 'text-brand-400 bg-brand-400/10 border-brand-400/30',
  'Needs Update': 'text-amber-400 bg-amber-400/10 border-amber-400/30',
  Verified: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30',
  Attested: 'text-purple-400 bg-purple-400/10 border-purple-400/30',
};

const CATEGORY_ICONS: Partial<Record<DocumentCategory, React.ReactNode>> = {
  Passport: <span>🛂</span>,
  Transcript: <span>📊</span>,
  SOP: <span>✍️</span>,
  'CV / Resume': <span>📄</span>,
  'Letter of Recommendation': <span>📝</span>,
  'Language Test': <span>🌍</span>,
  'Bank Statement': <span>💳</span>,
  'Degree Certificate': <span>🎓</span>,
  'National ID': <span>🪪</span>,
};

const defaultDoc: Partial<StudentDocument> = {
  name: '', category: 'Transcript', fileType: 'PDF',
  fileSizeKb: 0, status: 'Draft', notes: ''
};

export const Documents: React.FC = () => {
  const { profile } = useAuth();
  const { showToast } = useToast();
  const [documents, setDocuments] = useState<StudentDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingDoc, setEditingDoc] = useState<StudentDocument | null>(null);
  const [formData, setFormData] = useState<Partial<StudentDocument>>(defaultDoc);
  const [saving, setSaving] = useState(false);
  const [filterCategory, setFilterCategory] = useState<DocumentCategory | 'All'>('All');

  useEffect(() => {
    const load = async () => {
      if (!profile?.uid) return;
      const docs = await getDocuments(profile.uid);
      setDocuments(docs);
      setLoading(false);
    };
    load();
  }, [profile?.uid]);

  const filtered = filterCategory === 'All'
    ? documents
    : documents.filter(d => d.category === filterCategory);

  const handleSave = async () => {
    if (!profile?.uid) return;
    if (!formData.name?.trim()) { showToast('Please enter a document name.', 'error'); return; }

    setSaving(true);
    try {
      if (editingDoc) {
        await updateDocument(editingDoc.id, formData);
        setDocuments(prev => prev.map(d => d.id === editingDoc.id ? { ...d, ...formData } : d));
        showToast('Document updated!', 'success');
      } else {
        const id = await createDocument({
          ...formData,
          userId: profile.uid,
          uploadedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        } as Omit<StudentDocument, 'id'>);
        setDocuments(prev => [{ id, ...formData, userId: profile.uid } as StudentDocument, ...prev]);
        showToast('Document added to vault!', 'success');
      }
      setShowModal(false);
      setEditingDoc(null);
      setFormData(defaultDoc);
    } catch (err) {
      showToast('Failed to save document.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (doc: StudentDocument) => {
    if (!window.confirm(`Remove "${doc.name}" from vault?`)) return;
    await deleteDocument(doc.id);
    setDocuments(prev => prev.filter(d => d.id !== doc.id));
    showToast('Document removed.', 'info');
  };

  const verifiedCount = documents.filter(d => d.status === 'Verified' || d.status === 'Attested').length;
  const needsUpdateCount = documents.filter(d => d.status === 'Needs Update').length;

  const REQUIRED_DOCS: DocumentCategory[] = [
    'Passport', 'Transcript', 'Degree Certificate', 'SOP', 'CV / Resume', 'Language Test'
  ];
  const uploadedCategories = new Set(documents.map(d => d.category));
  const missingRequired = REQUIRED_DOCS.filter(c => !uploadedCategories.has(c));

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-black text-white">Document Vault</h1>
          <p className="text-slate-400 text-sm mt-1">Organize all your application documents in one place</p>
        </div>
        <button onClick={() => { setFormData(defaultDoc); setEditingDoc(null); setShowModal(true); }}
          className="btn-primary text-sm">
          <Plus className="w-4 h-4" /> Add Document
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Docs', value: documents.length, color: 'text-slate-300' },
          { label: 'Verified', value: verifiedCount, color: 'text-emerald-400' },
          { label: 'Needs Update', value: needsUpdateCount, color: 'text-amber-400' },
          { label: 'Missing Required', value: missingRequired.length, color: 'text-rose-400' },
        ].map((s, i) => (
          <div key={i} className="card px-4 py-3 text-center">
            <div className={`text-2xl font-black ${s.color}`}>{s.value}</div>
            <div className="text-xs text-slate-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Missing Required Docs Alert */}
      {missingRequired.length > 0 && (
        <div className="card p-4 border-amber-500/30 bg-amber-500/5">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-300">Missing Required Documents</p>
              <p className="text-xs text-amber-400/70 mt-1">
                Most universities require: {missingRequired.join(', ')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Category Filter */}
      {documents.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {(['All', ...CATEGORIES] as (DocumentCategory | 'All')[]).map(cat => (
            <button key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                filterCategory === cat
                  ? 'bg-brand-500/20 border-brand-500 text-brand-400'
                  : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-600'
              }`}>
              {cat} {cat !== 'All' && `(${documents.filter(d => d.category === cat).length})`}
            </button>
          ))}
        </div>
      )}

      {/* Document List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-20 rounded-2xl bg-slate-900 animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card py-16 text-center space-y-4">
          <FolderOpen className="w-12 h-12 text-slate-700 mx-auto" />
          <div>
            <p className="text-slate-300 font-semibold">
              {filterCategory === 'All' ? 'No documents yet' : `No ${filterCategory} documents`}
            </p>
            <p className="text-sm text-slate-500 mt-1">Add your application documents to track their status.</p>
          </div>
          <button onClick={() => setShowModal(true)} className="btn-primary text-sm mx-auto">
            <Plus className="w-4 h-4" /> Add Document
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filtered.map(doc => (
            <div key={doc.id} className="card p-4 flex items-start gap-3 hover:scale-[1.01] transition-all">
              <div className="text-2xl shrink-0 mt-1">
                {CATEGORY_ICONS[doc.category] || <FileText className="w-6 h-6 text-slate-500" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="text-sm font-semibold text-white truncate">{doc.name}</h3>
                  <span className={`badge text-[9px] border shrink-0 ${STATUS_STYLES[doc.status]}`}>
                    {doc.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500">{doc.category}</p>
                {doc.notes && <p className="text-xs text-slate-600 mt-1 line-clamp-1">{doc.notes}</p>}
                <p className="text-[10px] text-slate-700 mt-1">{doc.uploadedAt.split('T')[0]}</p>
              </div>
              <div className="flex flex-col gap-1 shrink-0">
                <button onClick={() => { setFormData(doc); setEditingDoc(doc); setShowModal(true); }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all">
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => handleDelete(doc)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-400/10 transition-all">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md card p-6 space-y-4 animate-slide-up">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-white">
                {editingDoc ? 'Edit Document' : 'Add Document'}
              </h2>
              <button onClick={() => { setShowModal(false); setEditingDoc(null); }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Document Name *</label>
                <input className="input-dark" placeholder="e.g. Official Transcript - Spring 2024"
                  value={formData.name || ''} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Category</label>
                  <select className="input-dark" value={formData.category || 'Transcript'}
                    onChange={e => setFormData(p => ({ ...p, category: e.target.value as DocumentCategory }))}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Status</label>
                  <select className="input-dark" value={formData.status || 'Draft'}
                    onChange={e => setFormData(p => ({ ...p, status: e.target.value as DocumentStatus }))}>
                    {(['Draft', 'Complete', 'Needs Update', 'Verified', 'Attested'] as DocumentStatus[]).map(s =>
                      <option key={s} value={s}>{s}</option>
                    )}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Notes</label>
                <textarea className="input-dark resize-none" rows={2}
                  placeholder="HEC attested, valid until 2026, etc."
                  value={formData.notes || ''} onChange={e => setFormData(p => ({ ...p, notes: e.target.value }))} />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={() => { setShowModal(false); setEditingDoc(null); }}
                className="btn-ghost flex-1 justify-center py-2.5 text-sm">Cancel</button>
              <button onClick={handleSave} disabled={saving}
                className="btn-primary flex-1 justify-center py-2.5 text-sm">
                {saving ? 'Saving...' : <><Save className="w-4 h-4" /> {editingDoc ? 'Update' : 'Add'}</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
