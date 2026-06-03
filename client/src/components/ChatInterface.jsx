import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader, AlertCircle } from 'lucide-react';
import { useChatStore } from '../store';
import { askQuestion } from '../api';
import MessageBubble from './MessageBubble';

export default function ChatInterface() {
  const [input, setInput] = useState('');
  const [searchType, setSearchType] = useState('hybrid');
  const messagesEndRef = useRef(null);
  const { messages, loading, addMessage, setLoading } = useChatStore();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: input,
      timestamp: new Date()
    };

    addMessage(userMessage);
    setInput('');
    setLoading(true);

    try {
      const result = await askQuestion(input, { searchType });

      const assistantMessage = {
        id: Date.now() + 1,
        type: 'assistant',
        content: result.answer,
        sources: result.sources,
        confidence: result.confidence,
        retrievedChunks: result.retrievedChunks,
        searchType: result.searchType,
        timestamp: new Date()
      };

      addMessage(assistantMessage);
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        type: 'error',
        content: error.response?.data?.error || 'Failed to get response. Please try again.',
        timestamp: new Date()
      };

      addMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-slate-800 to-slate-900">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto chat-container p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="text-slate-400 space-y-4">
              <h2 className="text-3xl font-bold text-slate-200">Technical Support Copilot</h2>
              <p className="text-lg max-w-md">
                Ask any questions about our technical documentation, troubleshooting guides, and knowledge base.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto mt-8">
                <div className="bg-slate-700/30 p-4 rounded-lg border border-slate-600 text-sm">
                  <p className="font-semibold text-cyan-400">Example:</p>
                  <p>"How do I troubleshoot a CrashLoopBackOff error?"</p>
                </div>
                <div className="bg-slate-700/30 p-4 rounded-lg border border-slate-600 text-sm">
                  <p className="font-semibold text-cyan-400">Example:</p>
                  <p>"What causes a 502 Bad Gateway issue?"</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
            {loading && (
              <div className="flex justify-center py-4">
                <div className="bg-slate-700/50 rounded-lg p-4 flex items-center gap-2">
                  <Loader className="w-4 h-4 animate-spin text-cyan-400" />
                  <span className="text-slate-300">Searching knowledge base...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-slate-700 bg-slate-800 p-4">
        <div className="max-w-4xl mx-auto space-y-3">
          {/* Search Type Selector */}
          <div className="flex gap-2 items-center text-sm">
            <span className="text-slate-400">Search:</span>
            {['vector', 'keyword', 'hybrid'].map((type) => (
              <button
                key={type}
                onClick={() => setSearchType(type)}
                className={`px-3 py-1 rounded-md transition ${
                  searchType === type
                    ? 'bg-cyan-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>

          {/* Input Form */}
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question about our documentation..."
              disabled={loading}
              className="flex-1 bg-slate-700 text-white placeholder-slate-400 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg flex items-center gap-2 transition"
            >
              <Send className="w-4 h-4" />
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
