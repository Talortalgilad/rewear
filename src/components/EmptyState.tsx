import { Link } from 'react-router-dom';
import { EmptyArt, type ArtKind } from './Art';

interface Cta { label: string; to?: string; onClick?: () => void }

export default function EmptyState({ art = 'hanger', text, title, cta }: { art?: ArtKind; text: string; title?: string; cta?: Cta }) {
  const cls = 'btn btn-primary mt-3 px-6 text-sm';
  return (
    <div className="flex flex-col items-center gap-2 px-6 py-12 text-center">
      <EmptyArt kind={art} />
      {title && <h2 className="mt-1 text-xl">{title}</h2>}
      <p className="max-w-[280px] text-sm text-ink-soft">{text}</p>
      {cta && (cta.to ? <Link to={cta.to} className={cls}>{cta.label}</Link> : <button onClick={cta.onClick} className={cls}>{cta.label}</button>)}
    </div>
  );
}
