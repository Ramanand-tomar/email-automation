import { useState, useRef, useEffect } from 'react';
import Spinner from '../ui/Spinner';
import { exportEmailsCsv } from '../../services/api';

const DAY_OPTIONS = [7, 30, 90, 365];
const DIRECTION_OPTIONS = [
  { value: 'both', label: 'Sent + Received' },
  { value: 'received', label: 'Received' },
  { value: 'sent', label: 'Sent' },
];

export default function ExportMenu() {
  const [open, setOpen] = useState(false);
  const [days, setDays] = useState(30);
  const [direction, setDirection] = useState('both');
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const handleExport = async () => {
    setLoading(true);
    try {
      await exportEmailsCsv({ days, direction });
      setOpen(false);
    } catch (err) {
      console.error('Export failed:', err);
      alert('Failed to export. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-brand-500 px-3 py-1.5 rounded-lg hover:bg-brand-50 transition-colors"
        title="Export emails as CSV"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        <span className="hidden sm:inline">Export</span>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-lg border border-gray-200 p-4 z-50">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Export emails as CSV</h3>

          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-600 mb-2">Date range</label>
            <div className="grid grid-cols-4 gap-1.5">
              {DAY_OPTIONS.map((d) => (
                <button
                  key={d}
                  onClick={() => setDays(d)}
                  className={`py-1.5 px-2 text-xs rounded-lg border transition-colors ${
                    days === d
                      ? 'bg-brand-50 border-brand-500 text-brand-700 font-medium'
                      : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {d}d
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-600 mb-2">Direction</label>
            <div className="space-y-1">
              {DIRECTION_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-50 cursor-pointer text-sm text-gray-700"
                >
                  <input
                    type="radio"
                    name="direction"
                    value={opt.value}
                    checked={direction === opt.value}
                    onChange={(e) => setDirection(e.target.value)}
                    className="text-brand-500 focus:ring-brand-500"
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>

          <button
            onClick={handleExport}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors disabled:opacity-60"
          >
            {loading ? (
              <>
                <Spinner size="sm" />
                Preparing CSV…
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                </svg>
                Download CSV
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
