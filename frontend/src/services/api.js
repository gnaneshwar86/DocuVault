const API_BASE_URL = 'http://localhost:8080/api';

export const fetchFiles = async () => {
  const response = await fetch(`${API_BASE_URL}/files`);
  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.error || 'Failed to fetch files');
  }
  return data; // Returns { success: true, data: [...] }
};

export const deleteFile = async (id) => {
  const response = await fetch(`${API_BASE_URL}/files/${id}`, {
    method: 'DELETE',
  });
  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.error || 'Failed to delete file');
  }
  return data; // Returns { success: true, message: '...' }
};

export const getDownloadUrl = (id) => {
  return `${API_BASE_URL}/files/${id}/download`;
};
