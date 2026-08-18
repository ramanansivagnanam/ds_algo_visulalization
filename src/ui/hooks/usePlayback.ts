import React, { useState, useEffect, useCallback } from 'react';
import { PlaybackState } from '../../types/playback';

interface UsePlaybackOptions {
  totalSteps: number;
  autoPlay?: boolean;
  initialSpeed?: number;
  onStepChange?: (step: number) => void;
}

export function usePlayback({
  totalSteps,
  autoPlay = false,
  initialSpeed = 1,
  onStepChange,
}: UsePlaybackOptions) {
  const [currentStep, setCurrentStep] = useState(0);
  const [playbackState, setPlaybackState] = useState<PlaybackState>('stopped');
  const [speed, setSpeed] = useState(initialSpeed);

  const play = useCallback(() => {
    if (currentStep < totalSteps - 1) {
      setPlaybackState('playing' as PlaybackState);
    }
  }, [currentStep, totalSteps]);

  const pause = useCallback(() => {
    setPlaybackState('paused' as PlaybackState);
  }, []);

  const stop = useCallback(() => {
    setPlaybackState('stopped' as PlaybackState);
    setCurrentStep(0);
  }, []);

  const stepForward = useCallback(() => {
    if (currentStep < totalSteps - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      onStepChange?.(nextStep);
    }
  }, [currentStep, totalSteps, onStepChange]);

  const stepBackward = useCallback(() => {
    if (currentStep > 0) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      onStepChange?.(prevStep);
    }
  }, [currentStep, onStepChange]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    if (playbackState === ('playing' as PlaybackState)) {
      const delay = 1000 / speed;
      interval = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev >= totalSteps - 1) {
            setPlaybackState('stopped' as PlaybackState);
            return prev;
          }
          const nextStep = prev + 1;
          onStepChange?.(nextStep);
          return nextStep;
        });
      }, delay);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [playbackState, speed, totalSteps, onStepChange]);

  useEffect(() => {
    if (autoPlay && totalSteps > 0) {
      play();
    }
  }, [autoPlay, totalSteps, play]);

  return {
    currentStep,
    playbackState,
    speed,
    play,
    pause,
    stop,
    stepForward,
    stepBackward,
    setSpeed,
    setCurrentStep,
  };
}
