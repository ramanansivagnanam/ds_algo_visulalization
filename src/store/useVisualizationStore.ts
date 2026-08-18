import { create } from 'zustand';
import type { StepEvent, DSState, PlaybackStatus } from '../types';
import { visualizationEngine } from '../engine';

interface VisualizationState {
  steps: StepEvent[];
  currentStepIndex: number;
  currentState: DSState | null;
  playbackStatus: PlaybackStatus;
  speed: number;
  totalSteps: number;

  play: () => void;
  pause: () => void;
  stepForward: () => void;
  stepBackward: () => void;
  restart: () => void;
  goToStep: (index: number) => void;
  setSpeed: (speed: number) => void;
  setSteps: (steps: StepEvent[]) => void;
  setCurrentStepIndex: (index: number) => void;
  setCurrentState: (state: DSState | null) => void;
}

export const useVisualizationStore = create<VisualizationState>((set, get) => ({
  steps: [],
  currentStepIndex: -1,
  currentState: null,
  playbackStatus: 'idle' as PlaybackStatus,
  speed: 1,
  totalSteps: 0,

  play: () => {
    visualizationEngine.play();
    set({ playbackStatus: visualizationEngine.playbackStatus });
  },

  pause: () => {
    visualizationEngine.pause();
    set({ playbackStatus: visualizationEngine.playbackStatus });
  },

  stepForward: () => {
    visualizationEngine.stepForward();
    const engine = visualizationEngine;
    set({
      currentStepIndex: engine.currentStepIndex,
      currentState: engine.currentState,
      playbackStatus: engine.playbackStatus,
    });
  },

  stepBackward: () => {
    visualizationEngine.stepBackward();
    const engine = visualizationEngine;
    set({
      currentStepIndex: engine.currentStepIndex,
      currentState: engine.currentState,
      playbackStatus: engine.playbackStatus,
    });
  },

  restart: () => {
    visualizationEngine.restart();
    const engine = visualizationEngine;
    set({
      currentStepIndex: engine.currentStepIndex,
      currentState: engine.currentState,
      playbackStatus: engine.playbackStatus,
    });
  },

  goToStep: (index: number) => {
    visualizationEngine.goToStep(index);
    const engine = visualizationEngine;
    set({
      currentStepIndex: engine.currentStepIndex,
      currentState: engine.currentState,
    });
  },

  setSpeed: (speed: number) => {
    visualizationEngine.setSpeed(speed);
    set({ speed: visualizationEngine.speed });
  },

  setSteps: (steps: StepEvent[]) => {
    set({ steps, totalSteps: steps.length });
  },

  setCurrentStepIndex: (index: number) => {
    set({ currentStepIndex: index });
  },

  setCurrentState: (state: DSState | null) => {
    set({ currentState: state });
  },
}));

// Subscribe to engine changes and sync to store
visualizationEngine.subscribe(() => {
  const engine = visualizationEngine;
  useVisualizationStore.setState({
    steps: engine.steps,
    currentStepIndex: engine.currentStepIndex,
    currentState: engine.currentState,
    playbackStatus: engine.playbackStatus,
    speed: engine.speed,
    totalSteps: engine.totalSteps,
  });
});