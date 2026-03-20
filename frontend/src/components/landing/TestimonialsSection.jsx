const testimonials = [
  {
    name: 'Priya Sharma',
    role: 'Head of Customer Success',
    company: 'TechFlow Inc.',
    avatar: 'PS',
    color: 'from-brand-400 to-brand-600',
    quote: 'BeyondChats cut my email response time in half. The AI replies are shockingly good — I barely need to edit them before sending.',
  },
  {
    name: 'Marcus Chen',
    role: 'Founder & CEO',
    company: 'Launchpad Studio',
    avatar: 'MC',
    color: 'from-accent-400 to-brand-500',
    quote: 'The real-time sync is a game changer. I get notified the instant an email arrives and the inbox is always up to date across devices.',
  },
  {
    name: 'Anika Patel',
    role: 'Senior Product Manager',
    company: 'CloudBase',
    avatar: 'AP',
    color: 'from-purple-400 to-pink-500',
    quote: 'Setup was literally 30 seconds — connect Gmail and you\'re done. The AI tone selector helps me match my voice perfectly every time.',
  },
];

export default function TestimonialsSection() {
  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-brand-500 font-semibold text-sm uppercase tracking-wider">Testimonials</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-2 mb-4">
            Loved by email power users
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t) => (
            <div key={t.name} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                ))}
              </div>

              <p className="text-gray-600 text-sm leading-relaxed mb-6 italic">"{t.quote}"</p>

              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}>
                  {t.avatar}
                </div>
                <div>
                  <div className="font-semibold text-gray-900 text-sm">{t.name}</div>
                  <div className="text-gray-400 text-xs">{t.role} · {t.company}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
