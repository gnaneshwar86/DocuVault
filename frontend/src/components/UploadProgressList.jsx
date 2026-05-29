import React from 'react';
import { Loader2, CheckCircle2, XCircle, AlertCircle, FileText } from 'lucide-react';

const formatSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export default function UploadProgressList({ uploads, error }) {
  if (uploads.length === 0 && !error) return null;

  return (
    <div className="w-full max-w-xl mx-auto mt-8 bg-white border border-slate-100 rounded-3xl p-6 shadow-xl shadow-slate-100/50 space-y-4 animate-slide-up">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h4 className="text-md font-bold text-slate-800">Upload Activity</h4>
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          {uploads.length} File{uploads.length !== 1 ? 's' : ''}
        </span>
      </div>

      {error && (
        <div className="flex items-start space-x-2 bg-red-50 border border-red-100 text-red-700 p-4 rounded-2xl text-sm font-medium">
          <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Upload Error: </span>
            <span>{error}</span>
          </div>
        </div>
      )}

      <div className="space-y-3 divide-y divide-slate-50 max-h-[250px] overflow-y-auto pr-1">
        {uploads.map((upload, index) => {
          const isUploading = upload.status === 'UPLOADING';
          const isProcessing = upload.status === 'PROCESSING';
          const isCompleted = upload.status === 'COMPLETED';
          const isFailed = upload.status === 'FAILED';

          return (
            <div key={upload.id || index} className={`pt-3 ${index === 0 ? 'pt-0' : ''} flex items-start space-x-3`}>
              <div className={`p-2.5 rounded-xl mt-0.5 shrink-0 ${
                isFailed ? 'bg-red-50 text-red-500' :
                isCompleted ? 'bg-green-50 text-green-600' : 'bg-primary-50 text-primary-500'
              }`}>
                <FileText className="h-5 w-5" />
              </div>

              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-slate-700 truncate pr-2">
                    {upload.name}
                  </p>
                  <span className="text-xs text-slate-400 font-semibold uppercase whitespace-nowrap shrink-0">
                    {formatSize(upload.size)}
                  </span>
                </div>

                {/* Progress Bar & Percentage */}
                {(isUploading || isProcessing) && (
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isProcessing ? 'bg-indigo-500 animate-pulse' : 'bg-primary-500'
                        }`}
                        style={{ width: `${upload.progress || 0}%` }}
                      ></div>
                    </div>
                    <span className="text-xs font-bold text-slate-500 shrink-0 w-8 text-right">
                      {upload.progress || 0}%
                    </span>
                  </div>
                )}

                {/* Status Badges */}
                <div className="flex items-center justify-between pt-0.5">
                  <div className="flex items-center space-x-1.5">
                    {isUploading && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-600">
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                        Uploading...
                      </span>
                    )}
                    {isProcessing && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-600 animate-pulse">
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                        Processing...
                      </span>
                    )}
                    {isCompleted && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-green-50 text-green-600">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Complete
                      </span>
                    )}
                    {isFailed && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-red-50 text-red-600">
                        <XCircle className="h-3 w-3 mr-1" />
                        Failed
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
