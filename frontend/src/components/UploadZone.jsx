import React, { useState, useRef } from 'react';
import { UploadCloud, AlertCircle, FileType } from 'lucide-react';

export default function UploadZone({ onFilesSelected }) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const validateAndSelectFiles = (files) => {
    setError(null);
    const validFiles = [];
    const invalidFiles = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        validFiles.push(file);
      } else {
        invalidFiles.push(file.name);
      }
    }

    if (invalidFiles.length > 0) {
      setError(`Rejected non-PDF files: ${invalidFiles.join(', ')}. Only PDF documents are allowed.`);
    }

    if (validFiles.length > 0) {
      onFilesSelected(validFiles);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSelectFiles(e.dataTransfer.files);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSelectFiles(e.target.files);
    }
  };

  const triggerFileBrowser = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={triggerFileBrowser}
        className={`relative flex flex-col items-center justify-center w-full min-h-[300px] p-8 border-2 border-dashed rounded-3xl cursor-pointer transition-all duration-300 ${
          isDragActive
            ? 'border-primary-500 bg-primary-50/50 scale-[0.99] shadow-inner'
            : 'border-slate-300 bg-white hover:border-primary-400 hover:shadow-lg hover:shadow-slate-100'
        }`}
      >
        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          multiple
          accept=".pdf,application/pdf"
          onChange={handleFileChange}
        />

        {/* Upload Zone Contents */}
        <div className="flex flex-col items-center text-center space-y-4">
          <div className={`p-4 rounded-full transition-colors duration-300 ${
            isDragActive ? 'bg-primary-500 text-white' : 'bg-slate-50 text-primary-500'
          }`}>
            <UploadCloud className={`h-12 w-12 transition-transform duration-300 ${
              isDragActive ? 'scale-110 animate-pulse' : 'group-hover:translate-y-[-2px]'
            }`} />
          </div>

          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-800">
              Drag and drop your PDF documents here
            </h3>
            <p className="text-sm text-slate-500 font-medium">
              or click to browse local files
            </p>
          </div>

          <div className="flex items-center space-x-2 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-full text-xs font-semibold text-slate-500">
            <FileType className="h-3.5 w-3.5 text-primary-500" />
            <span>Accepts PDF files only</span>
          </div>

          <button
            type="button"
            className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-bold rounded-2xl shadow-lg shadow-primary-200 transition-all hover:translate-y-[-1px] active:translate-y-0"
            onClick={(e) => {
              e.stopPropagation();
              triggerFileBrowser();
            }}
          >
            Browse Files
          </button>
        </div>
      </div>

      {/* Local Error Alert */}
      {error && (
        <div className="mt-4 flex items-start space-x-2 bg-red-50 border border-red-100 text-red-700 p-4 rounded-2xl text-sm font-medium animate-slide-up">
          <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
