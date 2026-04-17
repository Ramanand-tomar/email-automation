import { useState } from 'react';
import DOMPurify from 'dompurify';
import { format } from 'date-fns';
import Avatar from '../ui/Avatar';
import Spinner from '../ui/Spinner';
import { useThread } from '../../hooks/useEmails';

function sanitize(html) {
  if (!html) return '';
  return DOMPurify.sanitize(html, {
    FORBID_TAGS: ['script', 'object', 'embed'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick'],
    ALLOW_DATA_ATTR: false,
  });
}

function ThreadMessage({ message, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  const senderName = message.sender?.name || message.sender?.email || 'Unknown';

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setOpen(!open)}
      >
        <Avatar name={senderName} size="sm" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className="font-medium text-gray-900 text-sm">{senderName}</span>
            <span className="text-xs text-gray-400">
              {message.date ? format(new Date(message.date), 'MMM d, h:mm a') : ''}
            </span>
          </div>
          {!open && (
            <p className="text-xs text-gray-400 truncate">{message.snippet}</p>
          )}
        </div>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
      {open && (
        <div className="px-4 pb-4 border-t border-gray-100">
          <div
            className="email-body prose prose-sm max-w-none mt-3 text-gray-700 text-sm overflow-x-auto"
            dangerouslySetInnerHTML={{ __html: sanitize(message.body) }}
          />
        </div>
      )}
    </div>
  );
}

export default function ThreadView({ threadId, onClose }) {
  const { data: thread, isLoading } = useThread(threadId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!thread) return null;

  const messages = thread.messages || [];

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">
          Thread ({messages.length} message{messages.length !== 1 ? 's' : ''})
        </h3>
        <button
          onClick={onClose}
          className="text-sm text-brand-500 hover:text-brand-700"
        >
          Back to email
        </button>
      </div>
      <div className="space-y-3">
        {messages.map((msg, i) => (
          <ThreadMessage key={msg.id} message={msg} defaultOpen={i === messages.length - 1} />
        ))}
      </div>
    </div>
  );
}
