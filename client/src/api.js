import axios from 'axios';

const API_BASE = '/api';

const client = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Chat API
export async function askQuestion(query, options = {}) {
  const response = await client.post('/chat/ask', {
    query,
    searchType: options.searchType || 'hybrid',
    topK: options.topK || 5,
    filters: options.filters || {},
    useCache: options.useCache !== false
  });
  return response.data;
}

export async function submitFeedback(queryId, feedback) {
  const response = await client.post('/chat/feedback', {
    queryId,
    feedback
  });
  return response.data;
}

// Document API
export async function uploadDocument(file, metadata = {}) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('department', metadata.department || 'Engineering');
  formData.append('category', metadata.category || 'Documentation');
  formData.append('version', metadata.version || '1.0');
  formData.append('chunkingStrategy', metadata.chunkingStrategy || 'semantic');

  const response = await client.post('/documents/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
}

export async function getDocuments(filters = {}) {
  const response = await client.get('/documents', {
    params: {
      department: filters.department,
      category: filters.category
    }
  });
  return response.data;
}

export async function getDocument(id) {
  const response = await client.get(`/documents/${id}`);
  return response.data;
}

export async function getDocumentChunks(id) {
  const response = await client.get(`/documents/${id}/chunks`);
  return response.data;
}

export async function getDocumentStats() {
  const response = await client.get('/documents/stats/overview');
  return response.data;
}

export async function deleteDocument(id) {
  const response = await client.delete(`/documents/${id}`);
  return response.data;
}

export default client;
