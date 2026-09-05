export type InteractionTarget = 'sofa' | 'tv' | 'tv-far' | 'switch' | 'alarm' | 'remote' | 'speakers' | null;

export type LightingMode = 'cinema' | 'cozy' | 'neon' | 'off';

export interface TVChannel {
  id: string;
  title: string;
  genre: string;
  videoUrl: string;
  thumbnail: string;
  ambientColor: number; // Hex color for TV backlight
  cssColor: string;
}

export interface RoomSettings {
  lightingMode: LightingMode;
  tvPower: boolean;
  tvVolume: number;
  tvMuted: boolean;
  activeChannelIndex: number;
  isSitting: boolean;
  soundscapeEnabled: boolean;
  alarmActive: boolean;
}
