import type { DataStructurePlugin, ParameterDef } from '../../types';
import { operations, createInitialState } from './operations';
import { ArrayVisualizer } from './visualizer';
import { pseudocode } from './pseudocode';
import { complexity } from './complexity';

const arrayParamDefs: ParameterDef[] = [
  { name: 'value', label: 'Value', type: 'number', required: true, placeholder: 'e.g. 42', min: -9999, max: 9999 },
  { name: 'index', label: 'Index', type: 'number', required: true, placeholder: 'e.g. 0', min: 0 },
];

export const arrayPlugin: DataStructurePlugin = {
  id: 'array',
  name: 'Array',
  category: 'linear',
  icon: '[]',
  description: 'A linear data structure that stores elements in contiguous memory locations, providing O(1) random access.',
  createInitialState,
  operations: operations.map((op) => ({
    id: op.id,
    label: op.label,
    description: op.description,
    parameters: op.parameters,
    execute: op.execute,
  })),
  Visualizer: ArrayVisualizer,
  pseudocode,
  complexity,
};