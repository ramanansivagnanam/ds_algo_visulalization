interface ArrayState {
  elements: (number | string | null)[];
  size: number;
}

export function createInitialState(): ArrayState {
  return {
    elements: [],
    size: 0,
  };
}

function cloneState(state: ArrayState): ArrayState {
  return {
    elements: [...state.elements],
    size: state.size,
  };
}

let stepId = 0;
function nextId(): string {
  return `step-${++stepId}`;
}

import type { StepEvent } from '../../types';

export interface ArrayOperation {
  id: string;
  label: string;
  description: string;
  parameters: Array<{
    name: string;
    label: string;
    type: 'number' | 'string' | 'boolean';
    required: boolean;
    defaultValue?: unknown;
    placeholder?: string;
    min?: number;
    max?: number;
  }>;
  execute: (state: ArrayState, params: Record<string, unknown>) => StepEvent[];
}

function makeStep(
  operation: string,
  snapshot: ArrayState,
  highlight: string[],
  explanation: string,
  pseudocodeLine: number | null,
  variables: Record<string, unknown> = {},
  complexity?: { time: string; space: string }
): StepEvent {
  return {
    id: nextId(),
    operation,
    snapshot,
    highlight,
    explanation,
    pseudocodeLine,
    variables,
    complexity,
  };
}

export const insertOperation: ArrayOperation = {
  id: 'insert',
  label: 'Insert',
  description: 'Insert a value at a specific index',
  parameters: [
    { name: 'value', label: 'Value', type: 'number', required: true, placeholder: 'e.g. 42', min: -9999, max: 9999 },
    { name: 'index', label: 'Index', type: 'number', required: true, placeholder: 'e.g. 0', min: 0 },
  ],
  execute(state: ArrayState, params: Record<string, unknown>): StepEvent[] {
    const value = params.value as number;
    const index = params.index as number;
    const steps: StepEvent[] = [];
    const target = Math.min(index, state.elements.length);

    // Step 1: Validate
    if (target < 0) {
      return [makeStep('insert', cloneState(state), [], 'Invalid index. Index must be >= 0.', 1, { value, index, valid: false })];
    }

    // Step 2: Shift elements right
    const shifting = cloneState(state);
    shifting.elements = [...shifting.elements];
    for (let i = shifting.elements.length; i > target; i--) {
      shifting.elements[i] = shifting.elements[i - 1];
    }
    shifting.elements[target] = null;
    steps.push(makeStep(
      'insert', cloneState(shifting),
      Array.from({ length: state.elements.length - target }, (_, i) => `idx-${target + i}`),
      `Shift elements from index ${target} to the right to make room.`,
      3,
      { value, index: target, shifted: state.elements.length - target }
    ));

    // Step 3: Insert the value
    const inserted = cloneState(shifting);
    inserted.elements[target] = value;
    inserted.size = inserted.elements.length;
    steps.push(makeStep(
      'insert', cloneState(inserted),
      [`idx-${target}`],
      `Insert ${value} at index ${target}.`,
      5,
      { value, index: target, inserted: true }
    ));

    // Step 4: Done
    steps.push(makeStep(
      'insert', cloneState(inserted),
      [],
      `Insertion complete. Array now has ${inserted.size} elements.`,
      7,
      { value, index: target, size: inserted.size },
      { time: 'O(n)', space: 'O(1)' }
    ));

    return steps;
  },
};

export const deleteOperation: ArrayOperation = {
  id: 'delete',
  label: 'Delete',
  description: 'Delete an element at a specific index',
  parameters: [
    { name: 'index', label: 'Index', type: 'number', required: true, placeholder: 'e.g. 0', min: 0 },
  ],
  execute(state: ArrayState, params: Record<string, unknown>): StepEvent[] {
    const index = params.index as number;
    const steps: StepEvent[] = [];

    if (state.elements.length === 0 || index >= state.elements.length) {
      return [makeStep('delete', cloneState(state), [], 'Index out of bounds.', 1, { index, valid: false })];
    }

    const deletedValue = state.elements[index];

    // Step 1: Mark deleted
    const marked = cloneState(state);
    marked.elements[index] = null;
    steps.push(makeStep(
      'delete', cloneState(marked),
      [`idx-${index}`],
      `Remove element ${deletedValue} at index ${index}.`,
      3,
      { index, deletedValue }
    ));

    // Step 2: Shift elements left
    const shifted = cloneState(state);
    shifted.elements = [...shifted.elements];
    shifted.elements.splice(index, 1);
    shifted.size = shifted.elements.length;
    steps.push(makeStep(
      'delete', cloneState(shifted),
      Array.from({ length: shifted.elements.length - index }, (_, i) => `idx-${index + i}`),
      `Shift elements from index ${index + 1} left to fill the gap.`,
      5,
      { index, shifted: shifted.elements.length - index }
    ));

    // Step 3: Done
    steps.push(makeStep(
      'delete', cloneState(shifted),
      [],
      `Deletion complete. Array now has ${shifted.size} elements.`,
      7,
      { index, deletedValue, size: shifted.size },
      { time: 'O(n)', space: 'O(1)' }
    ));

    return steps;
  },
};

