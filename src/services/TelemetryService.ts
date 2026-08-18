import { TelemetryEvent, TelemetryService } from '../types/telemetry';

export class TelemetryServiceImpl implements TelemetryService {
  private events: TelemetryEvent[] = [];
  private sessionId: string;
  private startTime: number;

  constructor(sessionId?: string) {
    this.sessionId = sessionId || `session_${Date.now()}`;
    this.startTime = Date.now();
  }

  enqueue(event: Omit<TelemetryEvent, 'id' | 'timestamp'>): void {
    this.track(event);
  }

  async flush(): Promise<void> {
    console.log('[Telemetry] Flushing', this.events.length, 'events');
    this.events = [];
  }

  track(event: Omit<TelemetryEvent, 'id' | 'timestamp'>): void {
    const enrichedEvent: TelemetryEvent = {
      ...event,
      id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      sessionDuration: Date.now() - this.startTime,
    };
    this.events.push(enrichedEvent);
    console.log('[Telemetry]', event.type, enrichedEvent);
  }

  getSessionStats() {
    const operationEvents = this.events.filter(e => e.type === 'operation_executed' || e.type === 'operation');
    const errorEvents = this.events.filter(e => e.type === 'error');
    
    return {
      sessionId: this.sessionId,
      duration: Date.now() - this.startTime,
      totalOperations: operationEvents.length,
      errorCount: errorEvents.length,
      operationsByType: operationEvents.reduce((acc, e) => {
        const opType = (e.data as any)?.operationType || e.action || 'unknown';
        acc[opType] = (acc[opType] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };
  }

  getEvents(): TelemetryEvent[] {
    return [...this.events];
  }

  exportEvents(): TelemetryEvent[] {
    return [...this.events];
  }

  clear(): void {
    this.events = [];
    this.startTime = Date.now();
  }
}
