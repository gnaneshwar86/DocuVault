import React from 'react';
import { Shield, Upload, FileText } from 'lucide-react';

export default function Navbar({ activeView, onViewChange }) {
  return (
    <nav className="sticky top-0 z-50 w-full glass-nav px-6 py-4 shadow-sm">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Brand/Logo */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onViewChange('upload')}>
          <div className="bg-primary-600 text-white p-2 rounded-xl shadow-md shadow-primary-200 hover:scale-105 transition-transform">
            <Shield className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-slate-800">Docu<span className="text-primary-600">Vault</span></span>
            <span className="block text-xs font-semibold tracking-wider text-slate-400 uppercase">Secure Repository</span>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onViewChange('upload')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
              activeView === 'upload'
                ? 'bg-primary-50 text-primary-600 shadow-sm border border-primary-100'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            <Upload className="h-4 w-4" />
            <span>Upload Files</span>
          </button>
          
          <button
            onClick={() => onViewChange('documents')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
              activeView === 'documents'
                ? 'bg-primary-50 text-primary-600 shadow-sm border border-primary-100'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            <FileText className="h-4 w-4" />
            <span>Documents Vault</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
