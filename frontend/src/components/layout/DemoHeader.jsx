import Avatar from '../ui/Avatar';
import Spinner from '../ui/Spinner';
import { useAuth } from '../../hooks/useAuth';
import { useSyncEmails } from '../../hooks/useEmails';

export default function DemoHeader({ activeFolder }) {
  const { user } = useAuth();
  const { mutate: sync, isPending: isSyncing } = useSyncEmails();

  const folderNames = {
    inbox: 'Inbox',
    sent: 'Sent',
    archive: 'Archive',
    trash: 'Trash',
  };

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
      <h1 className="font-semibold text-gray-900 text-base">{folderNames[activeFolder] || 'Inbox'}</h1>

      <div className="flex items-center gap-3">
        <button
          onClick={() => sync()}
          disabled={isSyncing}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-brand-500 px-3 py-1.5 rounded-lg hover:bg-brand-50 transition-colors disabled:opacity-50"
        >
          {isSyncing ? <Spinner size="sm" /> : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          )}
          {isSyncing ? 'Syncing...' : 'Sync'}
        </button>

        {user && (
          <Avatar name={user.email} src={user.profileImage} size="sm" />
        )}
      </div>
    </div>
  );
}
