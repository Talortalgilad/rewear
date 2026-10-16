import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { Pin, Tape } from './Art';

// Handwritten paper note (Amatic SC, 24px+) with ruled lines; pinned or taped, a little crooked.
export function PaperNote({ text, from, pinned = false, tilt = -1.6, label }: { text: string; from?: string; pinned?: boolean; tilt?: number; label?: string }) {
  return (
    <div className="relative px-2 pt-4" style={{ transform: `rotate(${tilt}deg)` }} data-testid="paper-note">
      {pinned ? <Pin className="absolute left-1/2 top-0 z-10 h-7 w-7 -translate-x-1/2" /> : <Tape className="absolute left-1/2 top-0 z-10 -translate-x-1/2 rotate-[-3deg]" />}
      <div className="note-paper border border-[#E6D9B2] text-ink shadow-soft" data-testid="note-sheet">
        {label && <div className="text-ink-soft" data-row>{label}</div>}
        <p data-row>{text}</p>
        {from && <p className="text-end" data-row>— {from}</p>}
      </div>
    </div>
  );
}

// The note from the seller, unfolding over the screen when the parcel arrives.
export function NoteReveal({ text, onClose }: { text: string; onClose: () => void }) {
  const [open, setOpen] = useState(true);
  const close = () => { setOpen(false); setTimeout(onClose, 180); };
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center px-5" role="dialog" aria-modal="true" aria-label="פתק מהמוכר">
          <motion.div className="absolute inset-0 bg-ink/55" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={close} />
          <motion.div className="relative w-full max-w-[360px]" initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }} style={{ perspective: 900 }}>
            <p className="mb-3 text-center font-hand text-[38px] font-bold leading-none text-card">נמצא פתק בחבילה</p>
            <motion.div
              initial={{ rotateX: -80, scaleY: 0.35 }} animate={{ rotateX: 0, scaleY: 1 }} transition={{ duration: 0.8, delay: 0.25, ease: 'easeOut' }}
              style={{ transformOrigin: 'top center' }} className="relative"
            >
              <PaperNote text={text} pinned tilt={-1.5} />
              <motion.div aria-hidden className="pointer-events-none absolute inset-x-2 top-[34%] h-px bg-ink/25" initial={{ opacity: 1 }} animate={{ opacity: 0 }} transition={{ delay: 1.1 }} />
              <motion.div aria-hidden className="pointer-events-none absolute inset-x-2 top-[67%] h-px bg-ink/25" initial={{ opacity: 1 }} animate={{ opacity: 0 }} transition={{ delay: 1.1 }} />
            </motion.div>
            <button onClick={close} className="btn btn-primary mx-auto mt-5 flex min-w-[180px]"><X size={16} aria-hidden />סגור</button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
