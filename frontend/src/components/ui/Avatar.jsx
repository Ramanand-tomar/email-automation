function getColor(name = '') {
  const colors = [
    'from-brand-400 to-brand-600',
    'from-accent-400 to-brand-500',
    'from-purple-400 to-pink-500',
    'from-green-400 to-teal-500',
    'from-orange-400 to-red-500',
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
