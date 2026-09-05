import React from 'react';
import {
  X,
  Power,
  Volume2,
  VolumeX,
  Volume1,
  ChevronUp,
  ChevronDown,
  Maximize2,
  Tv,
  Palette,
  Radio,
} from 'lucide-react';
import { TVChannel } from '../types';
import { CHANNELS } from '../data/channels';
import { playRemoteClick } from '../utils/audio';

interface RemoteModalProps {
  tvPower: boolean;
  activeChannel: TVChannel;
  volume: number;
  isMuted: boolean;
  onClose: () => void;
  onTogglePower: () => void;
  onToggleMute: () => void;
  onVolumeChange: (vol: number) => void;
  onSelectChannel: (channel: TVChannel) => void;
  onWatchFullscreen: () => void;
}

export const RemoteModal: React.FC<RemoteModalProps> = ({
  tvPower,
  activeChannel,
  volume,
  isMuted,
  onClose,
  onTogglePower,
  onToggleMute,
  onVolumeChange,
  onSelectChannel,
  onWatchFullscreen,
}) => {
  const handlePower = () => {
    playRemoteClick();
    onTogglePower();
  };

  const handleChannelNext = () => {
    playRemoteClick();
    const curIdx = CHANNELS.findIndex((c) => c.id === activeChannel.id);
    const nextIdx = (curIdx + 1) % CHANNELS.length;
    onSelectChannel(CHANNELS[nextIdx]);
  };

  const handleChannelPrev = () => {
    playRemoteClick();
    const curIdx = CHANNELS.findIndex((c) => c.id === activeChannel.id);
    const prevIdx = (curIdx - 1 + CHANNELS.length) % CHANNELS.length;
    onSelectChannel(CHANNELS[prevIdx]);
  };

  const handleVolUp = () => {
    playRemoteClick();
    onVolumeChange(Math.min(1, volume + 0.1));
  };

  const handleVolDown = () => {
    playRemoteClick();
    onVolumeChange(Math.max(0, volume - 0.1));
  };

  return (
    <div
      id="remote-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        id="physical-remote-body"
        className="relative w-72 rounded-[36px] bg-gradient-to-b from-[#241f26] via-[#1a161c] to-[#120f14] border-2 border-white/20 p-5 shadow-[0_25px_60px_rgba(0,0,0,0.8)] text-white select-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Remote IR Emitter Glass at Top */}
        <div className="w-10 h-1.5 rounded-full bg-red-950/80 mx-auto -mt-2 mb-4 border border-red-500/30" />

        {/* TOP ROW: Power & Close */}
        <div className="flex items-center justify-between mb-5">
          <button
            onClick={handlePower}
            className={`w-11 h-11 rounded-full flex items-center justify-center border transition-all active:scale-95 shadow-md ${
              tvPower
                ? 'bg-red-600 text-white border-red-400 shadow-[0_0_12px_rgba(239,68,68,0.6)]'
                : 'bg-neutral-800 text-neutral-400 border-white/10'
            }`}
            title="TV Power"
          >
            <Power size={20} strokeWidth={2.5} />
          </button>

          <span className="text-[10px] font-mono tracking-widest text-neutral-400 uppercase">
            REMOTE CONTROL
          </span>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-neutral-300 flex items-center justify-center transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* STATUS SCREEN */}
        <div className="w-full rounded-xl bg-black/70 border border-white/10 p-3 mb-5 flex flex-col gap-1">
          <div className="flex items-center justify-between text-[10px] font-mono">
            <span className="text-neutral-400">TV DISPLAY</span>
            <span className={tvPower ? 'text-emerald-400' : 'text-red-400'}>
              {tvPower ? 'CONNECTED' : 'STANDBY'}
            </span>
          </div>
          <div className="text-xs font-bold text-amber-300 truncate">
            {tvPower ? activeChannel.title : 'Screen is Off'}
          </div>
          <div className="text-[10px] text-neutral-400 truncate">
            {tvPower ? activeChannel.genre : 'Press power button to turn on'}
          </div>
        </div>

        {/* ROCKERS: Channel & Volume */}
        <div className="grid grid-cols-2 gap-4 mb-5">
          {/* VOL Rocker */}
          <div className="flex flex-col items-center gap-1.5 p-2 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-[9px] font-mono text-neutral-400">VOL</span>
            <button
              onClick={handleVolUp}
              className="w-full py-2 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center active:scale-95 transition-all"
            >
              <ChevronUp size={18} />
            </button>
            <button
              onClick={() => {
                playRemoteClick();
                onToggleMute();
              }}
              className="w-full py-1 text-center text-[10px] font-mono text-neutral-300 hover:text-white"
            >
              {isMuted ? 'UNMUTE' : 'MUTE'}
            </button>
            <button
              onClick={handleVolDown}
              className="w-full py-2 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center active:scale-95 transition-all"
            >
              <ChevronDown size={18} />
            </button>
          </div>

          {/* CH Rocker */}
          <div className="flex flex-col items-center gap-1.5 p-2 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-[9px] font-mono text-neutral-400">CH</span>
            <button
              onClick={handleChannelNext}
              className="w-full py-2 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center active:scale-95 transition-all"
            >
              <ChevronUp size={18} />
            </button>
            <span className="text-[10px] font-mono text-amber-400">
              {CHANNELS.findIndex((c) => c.id === activeChannel.id) + 1}/{CHANNELS.length}
            </span>
            <button
              onClick={handleChannelPrev}
              className="w-full py-2 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center active:scale-95 transition-all"
            >
              <ChevronDown size={18} />
            </button>
          </div>
        </div>

        {/* DIRECT CHANNEL BUTTONS */}
        <div className="space-y-1.5 mb-5">
          <span className="text-[9px] font-mono text-neutral-400 block mb-1">CHANNELS</span>
          {CHANNELS.map((c) => (
            <button
              key={c.id}
              onClick={() => {
                playRemoteClick();
                onSelectChannel(c);
              }}
              className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs transition-all ${
                c.id === activeChannel.id
                  ? 'bg-amber-500/20 border border-amber-400 text-amber-300 font-semibold'
                  : 'bg-white/5 hover:bg-white/10 border border-white/5 text-neutral-300'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <span>{c.thumbnail}</span>
                <span className="truncate">{c.title}</span>
              </span>
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: c.cssColor }} />
            </button>
          ))}
        </div>

        {/* FULLSCREEN SHORTCUT BUTTON */}
        <button
          onClick={() => {
            playRemoteClick();
            onWatchFullscreen();
          }}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs tracking-tight transition-all active:scale-95 shadow-lg"
        >
          <Maximize2 size={16} />
          <span>Watch Fullscreen Cinema</span>
        </button>
      </div>
    </div>
  );
};
