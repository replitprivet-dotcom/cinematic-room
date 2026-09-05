import React from 'react';
import { X, Sparkles, Tv, Armchair, Coffee } from 'lucide-react';

interface NotesModalProps {
  onClose: () => void;
  onOpenRemote: () => void;
}

export const NotesModal: React.FC<NotesModalProps> = ({ onClose, onOpenRemote }) => {
  return (
    <div
      id="notes-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        id="room-note-card"
        className="w-full max-w-sm rounded-3xl bg-neutral-900/95 border border-white/15 p-6 shadow-2xl text-white select-none backdrop-blur-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
          <div className="flex items-center gap-2">
            <Coffee size={18} className="text-amber-400" />
            <span className="text-xs font-bold tracking-tight uppercase">Room Guest Note</span>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-neutral-300 transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        <div className="space-y-3 text-xs text-neutral-300">
          <p className="leading-relaxed">
            Welcome to your private cinematic room. The coffee table has your TV remote ready, and the
            sectional sofa is all yours.
          </p>
          <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1.5 text-[11px]">
            <div className="flex items-center justify-between">
              <span className="text-neutral-400">Display:</span>
              <span className="text-emerald-400 font-mono">85" OLED 4K HDR</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-neutral-400">Audio:</span>
              <span className="text-amber-400 font-mono">Dolby Cinema Surround</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-neutral-400">Lighting:</span>
              <span className="text-purple-400 font-mono">Smart Dimmable Ambilight</span>
            </div>
          </div>
        </div>

        <div className="mt-5 flex items-center gap-2">
          <button
            onClick={() => {
              onClose();
              onOpenRemote();
            }}
            className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs transition-colors shadow-lg text-center"
          >
            Pick Up Remote
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