export const searchOperation: ArrayOperation = {
  id: 'search',
  label: 'Search',
  description: 'Search for a value in the array (linear search)',
  parameters: [
    { name: 'value', label: 'Value', type: 'number', required: true, placeholder: 'e.g. 42', min: -9999, max: 9999 },
  ],
  execute(state: ArrayState, params: Record<string, unknown>): StepEvent[] {
    const value = params.value as number;
    const steps: StepEvent[] = [];

    if (state.elements.length === 0) {
      return [makeStep('search', cloneState(state), [], 'Array is empty.', 1, { value })];
    }

    // Step 1: Start search
    steps.push(makeStep(
      'search', cloneState(state),
      [],
      `Start linear search for value ${value}.`,
      1,
      { value, found: false, comparisons: 0 }
    ));

    // Search steps
    for (let i = 0; i < state.elements.length; i++) {
      const isMatch = state.elements[i] === value;
      const current = cloneState(state);
      steps.push(makeStep(
        'search', cloneState(current),
        [`idx-${i}`],
        isMatch
          ? `Found ${value} at index ${i}!`
          : `Compare index ${i}: ${state.elements[i]} ${isMatch ? '==' : '!='} ${value}`,
        3,
        { value, currentIndex: i, currentValue: state.elements[i], comparisons: i + 1, found: isMatch }
      ));

      if (isMatch) {
        steps.push(makeStep(
          'search', cloneState(current),
          [`idx-${i}`],
          `Search complete. ${value} found at index ${i}.`,
          5,
          { value, foundIndex: i, comparisons: i + 1 },
          { time: 'O(n)', space: 'O(1)' }
        ));
        return steps;
      }
    }

    // Not found
    steps.push(makeStep(
      'search', cloneState(state),
      [],
      `Value ${value} not found in the array after ${state.elements.length} comparisons.`,
      7,
      { value, found: false, comparisons: state.elements.length },
      { time: 'O(n)', space: 'O(1)' }
    ));

    return steps;
  },
};

export const updateOperation: ArrayOperation = {
  id: 'update',
  label: 'Update',
  description: 'Update an element at a specific index',
  parameters: [
    { name: 'index', label: 'Index', type: 'number', required: true, placeholder: 'e.g. 0', min: 0 },
    { name: 'value', label: 'New Value', type: 'number', required: true, placeholder: 'e.g. 42', min: -9999, max: 9999 },
  ],
  execute(state: ArrayState, params: Record<string, unknown>): StepEvent[] {
    const index = params.index as number;
    const value = params.value as number;
    const steps: StepEvent[] = [];

    if (state.elements.length === 0 || index >= state.elements.length) {
      return [makeStep('update', cloneState(state), [], 'Index out of bounds.', 1, { index, valid: false })];
    }

    const oldValue = state.elements[index];

    // Step 1: Show current value
    steps.push(makeStep(
      'update', cloneState(state),
      [`idx-${index}`],
      `Update element at index ${index} from ${oldValue} to ${value}.`,
      1,
      { index, oldValue, newValue: value }
    ));

    // Step 2: Update
    const updated = cloneState(state);
    updated.elements[index] = value;
    steps.push(makeStep(
      'update', cloneState(updated),
      [`idx-${index}`],
      `Element at index ${index} updated to ${value}.`,
      3,
      { index, oldValue, newValue: value, updated: true },
      { time: 'O(1)', space: 'O(1)' }
    ));

    return steps;
  },
};

export const traverseOperation: ArrayOperation = {
  id: 'traverse',
  label: 'Traverse',
  description: 'Traverse through all elements in the array',
  parameters: [],
  execute(state: ArrayState, params: Record<string, unknown>): StepEvent[] {
    const steps: StepEvent[] = [];

    if (state.elements.length === 0) {
      return [makeStep('traverse', cloneState(state), [], 'Array is empty. Nothing to traverse.', 1, {})];
    }

    // Step 1: Start
    steps.push(makeStep(
      'traverse', cloneState(state),
      [],
      `Start traversing array of ${state.elements.length} elements.`,
      1,
      { current: 0, total: state.elements.length }
    ));

    // Visit each element
    for (let i = 0; i < state.elements.length; i++) {
      const current = cloneState(state);
      steps.push(makeStep(
        'traverse', cloneState(current),
        [`idx-${i}`],
        `Visit index ${i}: value = ${state.elements[i]}`,
        3,
        { current: i + 1, total: state.elements.length, currentValue: state.elements[i] }
      ));
    }

    // Done
    steps.push(makeStep(
      'traverse', cloneState(state),
      [],
      `Traversal complete. Visited ${state.elements.length} elements.`,
      5,
      { visited: state.elements.length },
      { time: 'O(n)', space: 'O(1)' }
    ));

    return steps;
  },
};

export const operations = [
  insertOperation,
  deleteOperation,
  searchOperation,
  updateOperation,
  traverseOperation,
];