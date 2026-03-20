export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-hero-gradient flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <span className="text-white font-bold text-lg">BeyondChats</span>
              <p className="text-xs text-gray-500">AI-powered email automation</p>
            </div>
          </div>

          {/* Links */}
          <div className="flex gap-6 text-sm">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
            <a href="#demo" className="hover:text-white transition-colors">Live Demo</a>
          </div>

          {/* Powered by */}
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>Powered by</span>
            <span className="bg-gradient-to-r from-brand-400 to-accent-400 bg-clip-text text-transparent font-semibold">BeyondChats</span>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-6 text-center text-xs text-gray-600">
          © {new Date().getFullYear()} BeyondChats. All rights reserved. Built with React + Node.js + Gmail API.
        </div>
      </div>
    </footer>
  );
}
