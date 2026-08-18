export interface TelemetryEvent {
  id: string;
  type: 'operation' | 'navigation' | 'export' | 'error' | 'playback';
  timestamp: number;
  action: string;
  metadata?: Record<string, unknown>;
}

export interface TelemetryService {
  enqueue(event: Omit<TelemetryEvent, 'id' | 'timestamp'>): void;
  flush(): Promise<void>;
  getEvents(): TelemetryEvent[];
  clear(): void;
}