import { useState, useCallback } from 'react';

export const useUpload = (onSuccess) => {
  const [activeUploads, setActiveUploads] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);

  const uploadFiles = useCallback(async (files) => {
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setProgress(0);
    setError(null);

    // Initialize the active upload queue
    const initialUploads = Array.from(files).map((file) => ({
      id: Math.random().toString(36).substring(7),
      name: file.name,
      size: file.size,
      status: 'UPLOADING',
      progress: 0,
    }));
    setActiveUploads(initialUploads);

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', 'http://localhost:8080/api/files/upload', true);

      // Track raw network progress via XMLHttpRequest
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          setProgress(percentComplete);
          
          setActiveUploads((prev) =>
            prev.map((item) => ({
              ...item,
              progress: percentComplete,
            }))
          );
        }
      };

      // Request completion
      xhr.onload = () => {
        setIsUploading(false);
        let apiResponse;
        try {
          apiResponse = JSON.parse(xhr.responseText);
        } catch (e) {
          apiResponse = { success: false, error: 'Server returned an invalid JSON response.' };
        }

        if (xhr.status >= 200 && xhr.status < 300 && apiResponse.success) {
          const isAsync = files.length > 3;
          const targetStatus = isAsync ? 'PROCESSING' : 'COMPLETED';

          setActiveUploads((prev) =>
            prev.map((item) => ({
              ...item,
              status: targetStatus,
              progress: 100,
            }))
          );

          if (onSuccess) {
            onSuccess(apiResponse.data, isAsync);
          }
          resolve(apiResponse);
        } else {
          const errorMsg = apiResponse.error || `Upload failed with status code ${xhr.status}`;
          setError(errorMsg);
          setActiveUploads((prev) =>
            prev.map((item) => ({
              ...item,
              status: 'FAILED',
            }))
          );
          reject(new Error(errorMsg));
        }
      };

      // Network errors
      xhr.onerror = () => {
        setIsUploading(false);
        const errorMsg = 'A network error occurred. Please check if the backend is running.';
        setError(errorMsg);
        setActiveUploads((prev) =>
          prev.map((item) => ({
            ...item,
            status: 'FAILED',
          }))
        );
        reject(new Error(errorMsg));
      };

      xhr.send(formData);
    });
  }, [onSuccess]);

  const clearUploads = useCallback(() => {
    setActiveUploads([]);
    setProgress(0);
    setError(null);
  }, []);

  return {
    uploadFiles,
    activeUploads,
    isUploading,
    progress,
    error,
    clearUploads,
  };
};
