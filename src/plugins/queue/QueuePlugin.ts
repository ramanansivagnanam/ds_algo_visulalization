import { DataStructurePlugin, DSState, OperationDefinition, StepEvent } from '../../types';

export interface QueueData { elements: number[]; front: number; rear: number; maxSize: number; }

let stepId = 0;
function nextId(): string { return `step-${++stepId}`; }
function makeStep(operation: string, snapshot: DSState, highlight: string[], explanation: string, pseudocodeLine: number | null = null, variables: Record<string, unknown> = {}): StepEvent {
  return { id: nextId(), operation, snapshot, highlight, explanation, pseudocodeLine, variables };
}

const createInitialState = (): DSState => ({
  type: 'queue',
  queue: { elements: [], front: 0, rear: -1, maxSize: 10 },
  highlights: [],
  annotations: [],
  metadata: {},
});

const operations: OperationDefinition[] = [
  {
    id: 'enqueue',
    label: 'Enqueue',
    description: 'Add an element to the rear of the queue',
    parameters: [{ name: 'value', label: 'Value', type: 'number', required: true, placeholder: 'e.g. 42' }],
    execute: (state, params) => {
      const data = state.queue!;
      if (data.elements.length >= data.maxSize) throw new Error('Queue overflow');
      const newElements = [...data.elements, params.value as number];
      const newState: DSState = {
        ...state,
        queue: { ...data, elements: newElements, rear: newElements.length - 1 },
        highlights: [`element_${newElements.length - 1}`],
        annotations: [],
        metadata: {},
      };
      return [makeStep('enqueue', newState, [`element_${newElements.length - 1}`], `Enqueued ${params.value}`)];
    },
  },
  {
    id: 'dequeue',
    label: 'Dequeue',
    description: 'Remove the front element from the queue',
    parameters: [],
    execute: (state) => {
      const data = state.queue!;
      if (data.elements.length === 0) throw new Error('Queue underflow');
      const newElements = data.elements.slice(1);
      const newState: DSState = {
        ...state,
        queue: { ...data, elements: newElements, front: 0, rear: newElements.length > 0 ? newElements.length - 1 : -1 },
        highlights: newElements.length > 0 ? ['element_0'] : [],
        annotations: [],
        metadata: {},
      };
      return [makeStep('dequeue', newState, newElements.length > 0 ? ['element_0'] : [], 'Dequeued front element')];
    },
  },
  {
    id: 'peek',
    label: 'Peek Front',
    description: 'View the front element without removing it',
    parameters: [],
    execute: (state) => {
      const data = state.queue!;
      if (data.elements.length === 0) {
        const newState: DSState = {
          ...state,
          queue: data,
          highlights: [],
          annotations: [{ id: 'front_empty', text: 'Queue is empty', targetId: null }],
          metadata: {},
        };
        return [makeStep('peek', newState, [], 'Queue is empty')];
      }
      const newState: DSState = {
        ...state,
        queue: data,
        highlights: ['element_0'],
        annotations: [{ id: 'front_result', text: `Front: ${data.elements[0]}`, targetId: 'element_0' }],
        metadata: {},
      };
      return [makeStep('peek', newState, ['element_0'], `Front element: ${data.elements[0]}`)];
    },
  },
];

function QueueVisualizer() { return null; }

export const queuePlugin: DataStructurePlugin = {
  id: 'queue',
  name: 'Queue',
  category: 'linear',
  icon: '📋',
  description: 'A FIFO (First In First Out) data structure.',
  createInitialState,
  operations,
  Visualizer: QueueVisualizer,
  pseudocode: {},
  complexity: {},
};
