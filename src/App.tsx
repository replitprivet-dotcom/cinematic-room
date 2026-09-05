import React, { useState, useRef, useEffect, useCallback } from 'react';
import { RoomCanvas } from './components/RoomCanvas';
import { HUD } from './components/HUD';
import { TVOverlay } from './components/TVOverlay';
import { RemoteModal } from './components/RemoteModal';
import { SettingsModal } from './components/SettingsModal';
import { NotesModal } from './components/NotesModal';
import { InteractionTarget, LightingMode, TVChannel } from './types';
import { CHANNELS } from './data/channels';
import {
  playSwitchClick,
  playRemoteClick,
  playSitSound,
  startAlarmAudio,
  stopAlarmAudio,
  toggleRoomAmbience,
} from './utils/audio';

export default function App() {
  const [ready, setReady] = useState(false);
  const [lightingMode, setLightingMode] = useState<LightingMode>('cinema');
  const [isSitting, setIsSitting] = useState(false);
  const [tvPower, setTvPower] = useState(true);
  const [activeChannel, setActiveChannel] = useState<TVChannel>(CHANNELS[0]);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [volume, setVolume] = useState(0.75);
  const [alarmActive, setAlarmActive] = useState(false);
  const [soundscapeEnabled, setSoundscapeEnabled] = useState(false);
  const [target, setTarget] = useState<InteractionTarget>(null);

  // Modals
  const [showQuickMenu, setShowQuickMenu] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showRemote, setShowRemote] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [showTvOverlay, setShowTvOverlay] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const [resetCount, setResetCount] = useState(0);

  // Smooth initial loading reveal
  useEffect(() => {
    const timer = setTimeout(() => setReady(true), 400);
    return () => clearTimeout(timer);
  }, []);

  // Autoplay video setup
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = isMuted ? 0 : volume;
      if (isPlaying && tvPower) {
        videoRef.current.play().catch(() => {
          // Autoplay fallback if browser blocks audio
          if (videoRef.current) {
            videoRef.current.muted = true;
            setIsMuted(true);
            videoRef.current.play().catch(() => {});
          }
        });
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying, tvPower, activeChannel, isMuted, volume]);

  // Handle light mode cycling
  const cycleLighting = useCallback(() => {
    playSwitchClick();
    setLightingMode((prev) => {
      if (prev === 'cinema') return 'cozy';
      if (prev === 'cozy') return 'neon';
      if (prev === 'neon') return 'off';
      return 'cinema';
    });
  }, []);

  // Handle Sit / Stand
  const toggleSit = useCallback(() => {
    playSitSound();
    setIsSitting((prev) => !prev);
  }, []);

  // Handle Alarm
  const toggleAlarm = useCallback(() => {
    setAlarmActive((prev) => {
      const next = !prev;
      if (next) {
        startAlarmAudio();
      } else {
        stopAlarmAudio();
      }
      return next;
    });
  }, []);

  // Handle TV Power
  const toggleTvPower = useCallback(() => {
    playRemoteClick();
    setTvPower((prev) => !prev);
  }, []);

  // Handle Soundscape
  const toggleSoundscape = useCallback(() => {
    setSoundscapeEnabled((prev) => {
      const next = !prev;
      toggleRoomAmbience(next);
      return next;
    });
  }, []);

  // Reset Room
  const resetRoom = useCallback(() => {
    stopAlarmAudio();
    setAlarmActive(false);
    setIsSitting(false);
    setLightingMode('cinema');
    setShowQuickMenu(false);
    setShowSettings(false);
    setShowRemote(false);
    setShowNotes(false);
    setShowTvOverlay(false);
    setResetCount((c) => c + 1);
  }, []);

  // Primary Interaction handler (E key / tap on screen)
  const handleInteract = useCallback(() => {
    if (!target) return;

    if (target === 'tv') {
      setShowTvOverlay(true);
    } else if (target === 'sofa') {
      toggleSit();
    } else if (target === 'switch') {
      cycleLighting();
    } else if (target === 'remote') {
      playRemoteClick();
      setShowRemote(true);
    } else if (target === 'alarm') {
      toggleAlarm();
    } else if (target === 'speakers') {
      toggleSoundscape();
    }
  }, [target, toggleSit, cycleLighting, toggleAlarm, toggleSoundscape]);

  return (
    <main
      id="cinematic-room-app"
      className="relative w-full h-screen h-[100dvh] overflow-hidden bg-[#0e0b0d] select-none"
    >
      {/* Hidden Master Video Element serving Three.js VideoTexture */}
      <video
        ref={videoRef}
        id="master-room-video"
        src={activeChannel.videoUrl}
        autoPlay
        playsInline
        loop
        muted={isMuted}
        crossOrigin="anonymous"
        className="fixed -top-96 -left-96 w-1 h-1 opacity-0 pointer-events-none"
      />

      {/* 3D WebGL Three.js Room */}
      <RoomCanvas
        key={resetCount}
        lightingMode={lightingMode}
        isSitting={isSitting}
        tvPower={tvPower}
        activeChannel={activeChannel}
        alarmActive={alarmActive}
        videoRef={videoRef}
        onTargetChange={setTarget}
        onInteract={handleInteract}
      />

      {/* Heads-Up Display (Top bar, Crosshair, Mobile Controls) */}
      <HUD
        target={target}
        isSitting={isSitting}
        lightingMode={lightingMode}
        tvPower={tvPower}
        soundscapeEnabled={soundscapeEnabled}
        alarmActive={alarmActive}
        activeChannel={activeChannel}
        showQuickMenu={showQuickMenu}
        showSettings={showSettings}
        onResetRoom={resetRoom}
        onInteract={handleInteract}
        onToggleSit={toggleSit}
        onCycleLighting={cycleLighting}
        onToggleTvPower={toggleTvPower}
        onToggleQuickMenu={() => setShowQuickMenu((prev) => !prev)}
        onToggleSettings={() => setShowSettings((prev) => !prev)}
        onOpenRemote={() => setShowRemote(true)}
      />

      {/* FULLSCREEN TV THEATER MODE */}
      {showTvOverlay && (
        <TVOverlay
          activeChannel={activeChannel}
          isPlaying={isPlaying}
          isMuted={isMuted}
          volume={volume}
          onClose={() => setShowTvOverlay(false)}
          onTogglePlay={() => setIsPlaying((p) => !p)}
          onToggleMute={() => setIsMuted((m) => !m)}
          onVolumeChange={(v) => {
            setVolume(v);
            setIsMuted(false);
          }}
          onSelectChannel={(ch) => setActiveChannel(ch)}
          videoElement={videoRef.current}
        />
      )}

      {/* TV REMOTE CONTROLLER MODAL */}
      {showRemote && (
        <RemoteModal
          tvPower={tvPower}
          activeChannel={activeChannel}
          volume={volume}
          isMuted={isMuted}
          onClose={() => setShowRemote(false)}
          onTogglePower={toggleTvPower}
          onToggleMute={() => setIsMuted((m) => !m)}
          onVolumeChange={(v) => {
            setVolume(v);
            setIsMuted(false);
          }}
          onSelectChannel={(ch) => setActiveChannel(ch)}
          onWatchFullscreen={() => {
            setShowRemote(false);
            setShowTvOverlay(true);
          }}
        />
      )}

      {/* SETTINGS / AMBIANCE MODAL */}
      {showSettings && (
        <SettingsModal
          lightingMode={lightingMode}
          isSitting={isSitting}
          soundscapeEnabled={soundscapeEnabled}
          alarmActive={alarmActive}
          activeChannel={activeChannel}
          onClose={() => setShowSettings(false)}
          onSetLightingMode={(m) => {
            playSwitchClick();
            setLightingMode(m);
          }}
          onToggleSit={toggleSit}
          onToggleSoundscape={toggleSoundscape}
          onToggleAlarm={toggleAlarm}
          onResetRoom={resetRoom}
        />
      )}

      {/* NOTES MODAL */}
      {showNotes && (
        <NotesModal
          onClose={() => setShowNotes(false)}
          onOpenRemote={() => setShowRemote(true)}
        />
      )}

      {/* LOADING SCREEN OVERLAY */}
      <div
        id="room-loading-screen"
        className={`absolute inset-0 z-50 bg-[#0e0b0d] flex flex-col items-center justify-center transition-opacity duration-500 pointer-events-none ${
          ready ? 'opacity-0' : 'opacity-100'
        }`}
      >
        <div className="flex flex-col items-center gap-3 text-white">
          <div className="w-12 h-12 rounded-full border-2 border-amber-400/40 border-t-amber-400 animate-spin" />
          <span className="text-sm font-bold tracking-wider uppercase text-amber-200/90 font-mono">
            Entering Cinematic Room
          </span>
          <span className="text-[11px] text-neutral-400">Loading 3D Theater & Acoustics...</span>
        </div>
      </div>
    </main>
  );
}
