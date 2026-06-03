import React, { useState } from 'react';
import { Menu, X, MessageSquare, FileText } from 'lucide-react';

export default function Layout({ children, activeTab, onTabChange }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const tabs = [
    { id: 'chat', label: 'Chat', icon: MessageSquare },
    { id: 'documents', label: 'Documents', icon: FileText }
  ];

  return (
    <div className="flex h-screen bg-slate-900">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? 'w-64' : 'w-0'
        } transition-all duration-300 bg-slate-800 border-r border-slate-700 flex flex-col overflow-hidden`}
      >
        <div className="p-6 border-b border-slate-700">
          <h1 className="text-2xl font-bold text-cyan-400">RAG Assistant</h1>
          <p className="text-sm text-slate-400 mt-1">Technical Support Copilot</p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  onTabChange(tab.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition ${
                  activeTab === tab.id
                    ? 'bg-cyan-600 text-white'
                    : 'text-slate-300 hover:bg-slate-700'
                }`}
              >
                <Icon className="w-5 h-5" />
                {tab.label}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-700">
          <div className="bg-slate-700/50 p-3 rounded-lg text-xs text-slate-300">
            <p className="font-semibold text-slate-200 mb-2">Production-Ready RAG</p>
            <ul className="space-y-1 text-slate-400">
              <li>✓ Hybrid Search</li>
              <li>✓ Semantic Chunking</li>
              <li>✓ Vector Embeddings</li>
              <li>✓ Source Attribution</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="bg-slate-800 border-b border-slate-700 px-4 py-3 flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-slate-300 hover:text-white"
          >
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          <h2 className="flex-1 text-lg font-semibold text-white">
            {tabs.find(t => t.id === activeTab)?.label}
          </h2>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
