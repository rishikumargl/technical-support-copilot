import React, { useState } from 'react';
import { ChevronDown, ChevronUp, ThumbsUp, ThumbsDown } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { submitFeedback } from '../api';

export default function MessageBubble({ message }) {
  const [expanded, setExpanded] = useState(false);
  const [feedbackSent, setFeedbackSent] = useState(null);

  const handleFeedback = async (feedback) => {
    try {
      await submitFeedback(message.id, feedback);
      setFeedbackSent(feedback);
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    }
  };

  if (message.type === 'user') {
    return (
      <div className="flex justify-end message-enter">
        <div className="bg-cyan-600 text-white rounded-lg p-4 max-w-xs md:max-w-md lg:max-w-lg">
          {message.content}
        </div>
      </div>
    );
  }

  if (message.type === 'error') {
    return (
      <div className="flex justify-start message-enter">
        <div className="bg-red-900/30 border border-red-600 text-red-200 rounded-lg p-4 max-w-xs md:max-w-md lg:max-w-lg">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start message-enter">
      <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-4 max-w-2xl space-y-3">
        {/* Main Answer */}
        <div className="prose prose-invert max-w-none">
          <ReactMarkdown>{message.content}</ReactMarkdown>
        </div>

        {/* Confidence and Stats */}
        <div className="flex items-center gap-4 text-sm text-slate-400 border-t border-slate-600 pt-3">
          <div>
            <div className="text-slate-300 font-semibold">Confidence</div>
            <div className="confidence-bar mt-1">
              <div
                className="confidence-bar-fill"
                style={{ width: `${(message.confidence || 0) * 100}%` }}
              />
            </div>
            <div className="text-xs mt-1">
              {Math.round((message.confidence || 0) * 100)}%
            </div>
          </div>

          <div>
            <div className="text-slate-300 font-semibold">Sources Found</div>
            <div className="text-lg font-bold text-cyan-400">
              {message.retrievedChunks || 0}
            </div>
          </div>

          <div>
            <div className="text-slate-300 font-semibold">Search Type</div>
            <div className="text-xs uppercase bg-slate-600/30 px-2 py-1 rounded mt-1">
              {message.searchType}
            </div>
          </div>
        </div>

        {/* Sources Section */}
        {message.sources && message.sources.length > 0 && (
          <div className="border-t border-slate-600 pt-3">
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300 font-semibold"
            >
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              Sources ({message.sources.length})
            </button>

            {expanded && (
              <div className="mt-3 space-y-2">
                {message.sources.map((source, idx) => (
                  <div key={idx} className="bg-slate-800/50 p-3 rounded border border-slate-600 text-sm">
                    <div className="font-semibold text-slate-200 flex items-center gap-2">
                      <span className="source-badge">Source {source.sourceNumber}</span>
                      {source.documentName}
                    </div>

                    <div className="text-xs text-slate-400 mt-1 space-y-1">
                      <div>
                        <strong>Department:</strong> {source.department}
                      </div>
                      <div>
                        <strong>Category:</strong> {source.category}
                      </div>
                      <div>
                        <strong>Chunk:</strong> {source.chunkIndex + 1}
                      </div>
                      {source.similarity && (
                        <div>
                          <strong>Similarity:</strong> {(source.similarity * 100).toFixed(1)}%
                        </div>
                      )}
                    </div>

                    <div className="mt-2 p-2 bg-slate-700/50 rounded text-slate-300 italic text-xs">
                      "{source.chunkContent}..."
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Feedback */}
        <div className="flex gap-2 border-t border-slate-600 pt-3">
          <button
            onClick={() => handleFeedback('helpful')}
            disabled={feedbackSent !== null}
            className={`flex items-center gap-1 px-3 py-1 rounded text-sm transition ${
              feedbackSent === 'helpful'
                ? 'bg-green-600/30 text-green-400'
                : 'bg-slate-600/30 text-slate-400 hover:bg-slate-600/50'
            }`}
          >
            <ThumbsUp className="w-4 h-4" />
            Helpful
          </button>

          <button
            onClick={() => handleFeedback('not-helpful')}
            disabled={feedbackSent !== null}
            className={`flex items-center gap-1 px-3 py-1 rounded text-sm transition ${
              feedbackSent === 'not-helpful'
                ? 'bg-red-600/30 text-red-400'
                : 'bg-slate-600/30 text-slate-400 hover:bg-slate-600/50'
            }`}
          >
            <ThumbsDown className="w-4 h-4" />
            Not Helpful
          </button>
        </div>
      </div>
    </div>
  );
}
