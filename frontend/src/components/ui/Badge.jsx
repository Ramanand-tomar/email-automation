export default function Badge({ count, className = '' }) {
  if (!count) return null;
  return (
    <span className={`inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-xs font-bold bg-brand-500 text-white rounded-full ${className}`}>
      {count > 99 ? '99+' : count}
    </span>
  );
}
