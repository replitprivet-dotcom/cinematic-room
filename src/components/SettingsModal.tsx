import React from 'react';
import {
  X,
  Lightbulb,
  Armchair,
  Volume2,
  VolumeX,
  Bell,
  RefreshCw,
  Sparkles,
  Tv,
  HelpCircle,
} from 'lucide-react';
import { LightingMode, TVChannel } from '../types';

interface SettingsModalProps {
  lightingMode: LightingMode;
  isSitting: boolean;
  soundscapeEnabled: boolean;
  alarmActive: boolean;
  activeChannel: TVChannel;
  onClose: () => void;
  onSetLightingMode: (mode: LightingMode) => void;
  onToggleSit: () => void;
  onToggleSoundscape: () => void;
  onToggleAlarm: () => void;
  onResetRoom: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  lightingMode,
  isSitting,
  soundscapeEnabled,
  alarmActive,
  activeChannel,
  onClose,
  onSetLightingMode,
  onToggleSit,
  onToggleSoundscape,
  onToggleAlarm,
  onResetRoom,
}) => {
  return (
    <div
      id="settings-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/65 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        id="room-settings-dialog"
        className="w-full max-w-md rounded-3xl bg-neutral-900/95 border border-white/15 p-6 shadow-2xl text-white select-none backdrop-blur-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-300 flex items-center justify-center">
              <Sparkles size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight">Room Ambiance & Settings</h2>
              <p className="text-[11px] text-neutral-400">Personalize your cinematic experience</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-neutral-300 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4 text-xs">
          {/* LIGHTING MODES */}
          <div>
            <label className="text-neutral-400 font-medium mb-2 block">LIGHTING PRESET</label>
            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  { id: 'cinema', name: 'Cinema Theater', desc: 'Dim spots + TV bias glow', color: 'border-amber-500/50' },
                  { id: 'cozy', name: 'Cozy Warm', desc: 'Full recessed spotlights', color: 'border-yellow-500/50' },
                  { id: 'neon', name: 'Neon Cyberpunk', desc: 'Deep violet / cyan ambient', color: 'border-purple-500/50' },
                  { id: 'off', name: 'Blackout Pitch', desc: 'Complete darkness', color: 'border-neutral-700' },
                ] as const
              ).map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => onSetLightingMode(preset.id)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    lightingMode === preset.id
                      ? `bg-white/10 ${preset.color} text-white font-semibold shadow-md`
                      : 'bg-white/5 border-white/10 text-neutral-400 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-xs">
                    <Lightbulb size={13} className={lightingMode === preset.id ? 'text-amber-400' : ''} />
                    <span>{preset.name}</span>
                  </div>
                  <div className="text-[10px] text-neutral-400 mt-1">{preset.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* SITTING & AUDIO TOGGLES */}
          <div className="space-y-2 pt-2 border-t border-white/10">
            {/* Sit on Sofa */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-2.5">
                <Armchair size={16} className="text-purple-400" />
                <div>
                  <div className="font-semibold text-neutral-200">Sofa Seating</div>
                  <div className="text-[10px] text-neutral-400">Sweet-spot eye-level position</div>
                </div>
              </div>
              <button
                onClick={onToggleSit}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-colors ${
                  isSitting ? 'bg-purple-600 text-white' : 'bg-white/10 text-neutral-300'
                }`}
              >
                {isSitting ? 'SEATED' : 'STAND UP'}
              </button>
            </div>

            {/* Room Ambience Soundscape */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-2.5">
                <Volume2 size={16} className="text-cyan-400" />
                <div>
                  <div className="font-semibold text-neutral-200">Room Soundscape</div>
                  <div className="text-[10px] text-neutral-400">Subtle soothing room tone</div>
                </div>
              </div>
              <button
                onClick={onToggleSoundscape}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-colors ${
                  soundscapeEnabled ? 'bg-cyan-600 text-white' : 'bg-white/10 text-neutral-300'
                }`}
              >
                {soundscapeEnabled ? 'ACTIVE' : 'MUTED'}
              </button>
            </div>

            {/* Emergency Alarm Beacon */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-2.5">
                <Bell size={16} className="text-red-400" />
                <div>
                  <div className="font-semibold text-neutral-200">Emergency Siren</div>
                  <div className="text-[10px] text-neutral-400">Pulsing red beacon & audio</div>
                </div>
              </div>
              <button
                onClick={onToggleAlarm}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-colors ${
                  alarmActive ? 'bg-red-600 text-white animate-pulse' : 'bg-white/10 text-neutral-300'
                }`}
              >
                {alarmActive ? 'SIREN ON' : 'TEST'}
              </button>
            </div>
          </div>

          {/* RESET ROOM BUTTON */}
          <div className="pt-2 border-t border-white/10 flex items-center justify-between">
            <span className="text-[11px] text-neutral-400">Stuck or lost?</span>
            <button
              onClick={onResetRoom}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-neutral-200 text-xs transition-colors"
            >
              <RefreshCw size={13} />
              <span>Reset Position</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
