export interface TelemetryEvent {
  id: string;
  type: 'operation' | 'navigation' | 'export' | 'error' | 'playback' | 'operation_executed';
  timestamp: number;
  action: string;
  sessionId?: string;
  sessionDuration?: number;
  data?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export interface LessonStep {
  order: number;
  instruction: string;
  expectedOperation: { type: string; payload: Record<string, unknown> };
  hint: string;
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: number;
  steps: LessonStep[];
}

export interface Exercise {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  initialPluginId: string;
  initialState: any | null;
  targetState: any;
  constraints: {
    maxOperations: number;
    requiredOperations: string[];
  };
  hints: string[];
}

export interface TelemetryService {
  enqueue(event: Omit<TelemetryEvent, 'id' | 'timestamp'>): void;
  flush(): Promise<void>;
  getEvents(): TelemetryEvent[];
  clear(): void;
  track(event: Omit<TelemetryEvent, 'id' | 'timestamp'>): void;
  getSessionStats(): any;
  exportEvents(): TelemetryEvent[];
}