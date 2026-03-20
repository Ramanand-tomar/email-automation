import { useState } from 'react';
import DOMPurify from 'dompurify';
import { format } from 'date-fns';
import Avatar from '../ui/Avatar';
import Spinner from '../ui/Spinner';
import EmailActionBar from './EmailActionBar';
import ReplyPanel from './ReplyPanel';
import ThreadView from './ThreadView';
import { useEmailDetail } from '../../hooks/useEmails';

function sanitize(html) {
  if (!html) return '';
  return DOMPurify.sanitize(html, {
    FORBID_TAGS: ['script', 'object', 'embed'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick'],
    ALLOW_DATA_ATTR: false,
    ADD_ATTR: ['target'],
  });
}

export default function EmailDetail({ emailId, onPrevEmail, onNextEmail }) {
  const [showReply, setShowReply] = useState(false);
  const [showThread, setShowThread] = useState(false);
  const { data: email, isLoading } = useEmailDetail(emailId);

  if (!emailId) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-400">
        <svg className="w-16 h-16 text-gray-200 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
        <p className="text-sm font-medium">Select an email to read</p>
        <p className="text-xs mt-1">Your inbox is ready</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!email) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400 text-sm">
        Email not found
      </div>
    );
  }

  if (showThread) {
    return <ThreadView threadId={email.threadId} onClose={() => setShowThread(false)} />;
  }

  const senderName = email.sender?.name || email.sender?.email || 'Unknown';

  return (
    <div className="flex flex-col h-full">
      {/* Navigation bar */}
      {(onPrevEmail || onNextEmail) && (
        <div className="flex items-center justify-between px-6 py-2 border-b border-gray-100 bg-gray-50 flex-shrink-0">
          <button
            onClick={onPrevEmail}
            disabled={!onPrevEmail}
            title="Previous email"
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-brand-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Newer
          </button>
          <button
            onClick={onNextEmail}
            disabled={!onNextEmail}
            title="Next email"
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-brand-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            Older
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}

      {/* Email header */}
      <div className="px-6 py-4 border-b border-gray-100 flex-shrink-0">
        <h2 className="text-lg font-semibold text-gray-900 mb-3 leading-tight">
          {email.subject || '(No Subject)'}
        </h2>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <Avatar name={senderName} size="md" />
            <div>
              <div className="font-medium text-gray-900 text-sm">{senderName}</div>
              <div className="text-xs text-gray-400">{email.sender?.email}</div>
              <div className="text-xs text-gray-400 mt-0.5">To: {email.to || email.receiver}</div>
            </div>
          </div>
          <div className="flex-shrink-0 text-right">
            <div className="text-xs text-gray-400">
              {email.date ? format(new Date(email.date), 'MMM d, yyyy h:mm a') : ''}
            </div>
            <EmailActionBar
            email={email}
            onReply={() => setShowReply(!showReply)}
            onAfterAction={onNextEmail || onPrevEmail}
          />
          </div>
        </div>
      </div>

      {/* Email body */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        <div
          className="email-body text-sm text-gray-700 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: sanitize(email.body) }}
        />

        {/* Thread link */}
        {email.threadId && (
          <button
            onClick={() => setShowThread(true)}
            className="mt-6 flex items-center gap-2 text-brand-500 hover:text-brand-700 text-sm font-medium"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            View full conversation
          </button>
        )}
      </div>

      {/* Reply panel */}
      {showReply && (
        <div className="border-t border-gray-200 flex-shrink-0">
          <ReplyPanel
            email={email}
            onClose={() => setShowReply(false)}
            onSent={() => setShowReply(false)}
          />
        </div>
      )}
    </div>
  );
}
