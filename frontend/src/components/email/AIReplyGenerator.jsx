import { useState } from 'react';
import ToneSelector from '../ui/ToneSelector';
import Spinner from '../ui/Spinner';
import { generateAIReply } from '../../services/api';
import toast from 'react-hot-toast';

function htmlToPlainText(html) {
  if (!html) return '';
  return new DOMParser().parseFromString(html, 'text/html').body.textContent || '';
}

export default function AIReplyGenerator({ email, onReplyGenerated }) {
  const [tone, setTone] = useState('professional');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const emailContext = {
        senderName: email.sender?.name || email.sender?.email || 'Unknown',
        subject: email.subject || '',
        body: htmlToPlainText(email.body).slice(0, 2000),
      };
      const res = await generateAIReply(emailContext, tone);
      onReplyGenerated(res.data.reply);
      toast.success('AI reply generated!');
    } catch {
      toast.error('Failed to generate AI reply');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-brand-50 to-accent-50/30 border border-brand-100 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-6 h-6 rounded-full bg-hero-gradient flex items-center justify-center flex-shrink-0">
          <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <span className="text-sm font-semibold text-gray-800">Generate AI Reply</span>
        <span className="text-xs bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full font-medium">AI</span>
      </div>

      <div className="mb-3">
        <p className="text-xs text-gray-500 mb-2">Choose reply tone:</p>
        <ToneSelector selected={tone} onChange={setTone} />
      </div>

      <button
        onClick={handleGenerate}
        disabled={loading}
        className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-70 w-full justify-center"
      >
        {loading ? (
          <>
            <Spinner size="sm" />
            AI is drafting your reply...
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Generate Reply
          </>
        )}
      </button>
    </div>
  );
}
