import { useState } from 'react';
import AIReplyGenerator from './AIReplyGenerator';
import Spinner from '../ui/Spinner';
import { useReplyToEmail } from '../../hooks/useEmails';

export default function ReplyPanel({ email, onClose, onSent }) {
  const [body, setBody] = useState('');
  const [showAI, setShowAI] = useState(false);
  const { mutate: reply, isPending } = useReplyToEmail();

  const handleSend = () => {
    if (!body.trim()) return;
    reply(
      {
        id: email.messageId || email.id,
        payload: {
          body,
          to: email.sender?.email,
          subject: email.subject ? `Re: ${email.subject}` : 'Re: (No Subject)',
        },
        threadId: email.threadId,
      },
      {
        onSuccess: () => {
          setBody('');
          onSent?.();
        },
      }
    );
  };

  return (
    <div className="p-4 bg-gray-50">
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        {/* Reply header */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100 bg-gray-50">
          <div className="text-sm text-gray-600">
            <span className="font-medium">Reply to:</span> {email.sender?.name || email.sender?.email}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* AI Generator toggle */}
        <div className="px-4 pt-3">
          <button
            onClick={() => setShowAI(!showAI)}
            className="flex items-center gap-1.5 text-xs text-brand-600 hover:text-brand-700 font-medium mb-2"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            {showAI ? 'Hide AI Generator' : 'Use AI to Draft Reply'}
          </button>

          {showAI && (
            <div className="mb-3">
              <AIReplyGenerator
                email={email}
                onReplyGenerated={(text) => {
                  setBody(text);
                  setShowAI(false);
                }}
              />
            </div>
          )}
        </div>

        {/* Textarea */}
        <div className="px-4 pb-3">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write your reply..."
            rows={5}
            className="w-full text-sm text-gray-700 bg-transparent resize-none outline-none placeholder-gray-400 leading-relaxed"
          />
        </div>

        {/* Footer */}
        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2 px-4 py-3 border-t border-gray-100 bg-gray-50">
          <p className="text-xs text-gray-400 text-center sm:text-left">
            {body.length > 0 ? `${body.length} characters` : 'Write or generate a reply above'}
          </p>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSend}
              disabled={!body.trim() || isPending}
              className="flex items-center gap-2 px-4 py-1.5 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              {isPending ? <Spinner size="sm" /> : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              )}
              {isPending ? 'Sending...' : 'Send Reply'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
