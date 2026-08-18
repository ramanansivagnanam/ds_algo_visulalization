import type { DataStructurePlugin, StepEvent, DSState } from '../types';

export class OperationEngine {
  private plugin: DataStructurePlugin | null = null;

  setPlugin(plugin: DataStructurePlugin): void {
    this.plugin = plugin;
  }

  clearPlugin(): void {
    this.plugin = null;
  }

  getPlugin(): DataStructurePlugin | null {
    return this.plugin;
  }

  execute(
    operationId: string,
    params: Record<string, unknown>,
    currentState: DSState
  ): StepEvent[] {
    if (!this.plugin) {
      throw new Error('No plugin loaded');
    }

    const operation = this.plugin.operations.find((op) => op.id === operationId);
    if (!operation) {
      throw new Error(`Operation "${operationId}" not found in plugin "${this.plugin.id}"`);
    }

    return operation.execute(currentState, params);
  }
}

export const operationEngine = new OperationEngine();