import React, { useState } from 'react';
import { X, Upload, FileText, CheckCircle2 } from 'lucide-react';
import { StudentDocument } from '../types';

interface DocumentUploadModalProps {
  onClose: () => void;
  onUpload: (doc: Partial<StudentDocument>) => void;
}

export const DocumentUploadModal: React.FC<DocumentUploadModalProps> = ({
  onClose,
  onUpload
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<StudentDocument['category']>('Transcript');
  const [status, setStatus] = useState<StudentDocument['status']>('verified');
  const [notes, setNotes] = useState('');
  const [fileSelected, setFileSelected] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<number>(850000);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileSelected(file.name);
      setFileSize(file.size);
      if (!name) {
        setName(file.name);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpload({
      name: name || fileSelected || `${category}_Document.pdf`,
      category,
      status,
      fileSize,
      fileType: 'application/pdf',
      notes
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center border border-teal-500/30">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Upload to Document Vault</h2>
              <p className="text-xs text-slate-400">Keep attested files organized and private.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* File Picker Drag Box */}
          <div className="border-2 border-dashed border-slate-300 hover:border-teal-500 rounded-2xl p-6 text-center bg-slate-50 transition-colors">
            <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="font-semibold text-slate-700">
              {fileSelected ? fileSelected : 'Select a PDF or Document from your device'}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              Supports PDF, PNG, JPG (HEC/IBCC attested copies recommended)
            </p>
            <input
              type="file"
              onChange={handleFileChange}
              className="mt-3 block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Document Label / Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. HEC_Attested_Transcript_FAST.pdf"
              className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-teal-500 font-medium"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as StudentDocument['category'])}
                className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-teal-500 font-medium bg-white"
              >
                <option value="Transcript">Academic Transcript</option>
                <option value="Degree Certificate">Degree Certificate</option>
                <option value="Passport">Passport / CNIC</option>
                <option value="SOP">Statement of Purpose (SOP)</option>
                <option value="CV">CV / Europass Resume</option>
                <option value="LOR">Letter of Recommendation (LOR)</option>
                <option value="English Test">English Test Score (IELTS/PTE)</option>
                <option value="Bank Statement">Bank Maintenance Certificate</option>
                <option value="Attestation">HEC / IBCC / APS Document</option>
                <option value="Other">Other Certificate</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Attestation / Status *</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as StudentDocument['status'])}
                className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-teal-500 font-medium bg-white"
              >
                <option value="attested">Attested (HEC / IBCC Verified)</option>
                <option value="verified">Verified Official Copy</option>
                <option value="pending_review">Pending Attestation</option>
                <option value="needs_update">Draft / Needs Update</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Notes & Metadata</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Includes QR code verification from HEC Islamabad..."
              className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-teal-500 font-medium"
            />
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold shadow-md shadow-teal-500/20 transition-colors flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Save Document</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
