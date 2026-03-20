const stats = [
  { value: '< 30s', label: 'To connect Gmail', sub: 'OAuth in seconds' },
  { value: 'Real-time', label: 'Email sync speed', sub: 'Via Google Pub/Sub' },
  { value: '5 tones', label: 'AI reply styles', sub: 'Professional to casual' },
  { value: '90 days', label: 'History sync', sub: 'Configurable window' },
];

export default function StatsSection() {
  return (
    <section className="py-16 bg-white border-y border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <div key={stat.value} className="text-center">
              <div className="text-3xl sm:text-4xl font-bold bg-clip-text text-transparent bg-hero-gradient mb-1">
                {stat.value}
              </div>
              <div className="font-semibold text-gray-800 text-sm">{stat.label}</div>
              <div className="text-gray-400 text-xs mt-0.5">{stat.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
