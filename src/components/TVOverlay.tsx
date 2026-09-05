import React, { useEffect, useState } from 'react';
import {
  X,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  SkipForward,
  Film,
  Sparkles,
  ArrowLeft,
} from 'lucide-react';
import { TVChannel } from '../types';
import { CHANNELS } from '../data/channels';

interface TVOverlayProps {
  activeChannel: TVChannel;
  isPlaying: boolean;
  isMuted: boolean;
  volume: number;
  onClose: () => void;
  onTogglePlay: () => void;
  onToggleMute: () => void;
  onVolumeChange: (vol: number) => void;
  onSelectChannel: (channel: TVChannel) => void;
  videoElement: HTMLVideoElement | null;
}

export const TVOverlay: React.FC<TVOverlayProps> = ({
  activeChannel,
  isPlaying,
  isMuted,
  volume,
  onClose,
  onTogglePlay,
  onToggleMute,
  onVolumeChange,
  onSelectChannel,
  videoElement,
}) => {
  const [showControls, setShowControls] = useState(true);

  // Auto-hide controls after 3 seconds of inactivity
  useEffect(() => {
    let timer: NodeJS.Timeout;
    const resetTimer = () => {
      setShowControls(true);
      clearTimeout(timer);
      timer = setTimeout(() => setShowControls(false), 3500);
    };

    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('touchstart', resetTimer);
    resetTimer();

    return () => {
      clearTimeout(timer);
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('touchstart', resetTimer);
    };
  }, []);

  return (
    <section
      id="tv-fullscreen-theater"
      className="fixed inset-0 z-50 bg-[#070507] flex flex-col items-center justify-center overflow-hidden animate-in fade-in duration-200"
      aria-label="Cinema Theater Fullscreen"
    >
      {/* Dynamic Ambient Glow behind the theater screen */}
      <div
        className="absolute inset-0 pointer-events-none opacity-30 blur-3xl transition-all duration-700"
        style={{
          background: `radial-gradient(circle at center, ${activeChannel.cssColor} 0%, transparent 60%)`,
        }}
      />

      {/* TOP BAR */}
      <div
        className={`absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-4 sm:p-6 transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-semibold backdrop-blur-md transition-all active:scale-95"
          >
            <ArrowLeft size={16} />
            <span>Return to Room</span>
          </button>
          <div className="hidden sm:flex flex-col">
            <h1 className="text-white text-sm font-bold tracking-tight">{activeChannel.title}</h1>
            <span className="text-neutral-400 text-xs font-mono">{activeChannel.genre}</span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white flex items-center justify-center backdrop-blur-md transition-all active:scale-95"
          title="Close theater mode"
        >
          <X size={20} />
        </button>
      </div>

      {/* 16:9 CINEMATIC DISPLAY CONTAINER */}
      <div className="relative w-full max-w-5xl aspect-video max-h-[82vh] bg-black rounded-lg sm:rounded-2xl overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.9)] border border-white/10 flex items-center justify-center">
        {videoElement ? (
          <video
            src={activeChannel.videoUrl}
            autoPlay
            playsInline
            loop
            muted={isMuted}
            className="w-full h-full object-contain"
            onClick={onTogglePlay}
          />
        ) : (
          <div className="text-neutral-400 text-sm">Loading media stream...</div>
        )}

        {/* Ambient Film Grain & Vignette */}
        <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_100px_rgba(0,0,0,0.6)]" />

        {/* Center Play/Pause indicator on click */}
        <button
          onClick={onTogglePlay}
          className="absolute inset-0 flex items-center justify-center group cursor-pointer"
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          <div
            className={`w-16 h-16 rounded-full bg-black/60 border border-white/20 text-white flex items-center justify-center backdrop-blur-md transition-all transform ${
              showControls ? 'scale-100 opacity-90' : 'scale-75 opacity-0'
            }`}
          >
            {isPlaying ? <Pause size={28} /> : <Play size={28} className="ml-1" />}
          </div>
        </button>
      </div>

      {/* BOTTOM CONTROLS & CHANNEL SELECTOR */}
      <div
        className={`absolute bottom-0 left-0 right-0 z-20 p-4 sm:p-6 transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="max-w-4xl mx-auto flex flex-col gap-3">
          {/* Main Controls row */}
          <div className="flex items-center justify-between px-4 py-2.5 rounded-2xl bg-neutral-900/80 border border-white/15 backdrop-blur-xl shadow-2xl">
            <div className="flex items-center gap-3">
              <button
                onClick={onTogglePlay}
                className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
              </button>

              <button
                onClick={onToggleMute}
                className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <VolumeX size={18} className="text-red-400" /> : <Volume2 size={18} />}
              </button>

              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={isMuted ? 0 : volume}
                onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                className="w-20 sm:w-28 h-1.5 accent-amber-400 bg-white/20 rounded-lg cursor-pointer"
                title="Volume"
              />
            </div>

            <div className="flex items-center gap-2 text-xs text-white/80 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>LIVE FEED</span>
            </div>
          </div>

          {/* Quick Channel Badges */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {CHANNELS.map((channel) => (
              <button
                key={channel.id}
                onClick={() => onSelectChannel(channel)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs whitespace-nowrap transition-all ${
                  channel.id === activeChannel.id
                    ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-semibold'
                    : 'bg-black/50 border-white/10 text-neutral-300 hover:bg-white/10'
                }`}
              >
                <span>{channel.thumbnail}</span>
                <span>{channel.title}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
