export type PlaybackStatus = 'idle' | 'playing' | 'paused' | 'stopped';
export type PlaybackState = PlaybackStatus;

export interface PlaybackInfo {
  status: PlaybackStatus;
  speed: number;
  currentStep: number;
  totalSteps: number;
}

export interface PlaybackActions {
  play: () => void;
  pause: () => void;
  stepForward: () => void;
  stepBackward: () => void;
  restart: () => void;
  setSpeed: (speed: number) => void;
  setTotalSteps: (total: number) => void;
}

export const SPEED_OPTIONS = [
  { label: '0.25×', value: 0.25 },
  { label: '0.5×', value: 0.5 },
  { label: '1×', value: 1 },
  { label: '2×', value: 2 },
  { label: '4×', value: 4 },
] as const;

export const DEFAULT_SPEED = 1;
export const MIN_SPEED = 0.25;
export const MAX_SPEED = 4;