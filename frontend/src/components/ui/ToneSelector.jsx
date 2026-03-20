const tones = [
  { value: 'professional', label: 'Professional' },
  { value: 'friendly', label: 'Friendly' },
  { value: 'concise', label: 'Concise' },
  { value: 'formal', label: 'Formal' },
  { value: 'casual', label: 'Casual' },
];

export default function ToneSelector({ selected, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {tones.map((tone) => (
        <button
          key={tone.value}
          type="button"
          onClick={() => onChange(tone.value)}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-all border ${
            selected === tone.value
              ? 'bg-brand-500 text-white border-brand-500'
              : 'bg-white text-gray-600 border-gray-200 hover:border-brand-300 hover:text-brand-500'
          }`}
        >
          {tone.label}
        </button>
      ))}
    </div>
  );
}
