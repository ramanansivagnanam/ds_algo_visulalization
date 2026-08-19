import { DataStructurePlugin, DSState, OperationDefinition, StepEvent } from '../../types';
import { LinkedListVisualizer } from './visualizer';

export interface LinkedListNode {
  value: number;
  next: string | null;
}

export interface LinkedListData {
  head: string | null;
  nodes: Record<string, LinkedListNode>;
  length: number;
}

const createNodeId = () => `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

let stepId = 0;
function nextId(): string { return `step-${++stepId}`; }

function makeStep(
  operation: string,
  snapshot: DSState,
  highlight: string[],
  explanation: string,
  pseudocodeLine: number | null = null,
  variables: Record<string, unknown> = {}
): StepEvent {
  return { id: nextId(), operation, snapshot, highlight, explanation, pseudocodeLine, variables };
}

const createInitialState = (): DSState => ({
  type: 'linkedlist',
  linkedList: { head: null, nodes: {}, length: 0 },
  highlights: [],
  annotations: [],
  metadata: {},
});

const operations: OperationDefinition[] = [
  {
    id: 'insertHead',
    label: 'Insert at Head',
    description: 'Insert a new node at the beginning of the list',
    parameters: [{ name: 'value', label: 'Value', type: 'number', required: true, placeholder: 'e.g. 42' }],
    execute: (state, params) => {
      const data = state.linkedList!;
      const nodeId = createNodeId();
      const newNode: LinkedListNode = { value: params.value as number, next: data.head };
      const newNodes = { ...data.nodes, [nodeId]: newNode };
      const newState: DSState = {
        ...state,
        linkedList: { head: nodeId, nodes: newNodes, length: data.length + 1 },
        highlights: [nodeId],
        annotations: [],
        metadata: {},
      };
      return [makeStep('insertHead', newState, [nodeId], `Inserted ${params.value} at head`)];
    },
  },
  {
    id: 'insertTail',
    label: 'Insert at Tail',
    description: 'Insert a new node at the end of the list',
    parameters: [{ name: 'value', label: 'Value', type: 'number', required: true, placeholder: 'e.g. 42' }],
    execute: (state, params) => {
      const data = state.linkedList!;
      const nodeId = createNodeId();
      const newNode: LinkedListNode = { value: params.value as number, next: null };
      
      if (!data.head) {
        const newState: DSState = {
          ...state,
          linkedList: { head: nodeId, nodes: { [nodeId]: newNode }, length: 1 },
          highlights: [nodeId],
          annotations: [],
          metadata: {},
        };
        return [makeStep('insertTail', newState, [nodeId], `Inserted ${params.value} at tail (empty list)`)];
      }
      
      let currentId = data.head;
      while (data.nodes[currentId].next) {
        currentId = data.nodes[currentId].next!;
      }
      
      const newNodes = { ...data.nodes, [nodeId]: newNode };
      newNodes[currentId] = { ...newNodes[currentId], next: nodeId };
      
      const newState: DSState = {
        ...state,
        linkedList: { head: data.head, nodes: newNodes, length: data.length + 1 },
        highlights: [currentId, nodeId],
        annotations: [],
        metadata: {},
      };
      return [makeStep('insertTail', newState, [currentId, nodeId], `Inserted ${params.value} at tail`)];
    },
  },
  {
    id: 'deleteHead',
    label: 'Delete Head',
    description: 'Remove the first node from the list',
    parameters: [],
    execute: (state) => {
      const data = state.linkedList!;
      if (!data.head) {
        throw new Error('List is empty');
      }
      
      const oldHead = data.head;
      const newHead = data.nodes[oldHead].next;
      const newNodes = { ...data.nodes };
      delete newNodes[oldHead];
      
      const newState: DSState = {
        ...state,
        linkedList: { head: newHead, nodes: newNodes, length: Math.max(0, data.length - 1) },
        highlights: newHead ? [newHead] : [],
        annotations: [],
        metadata: {},
      };
      return [makeStep('deleteHead', newState, newHead ? [newHead] : [], 'Deleted head node')];
    },
  },
  {
    id: 'search',
    label: 'Search',
    description: 'Find a node with the given value',
    parameters: [{ name: 'value', label: 'Value', type: 'number', required: true, placeholder: 'e.g. 42' }],
    execute: (state, params) => {
      const data = state.linkedList!;
      let currentId = data.head;
      let index = 0;
      
      while (currentId) {
        if (data.nodes[currentId].value === params.value) {
          const newState: DSState = {
            ...state,
            linkedList: data,
            highlights: [currentId],
            annotations: [{ id: 'found', text: `Found at position ${index}`, targetId: currentId }],
            metadata: {},
          };
          return [makeStep('search', newState, [currentId], `Found ${params.value} at position ${index}`)];
        }
        currentId = data.nodes[currentId].next!;
        index++;
      }
      
      const newState: DSState = {
        ...state,
        linkedList: data,
        highlights: [],
        annotations: [{ id: 'not_found', text: `Value ${params.value} not found`, targetId: null }],
        metadata: {},
      };
      return [makeStep('search', newState, [], `Value ${params.value} not found`)];
    },
  },
  {
    id: 'reverse',
    label: 'Reverse',
    description: 'Reverse the entire linked list',
    parameters: [],
    execute: (state) => {
      const data = state.linkedList!;
      if (!data.head) {
        return [makeStep('reverse', state, [], 'List is empty, nothing to reverse')];
      }
      
      const newNodes = { ...data.nodes };
      let prevId: string | null = null;
      let currentId = data.head;
      
      while (currentId) {
        const nextId = newNodes[currentId].next;
        newNodes[currentId] = { ...newNodes[currentId], next: prevId };
        prevId = currentId;
        currentId = nextId!;
      }
      
      const newState: DSState = {
        ...state,
        linkedList: { head: prevId, nodes: newNodes, length: data.length },
        highlights: prevId ? [prevId] : [],
        annotations: [],
        metadata: {},
      };
      return [makeStep('reverse', newState, prevId ? [prevId] : [], 'Reversed the linked list')];
    },
  },
];

function LinkedListVisualizerPlaceholder() { return null; }

export const linkedListPlugin: DataStructurePlugin = {
  id: 'linkedlist',
  name: 'Linked List',
  category: 'linear',
  icon: '🔗',
  description: 'A linear data structure where elements are stored in nodes connected by pointers.',
  createInitialState,
  operations,
  Visualizer: LinkedListVisualizer,
  pseudocode: {},
  complexity: {},
};
