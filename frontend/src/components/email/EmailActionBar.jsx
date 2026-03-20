import { useModifyEmail, useDeleteEmail } from '../../hooks/useEmails';

export default function EmailActionBar({ email, onReply, onAfterAction }) {
  const { mutate: modify, isPending: isModifying } = useModifyEmail();
  const { mutate: remove, isPending: isDeleting } = useDeleteEmail();

  const isRead = email?.isRead;
  // MongoDB returns `messageId`; Gmail API fallback returns `id`
  const emailId = email?.messageId || email?.id;

  const actions = [
    {
      label: isRead ? 'Mark Unread' : 'Mark Read',
      title: isRead ? 'Mark as unread' : 'Mark as read',
      icon: isRead ? (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76" />
        </svg>
      ) : (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      action: () => modify({ id: emailId, action: isRead ? 'mark_unread' : 'mark_read' }),
      loading: isModifying,
    },
    {
      label: 'Archive',
      title: 'Archive email',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
        </svg>
      ),
      action: () => modify({ id: emailId, action: 'archive' }, { onSuccess: () => onAfterAction?.() }),
      loading: isModifying,
    },
    {
      label: 'Trash',
      title: 'Move to trash',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      ),
      action: () => remove(emailId, { onSuccess: () => onAfterAction?.() }),
      loading: isDeleting,
      danger: true,
    },
  ];

  return (
    <div className="flex items-center gap-1">
      {/* Reply button */}
      <button
        onClick={onReply}
        className="flex items-center gap-1.5 text-sm text-brand-600 hover:text-brand-700 bg-brand-50 hover:bg-brand-100 px-3 py-1.5 rounded-lg transition-colors font-medium"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
        </svg>
        Reply
      </button>

      <div className="h-5 w-px bg-gray-200 mx-1" />

      {actions.map((action) => (
        <button
          key={action.label}
          title={action.title}
          onClick={action.action}
          disabled={action.loading}
          className={`p-1.5 rounded-lg transition-colors disabled:opacity-50 ${
            action.danger
              ? 'text-gray-400 hover:text-red-500 hover:bg-red-50'
              : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
          }`}
        >
          {action.icon}
        </button>
      ))}
    </div>
  );
}
