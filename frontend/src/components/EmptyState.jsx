import React from 'react';
import { Upload, FolderOpen } from 'lucide-react';

export default function EmptyState({ onUploadClick }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white border border-slate-100 rounded-3xl shadow-xl shadow-slate-100/30 max-w-lg mx-auto mt-6 animate-slide-up">
      {/* SVG Illustration */}
      <div className="relative mb-6">
        <div className="w-24 h-24 bg-primary-50 rounded-full flex items-center justify-center text-primary-500">
          <FolderOpen className="h-12 w-12" />
        </div>
        <div className="absolute -bottom-2 -right-2 bg-white border border-slate-100 p-2 rounded-2xl shadow-md text-primary-600 animate-bounce">
          <Upload className="h-5 w-5" />
        </div>
      </div>

      <h3 className="text-xl font-bold text-slate-800 mb-2">
        Your Vault is Empty
      </h3>
      <p className="text-slate-500 text-sm max-w-sm mb-6 font-medium leading-relaxed">
        No documents have been uploaded to DocuVault yet. Upload your first PDF to get started with secure document hosting.
      </p>

      <button
        onClick={onUploadClick}
        className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-2xl shadow-lg shadow-primary-200 transition-all hover:translate-y-[-1px] active:translate-y-0 text-sm"
      >
        Upload First File
      </button>
    </div>
  );
}
