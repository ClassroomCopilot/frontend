export interface Player {
  getCurrentTime(): number;
  destroy(): void;
}

export interface OnStateChangeEvent {
  data: number;
}

export interface PlayerState {
  PLAYING: number;
  PAUSED: number;
  ENDED: number;
}

export function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
} 