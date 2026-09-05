import React from 'react';
import {
  X,
  ChevronDown,
  MoreVertical,
  ArrowLeft,
  Tv,
  Armchair,
  Lightbulb,
  Bell,
  Volume2,
  VolumeX,
  Sparkles,
  Radio,
  SlidersHorizontal,
} from 'lucide-react';
import { InteractionTarget, LightingMode, TVChannel } from '../types';

interface HUDProps {
  target: InteractionTarget;
  isSitting: boolean;
  lightingMode: LightingMode;
  tvPower: boolean;
  soundscapeEnabled: boolean;
  alarmActive: boolean;
  activeChannel: TVChannel;
  showQuickMenu: boolean;
  showSettings: boolean;
  onResetRoom: () => void;
  onInteract: () => void;
  onToggleSit: () => void;
  onCycleLighting: () => void;
  onToggleTvPower: () => void;
  onToggleQuickMenu: () => void;
  onToggleSettings: () => void;
  onOpenRemote: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  target,
  isSitting,
  lightingMode,
  tvPower,
  soundscapeEnabled,
  alarmActive,
  activeChannel,
  showQuickMenu,
  showSettings,
  onResetRoom,
  onInteract,
  onToggleSit,
  onCycleLighting,
  onToggleTvPower,
  onToggleQuickMenu,
  onToggleSettings,
  onOpenRemote,
}) => {
  // Determine tooltip label
  let targetLabel = '';
  if (target === 'tv') {
    targetLabel = 'Watch Fullscreen Cinema (E)';
  } else if (target === 'tv-far') {
    targetLabel = 'Walk closer to watch fullscreen';
  } else if (target === 'sofa') {
    targetLabel = isSitting ? 'Stand Up (E)' : 'Sit Down on Sofa (E)';
  } else if (target === 'remote') {
    targetLabel = 'Pick Up TV Remote (E)';
  } else if (target === 'switch') {
    targetLabel = `Wall Switch: ${lightingMode.toUpperCase()} Mode (E)`;
  } else if (target === 'alarm') {
    targetLabel = alarmActive ? 'Silence Alarm Siren (E)' : 'Trigger Emergency Siren (E)';
  } else if (target === 'speakers') {
    targetLabel = 'Surround Sound Audio (E)';
  }

  const isInteractive = Boolean(target && target !== 'tv-far');

  return (
    <>
      {/* TOP BAR */}
      <header
        id="room-top-header"
        className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-4 sm:px-6 py-4 pointer-events-none select-none"
      >
        {/* Left: Close / Reset Button */}
        <button
          id="btn-close-room"
          onClick={onResetRoom}
          className="pointer-events-auto inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/50 hover:bg-black/75 border border-white/15 text-white/90 text-xs font-semibold backdrop-blur-md transition-all shadow-lg active:scale-95"
          title="Reset room & position"
        >
          <X size={15} strokeWidth={2.4} />
          <span>Close</span>
        </button>

        {/* Center: "Your Room" Brand Pill */}
        <div
          id="brand-pill-room"
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/90 text-neutral-900 border border-white/40 shadow-xl backdrop-blur-sm"
        >
          <img
            src="/avatar.jpg"
            alt="Room Avatar"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
            className="w-6 h-6 rounded-full object-cover border border-black/20"
          />
          <span className="text-xs font-bold tracking-tight">Your Room</span>
        </div>

        {/* Right: Actions (Dropdown & More) */}
        <div className="flex items-center gap-2">
          <button
            id="btn-toggle-quick-menu"
            onClick={onToggleQuickMenu}
            className={`pointer-events-auto w-9 h-9 rounded-full flex items-center justify-center border transition-all backdrop-blur-md active:scale-95 shadow-lg ${
              showQuickMenu
                ? 'bg-amber-500/30 border-amber-400 text-amber-300'
                : 'bg-black/50 hover:bg-black/75 border-white/15 text-white/90'
            }`}
            title="Room Controls"
          >
            <ChevronDown size={18} />
          </button>

          <button
            id="btn-toggle-settings"
            onClick={onToggleSettings}
            className={`pointer-events-auto w-9 h-9 rounded-full flex items-center justify-center border transition-all backdrop-blur-md active:scale-95 shadow-lg ${
              showSettings
                ? 'bg-amber-500/30 border-amber-400 text-amber-300'
                : 'bg-black/50 hover:bg-black/75 border-white/15 text-white/90'
            }`}
            title="Ambiance & Settings"
          >
            <MoreVertical size={18} />
          </button>
        </div>
      </header>

      {/* QUICK CONTROLS DROPDOWN */}
      {showQuickMenu && (
        <div
          id="quick-controls-menu"
          className="absolute top-16 right-4 sm:right-6 z-40 w-72 rounded-2xl bg-neutral-900/90 border border-white/15 p-4 shadow-2xl backdrop-blur-xl text-neutral-200 text-xs animate-in fade-in zoom-in-95 duration-150"
        >
          <div className="flex items-center justify-between pb-2 border-b border-white/10 mb-3 font-semibold text-white">
            <span className="flex items-center gap-1.5">
              <Sparkles size={14} className="text-amber-400" />
              Room Controls
            </span>
            <span className="text-[10px] text-neutral-400 font-mono">CINEMA THEATER</span>
          </div>

          <div className="space-y-2">
            {/* Sit / Stand button */}
            <button
              onClick={onToggleSit}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
            >
              <span className="flex items-center gap-2">
                <Armchair size={15} className="text-purple-400" />
                {isSitting ? 'Stand Up' : 'Sit on Cozy Couch'}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-white/80">
                {isSitting ? 'SEATED' : 'STAND'}
              </span>
            </button>

            {/* Lighting Mode */}
            <button
              onClick={onCycleLighting}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
            >
              <span className="flex items-center gap-2">
                <Lightbulb size={15} className="text-amber-400" />
                Lighting: {lightingMode.toUpperCase()}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">
                CYCLE
              </span>
            </button>

            {/* TV Power */}
            <button
              onClick={onToggleTvPower}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
            >
              <span className="flex items-center gap-2">
                <Tv size={15} className="text-cyan-400" />
                85" 4K TV ({activeChannel.title.slice(0, 14)}...)
              </span>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                  tvPower ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                }`}
              >
                {tvPower ? 'ON' : 'OFF'}
              </span>
            </button>

            {/* Remote Controller */}
            <button
              onClick={onOpenRemote}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
            >
              <span className="flex items-center gap-2">
                <Radio size={15} className="text-pink-400" />
                Open TV Remote
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-white/80">
                OPEN
              </span>
            </button>
          </div>
        </div>
      )}

      {/* RETICLE / CROSSHAIR IN CENTER */}
      <div
        id="center-reticle"
        aria-hidden="true"
        className={`pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-150 z-20 ${
          isInteractive
            ? 'w-4 h-4 bg-amber-300 border-2 border-amber-100 shadow-[0_0_12px_rgba(252,211,77,0.8)] scale-110'
            : target === 'tv-far'
            ? 'w-2.5 h-2.5 bg-cyan-300 border border-black/40 shadow-sm'
            : 'w-2 h-2 bg-white/85 border border-black/50 shadow-sm'
        }`}
      />

      {/* INTERACTION TOOLTIP */}
      {targetLabel && (
        <div
          id="interaction-tooltip"
          className="pointer-events-none absolute left-1/2 top-[calc(50%+22px)] -translate-x-1/2 z-20 px-3 py-1.5 rounded-xl bg-neutral-900/90 border border-white/20 text-neutral-100 text-xs font-medium tracking-tight shadow-2xl backdrop-blur-md whitespace-nowrap animate-in fade-in zoom-in-95 duration-100"
        >
          {targetLabel}
        </div>
      )}

      {/* DESKTOP CONTROLS HINT */}
      <div
        id="desktop-keys-hint"
        className="hidden sm:flex items-center gap-2 absolute left-6 bottom-6 z-20 pointer-events-none select-none text-[11px] text-white/60 font-mono"
      >
        <span className="bg-black/50 px-2 py-1 rounded border border-white/10 text-white/80">WASD</span>
        <span>Move</span>
        <span className="bg-black/50 px-2 py-1 rounded border border-white/10 text-white/80 ml-2">MOUSE</span>
        <span>Look</span>
        <span className="bg-black/50 px-2 py-1 rounded border border-white/10 text-white/80 ml-2">E</span>
        <span>Interact</span>
        <span className="bg-black/50 px-2 py-1 rounded border border-white/10 text-white/80 ml-2">SPACE</span>
        <span>Jump</span>
      </div>

      {/* MOBILE BOTTOM CONTROLS CLUSTER */}
      <div
        id="mobile-action-cluster"
        className="absolute right-5 bottom-6 z-30 flex flex-col items-end gap-3 pointer-events-none"
      >
        {/* Dynamic Context Action Button */}
        {isInteractive && (
          <button
            id="btn-context-interact"
            onClick={onInteract}
            className="pointer-events-auto w-14 h-14 rounded-2xl bg-amber-500/90 hover:bg-amber-400 text-neutral-950 font-bold border-2 border-amber-200 shadow-[0_0_20px_rgba(245,158,11,0.5)] flex items-center justify-center transition-transform active:scale-90 animate-bounce"
            title={targetLabel}
          >
            {target === 'tv' ? (
              <Tv size={24} />
            ) : target === 'sofa' ? (
              <Armchair size={24} />
            ) : target === 'switch' ? (
              <Lightbulb size={24} />
            ) : target === 'alarm' ? (
              <Bell size={24} />
            ) : (
              <Sparkles size={24} />
            )}
          </button>
        )}

        {/* Turn Back (180 deg) Button */}
        <button
          id="btn-turn-back"
          onClick={() => window.dispatchEvent(new Event('room-turn-back'))}
          className="pointer-events-auto w-12 h-12 rounded-xl bg-black/60 hover:bg-black/80 border border-white/20 text-white flex items-center justify-center backdrop-blur-md shadow-xl active:scale-95"
          title="Turn 180° around"
        >
          <ArrowLeft size={20} />
        </button>

        {/* Bottom row: Remote + JUMP */}
        <div className="flex items-center gap-2">
          <button
            id="btn-open-tv-remote"
            onClick={onOpenRemote}
            className="pointer-events-auto w-12 h-12 rounded-xl bg-black/60 hover:bg-black/80 border border-white/20 text-white flex items-center justify-center backdrop-blur-md shadow-xl active:scale-95"
            title="TV Remote & Channels"
          >
            <Radio size={19} />
          </button>

          <button
            id="btn-mobile-jump"
            onClick={() => window.dispatchEvent(new Event('room-jump'))}
            className="pointer-events-auto px-4 h-12 rounded-xl bg-black/60 hover:bg-black/80 border border-white/20 text-white text-xs font-mono font-bold tracking-wider flex items-center justify-center backdrop-blur-md shadow-xl active:scale-95"
            title="Jump"
          >
            JUMP
          </button>
        </div>
      </div>
    </>
  );
};
