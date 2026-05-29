import React, { useState, useEffect, useRef } from 'react';
import Navbar from './components/Navbar';
import UploadZone from './components/UploadZone';
import UploadProgressList from './components/UploadProgressList';
import DocumentList from './components/DocumentList';
import SkeletonLoader from './components/SkeletonLoader';
import EmptyState from './components/EmptyState';
import { useUpload } from './hooks/useUpload';
import { fetchFiles, deleteFile } from './services/api';
import { Sparkles, FileText, CheckCircle, Info, AlertTriangle, AlertCircle, X } from 'lucide-react';

export default function App() {
  const [activeView, setActiveView] = useState('upload');
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  
  // Custom Toast System State
  const [toast, setToast] = useState(null);
  const toastTimeoutRef = useRef(null);

  const showToast = (message, type = 'success') => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToast({ message, type });
    toastTimeoutRef.current = setTimeout(() => {
      setToast(null);
    }, 5000);
  };

  const handleUploadSuccess = (data, isAsync) => {
    if (isAsync) {
      showToast(`Batch processing initiated. Processing ${data.fileCount} files in the background.`, 'info');
      // Transition to documents page to see processing files
      setActiveView('documents');
      loadFiles(false);
    } else {
      showToast(`Successfully uploaded ${data.length} document(s).`, 'success');
      // Transition to documents page
      setActiveView('documents');
      loadFiles(false);
    }
  };

  const { uploadFiles, activeUploads, isUploading, progress, error: uploadError } = useUpload(handleUploadSuccess);

  // Fetch all files from backend
  const loadFiles = async (showLoader = true) => {
    if (showLoader) setIsLoading(true);
    else setIsRefreshing(true);
    setFetchError(null);
    try {
      const response = await fetchFiles();
      if (response.success) {
        setFiles(response.data);
      }
    } catch (err) {
      setFetchError(err.message || 'Failed to connect to backend service.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Delete file handler
  const handleDeleteFile = async (id) => {
    try {
      const response = await deleteFile(id);
      if (response.success) {
        setFiles((prev) => prev.filter((file) => file.id !== id));
        showToast('Document deleted successfully.', 'success');
      }
    } catch (err) {
      showToast(err.message || 'Failed to delete the document.', 'error');
    }
  };

  // Fetch files on view load
  useEffect(() => {
    loadFiles(true);
  }, []);

  // Polling for async background processing
  // If there are files with status 'PROCESSING', we poll the backend every 3 seconds.
  useEffect(() => {
    const hasProcessingFiles = files.some(file => file.status === 'PROCESSING');
    let intervalId = null;

    if (hasProcessingFiles) {
      intervalId = setInterval(() => {
        loadFiles(false);
      }, 3000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [files]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar activeView={activeView} onViewChange={setActiveView} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-10">
        
        {activeView === 'upload' ? (
          <div className="space-y-10">
            {/* Page Header */}
            <div className="text-center space-y-3 max-w-xl mx-auto">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-primary-50 text-primary-600 border border-primary-100">
                <Sparkles className="h-3.5 w-3.5 mr-1" />
                Upload Documents
              </span>
              <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight">
                Securely Upload PDFs to DocuVault
              </h1>
              <p className="text-slate-500 font-semibold text-sm leading-relaxed">
                Add one or multiple PDF documents. Files under 3 are processed instantly; larger batches are handled in the background.
              </p>
            </div>

            {/* Upload Zone & Progress Area */}
            <div className="space-y-6">
              <UploadZone onFilesSelected={uploadFiles} />
              
              <UploadProgressList 
                uploads={activeUploads} 
                error={uploadError} 
              />
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Vault Dashboard View */}
            {isLoading ? (
              <div className="space-y-6 max-w-6xl mx-auto">
                <div className="h-8 bg-slate-200 rounded-md w-48 animate-pulse"></div>
                <SkeletonLoader />
              </div>
            ) : fetchError ? (
              <div className="flex flex-col items-center justify-center p-8 bg-white border border-slate-100 rounded-3xl shadow-xl shadow-slate-100/30 max-w-md mx-auto mt-12 space-y-4">
                <div className="p-3 bg-red-50 text-red-500 rounded-full">
                  <AlertCircle className="h-10 w-10" />
                </div>
                <div className="text-center space-y-1.5">
                  <h3 className="text-md font-bold text-slate-800">Connection Error</h3>
                  <p className="text-slate-500 text-xs font-semibold">{fetchError}</p>
                </div>
                <button
                  onClick={() => loadFiles(true)}
                  className="px-5 py-2 bg-primary-600 hover:bg-primary-700 text-white font-bold text-sm rounded-xl transition-all"
                >
                  Retry Connection
                </button>
              </div>
            ) : files.length === 0 ? (
              <EmptyState onUploadClick={() => setActiveView('upload')} />
            ) : (
              <DocumentList
                files={files}
                onDelete={handleDeleteFile}
                onRefresh={() => loadFiles(false)}
                isRefreshing={isRefreshing}
              />
            )}
          </div>
        )}
      </main>

      {/* Floating Toast Notification Container */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-slide-up">
          <div className={`flex items-center space-x-3 px-5 py-4 rounded-2xl shadow-2xl border text-sm font-semibold max-w-md ${
            toast.type === 'success' 
              ? 'bg-white border-green-100 text-slate-800 shadow-green-100/20' 
              : toast.type === 'error'
              ? 'bg-red-50 border-red-100 text-red-800 shadow-red-100/10'
              : 'bg-blue-50 border-blue-100 text-blue-800 shadow-blue-100/10'
          }`}>
            {toast.type === 'success' && <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />}
            {toast.type === 'error' && <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />}
            {toast.type === 'info' && <Info className="h-5 w-5 text-blue-500 shrink-0" />}

            <span className="flex-1">{toast.message}</span>
            
            <button 
              onClick={() => setToast(null)}
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
