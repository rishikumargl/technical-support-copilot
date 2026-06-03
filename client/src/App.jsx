import React, { useState } from 'react';
import Layout from './components/Layout';
import ChatInterface from './components/ChatInterface';
import DocumentManager from './components/DocumentManager';
import './index.css';

function App() {
  const [activeTab, setActiveTab] = useState('chat');

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      {activeTab === 'chat' && <ChatInterface />}
      {activeTab === 'documents' && (
        <div className="overflow-auto h-full">
          <div className="p-6">
            <DocumentManager />
          </div>
        </div>
      )}
    </Layout>
  );
}

export default App;
