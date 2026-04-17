import { useState } from 'react';
import { useEmailList } from '../../hooks/useEmails';
import EmailListItem from './EmailListItem';
import Spinner from '../ui/Spinner';

function SkeletonRow() {
  return (
    <div className="flex items-start gap-3 px-4 py-3 border-b border-gray-100 animate-pulse">
      <div className="w-2 h-2 mt-1.5 bg-gray-200 rounded-full flex-shrink-0" />
      <div className="w-9 h-9 bg-gray-200 rounded-full flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="flex justify-between">
          <div className="h-3 bg-gray-200 rounded w-28" />
          <div className="h-3 bg-gray-200 rounded w-10" />
        </div>
        <div className="h-3 bg-gray-200 rounded w-40" />
        <div className="h-3 bg-gray-200 rounded w-56" />
      </div>
    </div>
  );
}

export default function EmailList({ folder, selectedEmailId, onSelectEmail }) {
  const [page, setPage] = useState(1);
  const [newEmailsBanner, setNewEmailsBanner] = useState(0);
  const { data, isLoading, isFetching, refetch } = useEmailList(folder, page);

  const emails = data?.emails || [];
  const pagination = data?.pagination;

  if (isLoading) {
    return (
      <div>
        {[...Array(8)].map((_, i) => <SkeletonRow key={i} />)}
      </div>
    );
  }

  if (!isLoading && emails.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-20 px-6 text-center">
        <div className="w-16 h-16 bg-brand-50 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-brand-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        </div>
        <p className="text-gray-500 font-medium">No emails here</p>
        <p className="text-gray-400 text-sm mt-1">Emails will appear once synced from Gmail</p>
        {isFetching && (
          <div className="flex items-center gap-2 mt-4 text-brand-500 text-sm">
            <Spinner size="sm" /> Syncing inbox...
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* New emails banner */}
      {newEmailsBanner > 0 && (
        <div
          className="bg-brand-50 border-b border-brand-200 px-4 py-2 flex items-center justify-between cursor-pointer hover:bg-brand-100 transition-colors"
          onClick={() => { refetch(); setNewEmailsBanner(0); setPage(1); }}
        >
          <span className="text-brand-700 text-xs font-medium">
            {newEmailsBanner} new email{newEmailsBanner !== 1 ? 's' : ''} — Click to refresh
          </span>
          <svg className="w-4 h-4 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </div>
      )}

      {/* Email list */}
      <div className="flex-1 overflow-y-auto">
        {emails.map((email) => {
          // MongoDB returns `messageId`; Gmail API fallback returns `id`
          const emailId = email.messageId || email.id;
          return (
            <EmailListItem
              key={emailId}
              email={email}
              isSelected={selectedEmailId === emailId}
              onClick={() => onSelectEmail(email)}
            />
          );
        })}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-white flex-shrink-0">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page <= 1 || isFetching}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-brand-500 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Prev
          </button>
          <span className="text-xs text-gray-400">
            Page {page} of {pagination.totalPages}
          </span>
          <button
            onClick={() => setPage(p => p + 1)}
            disabled={!pagination.hasNextPage || isFetching}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-brand-500 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Next
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
