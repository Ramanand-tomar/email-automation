function getColor(name = '') {
  const colors = [
    'from-teal-400 to-teal-600',
    'from-amber-400 to-orange-500',
    'from-emerald-400 to-green-500',
    'from-slate-400 to-slate-600',
    'from-rose-400 to-red-500',
  ];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
}

export default function Avatar({ name = '', src, size = 'md', className = '' }) {
  const sizes = { sm: 'w-7 h-7 text-xs', md: 'w-9 h-9 text-sm', lg: 'w-11 h-11 text-base' };
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`${sizes[size]} rounded-full object-cover flex-shrink-0 ${className}`}
      />
    );
  }

  return (
    <div className={`${sizes[size]} rounded-full bg-gradient-to-br ${getColor(name)} flex items-center justify-center text-white font-semibold flex-shrink-0 ${className}`}>
      {initials || '?'}
    </div>
  );
}
