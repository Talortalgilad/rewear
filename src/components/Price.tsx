// Big serif number with a small shekel sign beside it.
export default function Price({ value, className = '', sign = 'text-[0.62em]' }: { value: number; className?: string; sign?: string }) {
  return (
    <span dir="ltr" className={`inline-flex items-baseline gap-0.5 font-display font-black leading-none ${className}`}>
      <span className={`${sign} font-bold`}>₪</span>{value.toLocaleString('he-IL')}
    </span>
  );
}
