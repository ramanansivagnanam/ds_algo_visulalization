import type { ComponentType } from 'react';
import type { StepEvent, PseudocodeBlock, ComplexityInfo, DSState, VisualizerProps } from './visualization';

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

import type { SceneNode } from './visualization';