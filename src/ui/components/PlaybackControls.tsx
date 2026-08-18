import React from 'react';
import { PlaybackState } from '../../types/playback';

interface PlaybackControlsProps {
  playbackState: PlaybackState;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  onStepForward: () => void;
  onStepBackward: () => void;
  speed: number;
  onSpeedChange: (speed: number) => void;
  currentStep: number;
  totalSteps: number;
}

export const PlaybackControls: React.FC<PlaybackControlsProps> = ({
  playbackState,
  onPlay,
  onPause,
  onStop,
  onStepForward,
  onStepBackward,
  speed,
  onSpeedChange,
  currentStep,
  totalSteps,
}) => {
  const isPlaying = playbackState === 'playing';

  return (
    <div className="playback-controls">
      <button onClick={onStepBackward} disabled={currentStep === 0}>
        ⏮ Prev
      </button>
      <button onClick={onStepForward} disabled={currentStep >= totalSteps - 1}>
        Next ⏭
      </button>
      <button onClick={isPlaying ? onPause : onPlay}>
        {isPlaying ? '⏸ Pause' : '▶ Play'}
      </button>
      <button onClick={onStop}>⏹ Stop</button>
      <div className="speed-control">
        <label>Speed: {speed}x</label>
        <input
          type="range"
          min="0.5"
          max="3"
          step="0.5"
          value={speed}
          onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
        />
      </div>
      <div className="step-indicator">
        Step {currentStep + 1} of {totalSteps}
      </div>
    </div>
  );
};
