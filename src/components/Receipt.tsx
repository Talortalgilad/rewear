import type { ReactNode } from 'react';

export interface ReceiptLine { label: string; value: string }

// A shop receipt: monospace rows, dashed rule before the total, zigzag torn edge at the bottom.
export default function Receipt({ title = 'REWEAR · קבלה', lines, total, totalLabel = 'סה״כ', footer, children }: { title?: string; lines: ReceiptLine[]; total: string; totalLabel?: string; footer?: ReactNode; children?: ReactNode }) {
  return (
    <div style={{ filter: 'drop-shadow(0 1px 1px rgba(43,36,32,.3))' }}>
      <div className="receipt px-4 pb-6 pt-4 text-ink" data-testid="receipt">
        <div className="text-center text-[13px] font-bold tracking-[.2em]">{title}</div>
        <div className="mt-1 text-center text-[11px] text-ink-soft" dir="ltr">{new Date().toLocaleDateString('en-GB')}</div>
        <div className="my-2.5 border-t border-dashed border-ink/40" />
        <div className="space-y-1.5 text-[13px]">
          {lines.map((l) => <div key={l.label} className="flex justify-between gap-3"><span>{l.label}</span><span dir="ltr" className="font-bold">{l.value}</span></div>)}
        </div>
        <div className="my-2.5 border-t-2 border-dashed border-ink/60" />
        <div className="flex justify-between text-[17px] font-bold"><span>{totalLabel}</span><span dir="ltr">{total}</span></div>
        {children}
        {footer && <div className="mt-3 text-center text-[11px] text-ink-soft">{footer}</div>}
      </div>
    </div>
  );
}
