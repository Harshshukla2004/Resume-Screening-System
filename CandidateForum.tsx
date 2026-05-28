import React, { useState, useRef } from "react";
import { Candidate } from "../types";
import { Plus, Trash2, FileText, UploadCloud, RefreshCw, Layers } from "lucide-react";

interface CandidateFormProps {
  candidates: Candidate[];
  onAddCandidate: (name: string, resumeText: string) => void;
  onRemoveCandidate: (id: string) => void;
  onResetToPresets: () => void;
}

export default function CandidateForm({
  candidates,
  onAddCandidate,
  onRemoveCandidate,
  onResetToPresets
}: CandidateFormProps) {
  const [name, setName] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return alert("Candidate Name is required");
    if (!resumeText.trim()) return alert("Resume Text content is required");

    onAddCandidate(name, resumeText);
    setName("");
    setResumeText("");
  };

  // Drag and drop events
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      // Derive clean name from file name
      const derivedName = file.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ");
      setName(derivedName);
      setResumeText(text);
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      {/* Add candidate form */}
      <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-gray-50 pb-3">
          <h3 className="font-bold text-gray-900 font-sans text-sm tracking-wide uppercase flex items-center gap-2">
            <Plus className="w-4 h-4 text-indigo-600" />
            Add Candidate Profile
          </h3>
          <button
            type="button"
            onClick={onResetToPresets}
            className="flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 font-medium bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1.5 rounded-lg border border-indigo-100 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reset to Presets
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 font-mono">
              Candidate Full Name
            </label>
            <input
              type="text"
              placeholder="e.g. Rachel Green"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-50 border border-gray-200 focus:border-indigo-500 focus:bg-white rounded-xl px-4 py-2.5 text-sm text-gray-950 outline-hidden transition-all placeholder:text-gray-400 font-sans"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 font-mono">
              Resume Text Copy or Drop File
            </label>

            {/* Drag & drop zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer mb-2 transition-all ${
                isDragging
                  ? "border-indigo-500 bg-indigo-50/40"
                  : "border-gray-200 bg-slate-50 hover:bg-slate-100/50"
              }`}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".txt,.md,.json"
                className="hidden"
              />
              <UploadCloud className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-xs text-gray-600 font-sans font-semibold">
                Drag & Drop a resume files here, or <span className="text-indigo-600">Browse</span>
              </p>
              <p className="text-[10px] text-gray-400 mt-1">Supports plain text files (.txt, .md, .json)</p>
            </div>

            <textarea
              placeholder="Or paste full resume text content here... include skills, programming experience, and project highlights"
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              rows={8}
              className="w-full bg-slate-50 border border-gray-200 focus:border-indigo-500 focus:bg-white rounded-xl px-4 py-3 text-xs text-gray-950 outline-hidden font-mono transition-all leading-relaxed"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold font-sans rounded-xl text-sm transition-all shadow-xs flex items-center justify-center gap-2 hover:translate-y-[-1px]"
          >
            <Plus className="w-4 h-4" />
            Add to Screening Pipeline
          </button>
        </form>
      </div>

      {/* Active candidates list */}
      <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-2xs space-y-4">
        <h3 className="font-bold text-gray-900 font-sans text-sm tracking-wide uppercase flex items-center gap-2 border-b border-gray-50 pb-3">
          <Layers className="w-4 h-4 text-indigo-600" />
          Queue to Screen ({candidates.length})
        </h3>

        <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
          {candidates.length > 0 ? (
            candidates.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100/50 border border-slate-100 rounded-xl transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-gray-800 leading-tight">{c.name}</h4>
                    <span className="text-[10px] font-mono text-gray-400">
                      {Math.round(c.resumeText.length / 5)} words
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onRemoveCandidate(c.id)}
                  className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  title="Remove from queue"
                >
                  <Trash2 className="w-4.5 h-4.5" />
                </button>
              </div>
            ))
          ) : (
            <div className="text-center py-6">
              <p className="text-sm text-gray-400 italic">No candidates queued.</p>
              <p className="text-[10px] text-gray-400 mt-1">Add profiles or reset to defaults above to begin.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

