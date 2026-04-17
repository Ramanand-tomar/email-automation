import { useState } from 'react';
import { getAuthUrl } from '../../services/api';
import toast from 'react-hot-toast';

const DAY_OPTIONS = [
  { value: '7', label: '7 days', sublabel: 'Last week' },
  { value: '15', label: '15 days', sublabel: 'Last 2 weeks' },
  { value: '30', label: '30 days', sublabel: 'Last month' },
  { value: '60', label: '60 days', sublabel: 'Last 2 months' },
  { value: '90', label: '90 days', sublabel: 'Last 3 months' },
  { value: 'everything', label: 'All time', sublabel: 'Full history' },
];

const CATEGORY_OPTIONS = [
  { value: 'primary', label: 'Primary', icon: '📧', desc: 'Personal messages' },
  { value: 'promotions', label: 'Promotions', icon: '🏷️', desc: 'Deals & offers' },
  { value: 'social', label: 'Social', icon: '👥', desc: 'Social networks' },
  { value: 'updates', label: 'Updates', icon: '🔔', desc: 'Notifications' },
  { value: 'forums', label: 'Forums', icon: '💬', desc: 'Mailing lists' },
];

export default function SyncPreferencesModal({ isOpen, onClose }) {
  const [syncPeriod, setSyncPeriod] = useState('7');
  const [categories, setCategories] = useState(['primary', 'promotions', 'social', 'updates', 'forums']);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const toggleCategory = (value) => {
    setCategories(prev =>
      prev.includes(value)
        ? prev.filter(c => c !== value)
        : [...prev, value]
    );
  };

  const handleConnect = async () => {
    if (categories.length === 0) {
      toast.error('Please select at least one inbox category');
      return;
    }
    setLoading(true);
    try {
      const returnUrl = `${window.location.origin}/oauth-callback`;
      const res = await getAuthUrl(returnUrl, syncPeriod, categories.join(','));
      window.location.href = res.data.url;
    } catch {
      toast.error('Failed to start authentication. Is the backend running?');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
        {/* Header */}
        <div className="bg-hero-gradient px-5 py-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-white font-bold text-sm">Sync Preferences</h2>
                <p className="text-white/70 text-[11px]">Customize what gets imported</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/60 hover:text-white transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="px-5 py-4 space-y-4">
          {/* Sync Period */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-3.5 h-3.5 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <h3 className="text-xs font-semibold text-gray-800">How far back to sync?</h3>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {DAY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setSyncPeriod(opt.value)}
                  className={`flex flex-col items-center px-1.5 py-1.5 rounded-lg border-2 text-center transition-all ${
                    syncPeriod === opt.value
                      ? 'border-brand-500 bg-brand-50 text-brand-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-600'
                  }`}
                >
                  <span className={`text-xs font-semibold ${syncPeriod === opt.value ? 'text-brand-700' : 'text-gray-700'}`}>
                    {opt.label}
                  </span>
                  <span className={`text-[10px] ${syncPeriod === opt.value ? 'text-brand-500' : 'text-gray-400'}`}>
                    {opt.sublabel}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Inbox Categories */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <svg className="w-3.5 h-3.5 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
                <h3 className="text-xs font-semibold text-gray-800">Which inboxes to sync?</h3>
              </div>
              <button
                onClick={() =>
                  categories.length === CATEGORY_OPTIONS.length
                    ? setCategories([])
                    : setCategories(CATEGORY_OPTIONS.map(c => c.value))
                }
                className="text-[11px] text-brand-500 hover:text-brand-700 font-medium"
              >
                {categories.length === CATEGORY_OPTIONS.length ? 'Deselect all' : 'Select all'}
              </button>
            </div>
            <div className="space-y-1.5">
              {CATEGORY_OPTIONS.map((cat) => {
                const selected = categories.includes(cat.value);
                return (
                  <button
                    key={cat.value}
                    onClick={() => toggleCategory(cat.value)}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg border-2 transition-all text-left ${
                      selected
                        ? 'border-brand-500 bg-brand-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                      selected ? 'bg-brand-500 border-brand-500' : 'border-gray-300'
                    }`}>
                      {selected && (
                        <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className="text-sm">{cat.icon}</span>
                    <div className="flex-1 min-w-0">
                      <span className={`text-xs font-medium ${selected ? 'text-brand-700' : 'text-gray-700'}`}>
                        {cat.label}
                      </span>
                      <span className="text-[11px] text-gray-400 ml-1.5">{cat.desc}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 pb-4">
          <button
            onClick={handleConnect}
            disabled={loading || categories.length === 0}
            className="w-full flex items-center justify-center gap-2 bg-white border-2 border-gray-200 hover:border-brand-300 hover:bg-brand-50 text-gray-700 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-gray-300 border-t-brand-500 rounded-full animate-spin" />
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
            )}
            {loading ? 'Redirecting to Google...' : 'Connect Gmail'}
          </button>
          <p className="text-[11px] text-gray-400 text-center mt-2">
            You can change these settings later in your account
          </p>
        </div>
      </div>
    </div>
  );
}
