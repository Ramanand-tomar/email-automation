import { formatDistanceToNow, format, isToday, isThisYear } from 'date-fns';
import Avatar from '../ui/Avatar';

function formatDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isToday(date)) return formatDistanceToNow(date, { addSuffix: false }).replace('about ', '');
  if (isThisYear(date)) return format(date, 'MMM d');
  return format(date, 'MM/dd/yy');
}

export default function EmailListItem({ email, isSelected, onClick }) {
  const senderName = email.sender?.name || email.sender?.email || 'Unknown';

  return (
    <div
      onClick={onClick}
      className={`flex items-start gap-3 px-4 py-3 cursor-pointer border-b border-gray-100 transition-colors ${
        isSelected ? 'bg-brand-50 border-l-2 border-l-brand-500' : 'hover:bg-gray-50'
      }`}
    >
      {/* Unread dot */}
      <div className="flex-shrink-0 mt-1.5">
        {!email.isRead ? (
          <div className="w-2 h-2 bg-brand-500 rounded-full" />
        ) : (
          <div className="w-2 h-2" />
        )}
      </div>

      <Avatar name={senderName} size="sm" />

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <span className={`text-sm truncate ${!email.isRead ? 'text-gray-900 font-semibold' : 'text-gray-600 font-medium'}`}>
            {senderName}
          </span>
          <span className="text-xs text-gray-400 flex-shrink-0 ml-2">{formatDate(email.date)}</span>
        </div>
        <p className={`text-xs truncate mb-0.5 ${!email.isRead ? 'text-gray-800 font-medium' : 'text-gray-500'}`}>
          {email.subject || '(No subject)'}
        </p>
        <p className="text-xs text-gray-400 truncate">{email.snippet}</p>
      </div>
    </div>
  );
}
