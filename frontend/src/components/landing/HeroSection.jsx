import { useState } from 'react';
import SyncPreferencesModal from './SyncPreferencesModal';

export default function HeroSection() {
  const [showSyncModal, setShowSyncModal] = useState(false);

  return (
    <>
    <SyncPreferencesModal isOpen={showSyncModal} onClose={() => setShowSyncModal(false)} />
    <section className="relative bg-hero-gradient overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          {/* Left: Text */}
          <div className="flex-1 text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white rounded-full px-4 py-1.5 text-sm font-medium mb-6">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              Powered by Google Gemini AI
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              Automate Your
              <span className="block text-accent-400"> Email Inbox</span>
              with AI
            </h1>

            <p className="text-white/80 text-lg sm:text-xl max-w-xl mb-8 leading-relaxed">
              BeyondChats connects to your Gmail and uses AI to draft replies, sync in real-time,
              and manage your inbox automatically — so you can focus on what matters.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button
                onClick={() => setShowSyncModal(true)}
                className="flex items-center justify-center gap-2 bg-white text-brand-600 hover:bg-gray-50 px-8 py-3.5 rounded-xl text-base font-semibold transition-all shadow-lg"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Try Live Demo
              </button>
              <a
                href="#how-it-works"
                className="flex items-center justify-center gap-2 bg-white/20 hover:bg-white/30 text-white px-8 py-3.5 rounded-xl text-base font-semibold transition-all backdrop-blur-sm"
              >
                See How It Works
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </a>
            </div>

            {/* Floating badges */}
            <div className="flex flex-wrap gap-3 mt-10 justify-center lg:justify-start">
              {['Real-time sync', 'AI-powered replies', 'Zero setup', 'Google OAuth'].map((badge) => (
                <span key={badge} className="bg-white/15 backdrop-blur-sm text-white/90 text-xs font-medium px-3 py-1.5 rounded-full border border-white/20">
                  ✓ {badge}
                </span>
              ))}
            </div>
          </div>

          {/* Right: Email client mockup */}
          <div className="flex-1 w-full max-w-xl">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl overflow-hidden">
              {/* Mockup header */}
              <div className="bg-white/10 px-4 py-3 flex items-center gap-2 border-b border-white/10">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <div className="flex-1 bg-white/10 rounded-md h-5 mx-2" />
              </div>
              {/* Mockup email list */}
              <div className="p-4 space-y-3">
                {[
                  { from: 'Sarah Johnson', subject: 'Q4 Report Review', time: '2m ago', unread: true },
                  { from: 'Dev Team', subject: 'New deployment ready', time: '15m ago', unread: true },
                  { from: 'BeyondChats AI', subject: 'Re: Meeting tomorrow', time: '1h ago', unread: false },
                  { from: 'Product Team', subject: 'Feature request updates', time: '3h ago', unread: false },
                ].map((email, i) => (
                  <div key={i} className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${i === 0 ? 'bg-white/20' : 'hover:bg-white/10'}`}>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-400 to-brand-400 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {email.from[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className={`text-sm ${email.unread ? 'text-white font-semibold' : 'text-white/70 font-medium'}`}>{email.from}</span>
                        <span className="text-xs text-white/50">{email.time}</span>
                      </div>
                      <p className={`text-xs truncate ${email.unread ? 'text-white/90' : 'text-white/50'}`}>{email.subject}</p>
                    </div>
                    {email.unread && <div className="w-2 h-2 bg-accent-400 rounded-full flex-shrink-0 mt-1" />}
                  </div>
                ))}
              </div>
              {/* AI badge */}
              <div className="px-4 pb-4">
                <div className="bg-white/10 rounded-lg p-3 border border-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-5 h-5 rounded-full bg-card-gradient flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <span className="text-xs text-white/70 font-medium">AI Reply Generated</span>
                  </div>
                  <p className="text-xs text-white/60 italic">"Thank you for reaching out! I'd be happy to review the Q4 report. Let's schedule a meeting for..."</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
    </>
  );
}
