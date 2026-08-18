import type { ComponentType } from 'react';
import type { StepEvent, PseudocodeBlock, ComplexityInfo, DSState, VisualizerProps, SceneNode } from './visualization';

export interface ParameterDef {
  name: string;
  label: string;
  type: 'number' | 'string' | 'boolean';
  required: boolean;
  defaultValue?: unknown;
  placeholder?: string;
  min?: number;
  max?: number;
}

export interface OperationDefinition {
  id: string;
  label: string;
  description: string;
  parameters: ParameterDef[];
  execute(state: DSState, params: Record<string, unknown>): StepEvent[];
}

export interface Operation {
  type: string;
  payload: Record<string, unknown>;
}

export interface VisualizationState<T = any> {
  data: T;
  highlights: string[];
  annotations: Array<{ id: string; text: string; targetId: string | null }>;
  metadata: Record<string, unknown>;
}

export interface PluginContext<T = any> {
  state: VisualizationState<T>;
  operation: Operation;
}

export interface Plugin<T = any> {
  id: string;
  name: string;
  description: string;
  version: string;
  getInitialState(): VisualizationState<T>;
  validateOperation(operation: Operation): boolean;
  execute(ctx: PluginContext<T>): VisualizationState<T>;
  getDescription(): string;
}

export interface DataStructurePlugin {
  id: string;
  name: string;
  category: 'linear' | 'non-linear' | 'graph';
  icon: string;
  description: string;
  createInitialState(): DSState;
  operations: OperationDefinition[];
  Visualizer: ComponentType<VisualizerProps>;
  pseudocode: Record<string, PseudocodeBlock[]>;
  complexity: Record<string, ComplexityInfo>;
  layout?(state: DSState): SceneNode[];
}