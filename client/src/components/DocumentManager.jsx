import React, { useState, useEffect } from 'react';
import { Upload, Trash2, Loader, FileText } from 'lucide-react';
import { useDocumentStore } from '../store';
import { uploadDocument, getDocuments, deleteDocument, getDocumentStats } from '../api';

export default function DocumentManager() {
  const [file, setFile] = useState(null);
  const [metadata, setMetadata] = useState({
    department: 'Engineering',
    category: 'Documentation',
    version: '1.0',
    chunkingStrategy: 'semantic'
  });
  const [uploading, setUploading] = useState(false);
  const { documents, loading, stats, setDocuments, removeDocument, setLoading, setStats } = useDocumentStore();

  useEffect(() => {
    fetchDocuments();
    fetchStats();
  }, []);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const docs = await getDocuments();
      setDocuments(docs);
    } catch (error) {
      console.error('Failed to fetch documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await getDocumentStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    try {
      const result = await uploadDocument(file, metadata);
      setFile(null);
      setMetadata({
        department: 'Engineering',
        category: 'Documentation',
        version: '1.0',
        chunkingStrategy: 'semantic'
      });

      await fetchDocuments();
      await fetchStats();

      alert(`Document uploaded successfully! Created ${result.chunksCreated} chunks using ${result.chunkingStrategy} strategy.`);
    } catch (error) {
      alert('Failed to upload document: ' + (error.response?.data?.error || error.message));
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this document?')) return;

    try {
      await deleteDocument(id);
      removeDocument(id);
      await fetchStats();
    } catch (error) {
      alert('Failed to delete document: ' + error.message);
    }
  };

  return (
    <div className="bg-slate-800 rounded-lg p-6 space-y-6">
      {/* Header */}
      <div className="border-b border-slate-700 pb-4">
        <h2 className="text-2xl font-bold text-white mb-2">Document Manager</h2>
        <p className="text-slate-400">Upload and manage your technical documentation</p>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-700/50 p-4 rounded-lg border border-slate-600">
            <div className="text-3xl font-bold text-cyan-400">{stats.total_documents || 0}</div>
            <div className="text-sm text-slate-400">Documents</div>
          </div>
          <div className="bg-slate-700/50 p-4 rounded-lg border border-slate-600">
            <div className="text-3xl font-bold text-cyan-400">{stats.total_chunks || 0}</div>
            <div className="text-sm text-slate-400">Chunks</div>
          </div>
          <div className="bg-slate-700/50 p-4 rounded-lg border border-slate-600">
            <div className="text-3xl font-bold text-cyan-400">{stats.unique_departments || 0}</div>
            <div className="text-sm text-slate-400">Departments</div>
          </div>
          <div className="bg-slate-700/50 p-4 rounded-lg border border-slate-600">
            <div className="text-3xl font-bold text-cyan-400">{stats.unique_categories || 0}</div>
            <div className="text-sm text-slate-400">Categories</div>
          </div>
        </div>
      )}

      {/* Upload Form */}
      <form onSubmit={handleUpload} className="bg-slate-700/30 border-2 border-dashed border-slate-600 rounded-lg p-8">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">Document File</label>
            <input
              type="file"
              accept=".pdf,.txt,.md"
              onChange={(e) => setFile(e.target.files?.[0])}
              disabled={uploading}
              className="block w-full text-sm text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-cyan-600 file:text-white hover:file:bg-cyan-700"
            />
            <p className="text-xs text-slate-400 mt-1">Supported: PDF, TXT, Markdown</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">Department</label>
              <select
                value={metadata.department}
                onChange={(e) => setMetadata({ ...metadata, department: e.target.value })}
                className="w-full bg-slate-600 text-white rounded px-3 py-2"
              >
                <option>Engineering</option>
                <option>Operations</option>
                <option>Support</option>
                <option>Product</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">Category</label>
              <select
                value={metadata.category}
                onChange={(e) => setMetadata({ ...metadata, category: e.target.value })}
                className="w-full bg-slate-600 text-white rounded px-3 py-2"
              >
                <option>Documentation</option>
                <option>Troubleshooting</option>
                <option>FAQ</option>
                <option>Release Notes</option>
                <option>Incident Reports</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">Version</label>
              <input
                type="text"
                value={metadata.version}
                onChange={(e) => setMetadata({ ...metadata, version: e.target.value })}
                className="w-full bg-slate-600 text-white rounded px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">Chunking Strategy</label>
              <select
                value={metadata.chunkingStrategy}
                onChange={(e) => setMetadata({ ...metadata, chunkingStrategy: e.target.value })}
                className="w-full bg-slate-600 text-white rounded px-3 py-2"
              >
                <option value="semantic">Semantic</option>
                <option value="fixed">Fixed Size</option>
                <option value="paragraph">Paragraph Aware</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={!file || uploading}
            className="w-full bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition"
          >
            {uploading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                Upload Document
              </>
            )}
          </button>
        </div>
      </form>

      {/* Documents List */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Uploaded Documents</h3>

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader className="w-6 h-6 animate-spin text-cyan-400" />
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No documents uploaded yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {documents.map((doc) => (
              <div key={doc.id} className="bg-slate-700/50 p-4 rounded-lg border border-slate-600 flex items-center justify-between">
                <div className="flex-1">
                  <div className="font-semibold text-white">{doc.name}</div>
                  <div className="text-xs text-slate-400 space-x-2">
                    <span className="source-badge">{doc.department}</span>
                    <span className="source-badge">{doc.category}</span>
                    <span className="source-badge">v{doc.version}</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    Uploaded: {new Date(doc.created_at).toLocaleDateString()}
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(doc.id)}
                  className="bg-red-600/20 hover:bg-red-600/40 text-red-400 p-2 rounded transition"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
