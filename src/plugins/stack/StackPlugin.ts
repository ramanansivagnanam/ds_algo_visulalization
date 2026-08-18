import { DataStructurePlugin, DSState, OperationDefinition, StepEvent } from '../../types';

export interface StackNode { value: number; }
export interface StackData { elements: StackNode[]; top: number; maxSize: number; }

let stepId = 0;
function nextId(): string { return `step-${++stepId}`; }
function makeStep(operation: string, snapshot: DSState, highlight: string[], explanation: string, pseudocodeLine: number | null = null, variables: Record<string, unknown> = {}): StepEvent {
  return { id: nextId(), operation, snapshot, highlight, explanation, pseudocodeLine, variables };
}

const createInitialState = (): DSState => ({
  type: 'stack',
  stack: { elements: [], top: -1, maxSize: 10 },
  highlights: [],
  annotations: [],
  metadata: {},
});

const operations: OperationDefinition[] = [
  {
    id: 'push',
    label: 'Push',
    description: 'Add an element to the top of the stack',
    parameters: [{ name: 'value', label: 'Value', type: 'number', required: true, placeholder: 'e.g. 42' }],
    execute: (state, params) => {
      const data = state.stack!;
      if (data.elements.length >= data.maxSize) throw new Error('Stack overflow');
      const newElements = [...data.elements, { value: params.value as number }];
      const newState: DSState = {
        ...state,
        stack: { ...data, elements: newElements, top: newElements.length - 1 },
        highlights: [`element_${newElements.length - 1}`],
        annotations: [],
        metadata: {},
      };
      return [makeStep('push', newState, [`element_${newElements.length - 1}`], `Pushed ${params.value} to stack`)];
    },
  },
  {
    id: 'pop',
    label: 'Pop',
    description: 'Remove the top element from the stack',
    parameters: [],
    execute: (state) => {
      const data = state.stack!;
      if (data.elements.length === 0) throw new Error('Stack underflow');
      const newElements = data.elements.slice(0, -1);
      const newState: DSState = {
        ...state,
        stack: { ...data, elements: newElements, top: newElements.length - 1 },
        highlights: newElements.length > 0 ? [`element_${newElements.length - 1}`] : [],
        annotations: [],
        metadata: {},
      };
      return [makeStep('pop', newState, newElements.length > 0 ? [`element_${newElements.length - 1}`] : [], 'Popped from stack')];
    },
  },
  {
    id: 'peek',
    label: 'Peek',
    description: 'View the top element without removing it',
    parameters: [],
    execute: (state) => {
      const data = state.stack!;
      if (data.elements.length === 0) {
        const newState: DSState = {
          ...state,
          stack: data,
          highlights: [],
          annotations: [{ id: 'peek_empty', text: 'Stack is empty', targetId: null }],
          metadata: {},
        };
        return [makeStep('peek', newState, [], 'Stack is empty')];
      }
      const newState: DSState = {
        ...state,
        stack: data,
        highlights: [`element_${data.top}`],
        annotations: [{ id: 'peek_result', text: `Top: ${data.elements[data.top].value}`, targetId: `element_${data.top}` }],
        metadata: {},
      };
      return [makeStep('peek', newState, [`element_${data.top}`], `Top element: ${data.elements[data.top].value}`)];
    },
  },
];

function StackVisualizer() { return null; }

export const stackPlugin: DataStructurePlugin = {
  id: 'stack',
  name: 'Stack',
  category: 'linear',
  icon: '📚',
  description: 'A LIFO (Last In First Out) data structure.',
  createInitialState,
  operations,
  Visualizer: StackVisualizer,
  pseudocode: {},
  complexity: {},
};
