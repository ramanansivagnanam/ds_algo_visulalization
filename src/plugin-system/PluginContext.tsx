import { createContext, useContext, useCallback, useEffect, useRef, useState } from 'react';
import type { DataStructurePlugin, PlaybackStatus, DSState, StepEvent, SceneNode } from '../types';
import { pluginRegistry } from './PluginRegistry';
import { visualizationEngine } from '../engine';

interface PluginContextValue {
  // Plugin list
  plugins: DataStructurePlugin[];
  activePlugin: DataStructurePlugin | null;

  // Plugin selection
  selectPlugin: (id: string) => void;

  // State
  currentState: DSState | null;
  sceneNodes: SceneNode[];

  // Steps
  steps: StepEvent[];
  currentStepIndex: number;
  totalSteps: number;

  // Playback
  playbackStatus: PlaybackStatus;
  speed: number;
  play: () => void;
  pause: () => void;
  stepForward: () => void;
  stepBackward: () => void;
  restart: () => void;
  setSpeed: (speed: number) => void;
  goToStep: (index: number) => void;

  // Operations
  executeOperation: (operationId: string, params: Record<string, unknown>) => void;
}

const PluginContext = createContext<PluginContextValue | null>(null);

export function PluginProvider({ children }: { children: React.ReactNode }) {
  const [activePlugin, setActivePlugin] = useState<DataStructurePlugin | null>(null);
  const [, forceUpdate] = useState(0);
  const engineRef = useRef(visualizationEngine);

  const rerender = useCallback(() => forceUpdate((n) => n + 1), []);

  useEffect(() => {
    const unsub = engineRef.current.subscribe(rerender);
    return unsub;
  }, [rerender]);

  const selectPlugin = useCallback((id: string) => {
    const plugin = pluginRegistry.get(id);
    if (plugin) {
      setActivePlugin(plugin);
      engineRef.current.loadPlugin(plugin);
    }
  }, []);

  const value: PluginContextValue = {
    plugins: pluginRegistry.getAll(),
    activePlugin,
    selectPlugin,
    currentState: engineRef.current.currentState,
    sceneNodes: [],
    steps: engineRef.current.steps,
    currentStepIndex: engineRef.current.currentStepIndex,
    totalSteps: engineRef.current.totalSteps,
    playbackStatus: engineRef.current.playbackStatus,
    speed: engineRef.current.speed,
    play: () => engineRef.current.play(),
    pause: () => engineRef.current.pause(),
    stepForward: () => engineRef.current.stepForward(),
    stepBackward: () => engineRef.current.stepBackward(),
    restart: () => engineRef.current.restart(),
    setSpeed: (s) => engineRef.current.setSpeed(s),
    goToStep: (i) => engineRef.current.goToStep(i),
    executeOperation: (opId, params) => engineRef.current.executeOperation(opId, params),
  };

  return (
    <PluginContext.Provider value={value}>
      {children}
    </PluginContext.Provider>
  );
}

export function usePluginContext(): PluginContextValue {
  const ctx = useContext(PluginContext);
  if (!ctx) {
    throw new Error('usePluginContext must be used within a PluginProvider');
  }
  return ctx;
}