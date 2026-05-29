import React, { useState } from 'react';
import { Download, Trash2, RefreshCw, FileText, AlertCircle, Calendar, ShieldCheck, HelpCircle } from 'lucide-react';
import { getDownloadUrl } from '../services/api';

const formatSize = (bytes) => {
  if (!bytes) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (e) {
    return dateString;
  }
};

export default function DocumentList({ files, onDelete, onRefresh, isRefreshing }) {
  const [fileToDelete, setFileToDelete] = useState(null);

  const handleDeleteConfirm = () => {
    if (fileToDelete) {
      onDelete(fileToDelete.id);
      setFileToDelete(null);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto mt-6 animate-slide-up">
      {/* Header and Refresh Button */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center space-x-2">
            <ShieldCheck className="h-5.5 w-5.5 text-primary-600" />
            <span>Vault Documents</span>
          </h2>
          <p className="text-slate-500 text-xs font-semibold">
            {files.length} Secure Document{files.length !== 1 ? 's' : ''} stored
          </p>
        </div>
        
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="flex items-center space-x-2 px-4 py-2 bg-white hover:bg-slate-50 text-slate-600 disabled:text-slate-400 font-bold text-sm border border-slate-200 rounded-2xl shadow-sm transition-all active:scale-[0.98] disabled:pointer-events-none"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin text-primary-600' : ''}`} />
          <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
        </button>
      </div>

      {/* Main Documents Table/Card Layout */}
      <div className="bg-white border border-slate-100 rounded-3xl shadow-xl shadow-slate-100/30 overflow-hidden">
        
        {/* Table View (Desktop & Tablet) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Name</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Type</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Size</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Upload Date</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Status</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 font-medium">
              {files.map((file) => {
                const isCompleted = file.status === 'COMPLETED';
                const isProcessing = file.status === 'PROCESSING';
                const isFailed = file.status === 'FAILED';

                return (
                  <tr key={file.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3 max-w-[300px]">
                        <div className="p-2 bg-primary-50 text-primary-500 rounded-xl">
                          <FileText className="h-5 w-5" />
                        </div>
                        <span className="text-slate-700 font-bold truncate" title={file.fileName}>
                          {file.fileName}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-500 text-xs">
                      PDF Document
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-500 text-xs">
                      {formatSize(file.fileSize)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-500 text-xs">
                      {formatDate(file.uploadDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {isCompleted && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-50 text-green-700">
                          Completed
                        </span>
                      )}
                      {isProcessing && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 animate-pulse">
                          Processing
                        </span>
                      )}
                      {isFailed && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-50 text-red-700">
                          Failed
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end space-x-2 opacity-80 group-hover:opacity-100 transition-opacity">
                        <a
                          href={isCompleted ? getDownloadUrl(file.id) : undefined}
                          download
                          className={`p-2 rounded-xl border border-slate-200 bg-white shadow-sm transition-all ${
                            isCompleted 
                              ? 'text-slate-600 hover:text-primary-600 hover:border-primary-200 hover:shadow' 
                              : 'text-slate-300 pointer-events-none'
                          }`}
                          title={isCompleted ? 'Download' : 'Upload not complete'}
                        >
                          <Download className="h-4 w-4" />
                        </a>
                        <button
                          onClick={() => setFileToDelete(file)}
                          className="p-2 text-slate-600 hover:text-red-600 border border-slate-200 hover:border-red-200 bg-white hover:shadow shadow-sm rounded-xl transition-all"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Card View (Mobile) */}
        <div className="md:hidden divide-y divide-slate-100 p-4 space-y-4">
          {files.map((file) => {
            const isCompleted = file.status === 'COMPLETED';
            const isProcessing = file.status === 'PROCESSING';
            const isFailed = file.status === 'FAILED';

            return (
              <div key={file.id} className="pt-4 first:pt-0 flex flex-col space-y-3 font-semibold">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className="p-2.5 bg-primary-50 text-primary-500 rounded-xl shrink-0">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-700 truncate" title={file.fileName}>
                        {file.fileName}
                      </p>
                      <span className="text-xs text-slate-400">PDF • {formatSize(file.fileSize)}</span>
                    </div>
                  </div>
                  
                  {isCompleted && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-50 text-green-700 uppercase">
                      Done
                    </span>
                  )}
                  {isProcessing && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 uppercase animate-pulse">
                      Proc
                    </span>
                  )}
                  {isFailed && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-700 uppercase">
                      Fail
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                  <span className="flex items-center"><Calendar className="h-3.5 w-3.5 mr-1 text-slate-300" />{formatDate(file.uploadDate)}</span>
                  
                  <div className="flex space-x-2">
                    <a
                      href={isCompleted ? getDownloadUrl(file.id) : undefined}
                      download
                      className={`p-2 rounded-xl border border-slate-200 bg-white ${
                        isCompleted ? 'text-slate-600 hover:text-primary-600' : 'text-slate-300 pointer-events-none'
                      }`}
                    >
                      <Download className="h-3.5 w-3.5" />
                    </a>
                    <button
                      onClick={() => setFileToDelete(file)}
                      className="p-2 text-slate-600 hover:text-red-600 border border-slate-200 rounded-xl"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* Confirmation Modal */}
      {fileToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-100 p-6 max-w-sm w-full shadow-2xl animate-scale-up space-y-5">
            <div className="flex items-start space-x-3.5 text-slate-800">
              <div className="p-3 bg-red-50 text-red-600 rounded-2xl shrink-0">
                <AlertCircle className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-md font-bold">Delete File</h3>
                <p className="text-slate-500 text-xs font-semibold leading-relaxed">
                  Are you sure you want to delete <span className="text-slate-700 font-bold">"{fileToDelete.fileName}"</span>? This action cannot be undone and the file will be permanently removed.
                </p>
              </div>
            </div>

            <div className="flex space-x-3 justify-end text-xs font-bold">
              <button
                onClick={() => setFileToDelete(null)}
                className="px-4.5 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-500 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4.5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-lg shadow-red-100 transition-colors"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
