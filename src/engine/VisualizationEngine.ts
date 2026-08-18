import type { DataStructurePlugin, StepEvent, DSState, PlaybackStatus } from '../types';
import { operationEngine } from './OperationEngine';
import { sceneGraph } from './SceneGraph';
import { stateReducer } from './StateReducer';

type Listener = () => void;

export class VisualizationEngine {
  private listeners: Set<Listener> = new Set();
  private _plugin: DataStructurePlugin | null = null;
  private _steps: StepEvent[] = [];
  private _currentStepIndex: number = -1;
  private _currentState: DSState | null = null;
  private _playbackStatus: PlaybackStatus = 'idle';
  private _playbackTimer: ReturnType<typeof setTimeout> | null = null;
  private _speed: number = 1;

  get plugin(): DataStructurePlugin | null {
    return this._plugin;
  }

  get steps(): StepEvent[] {
    return this._steps;
  }

  get currentStepIndex(): number {
    return this._currentStepIndex;
  }

  get currentState(): DSState | null {
    return this._currentState;
  }

  get playbackStatus(): PlaybackStatus {
    return this._playbackStatus;
  }

  get speed(): number {
    return this._speed;
  }

  get totalSteps(): number {
    return this._steps.length;
  }

  loadPlugin(plugin: DataStructurePlugin): void {
    this._plugin = plugin;
    operationEngine.setPlugin(plugin);
    this._currentState = plugin.createInitialState();
    this._steps = [];
    this._currentStepIndex = -1;
    this._playbackStatus = 'idle';
    this.stopPlayback();
    this.notify();
  }

  executeOperation(operationId: string, params: Record<string, unknown>): void {
    if (!this._plugin || !this._currentState) return;

    try {
      const steps = operationEngine.execute(operationId, params, this._currentState);
      this._steps = steps;
      this._currentStepIndex = 0;
      if (steps.length > 0) {
        this._currentState = stateReducer.applyStep(this._currentState, steps[0]);
      }
      this._playbackStatus = 'idle';
      this.stopPlayback();
      this.notify();
    } catch (error) {
      console.error('Operation execution failed:', error);
    }
  }

  goToStep(index: number): void {
    if (!this._plugin || this._steps.length === 0) return;

    const clampedIndex = Math.max(0, Math.min(index, this._steps.length - 1));
    this._currentStepIndex = clampedIndex;
    this._currentState = this._steps[clampedIndex].snapshot;
    sceneGraph.updateHighlights(this._steps[clampedIndex].highlight);
    this.notify();
  }

  play(): void {
    if (this._steps.length === 0) return;
    if (this._currentStepIndex >= this._steps.length - 1) {
      this.goToStep(0);
    }
    this._playbackStatus = 'playing';
    this.notify();
    this.scheduleNextStep();
  }

  pause(): void {
    this._playbackStatus = 'paused';
    this.stopPlayback();
    this.notify();
  }

  stepForward(): void {
    if (this._steps.length === 0) return;
    const nextIndex = Math.min(this._currentStepIndex + 1, this._steps.length - 1);
    this.goToStep(nextIndex);
  }

  stepBackward(): void {
    if (this._steps.length === 0) return;
    const prevIndex = Math.max(this._currentStepIndex - 1, 0);
    this.goToStep(prevIndex);
  }

  restart(): void {
    this.stopPlayback();
    if (this._steps.length > 0) {
      this.goToStep(0);
    }
    this._playbackStatus = 'idle';
    this.notify();
  }

  setSpeed(speed: number): void {
    this._speed = Math.max(0.25, Math.min(4, speed));
    if (this._playbackStatus === 'playing') {
      this.stopPlayback();
      this.scheduleNextStep();
    }
    this.notify();
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    this.listeners.forEach((listener) => listener());
  }

  private scheduleNextStep(): void {
    if (this._playbackStatus !== 'playing') return;
    if (this._currentStepIndex >= this._steps.length - 1) {
      this._playbackStatus = 'paused';
      this.notify();
      return;
    }

    const delay = 1000 / this._speed;
    this._playbackTimer = setTimeout(() => {
      this.stepForward();
      if (this._playbackStatus === 'playing') {
        this.scheduleNextStep();
      }
    }, delay);
  }

  private stopPlayback(): void {
    if (this._playbackTimer !== null) {
      clearTimeout(this._playbackTimer);
      this._playbackTimer = null;
    }
  }

  destroy(): void {
    this.stopPlayback();
    this.listeners.clear();
  }
}

export const visualizationEngine = new VisualizationEngine();