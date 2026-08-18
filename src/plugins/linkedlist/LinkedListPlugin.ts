import { Plugin, PluginContext, Operation, VisualizationState } from '../../types/plugin';

export interface LinkedListNode {
  value: number;
  next: string | null; // node ID or null
}

export interface LinkedListData {
  head: string | null; // node ID
  nodes: Record<string, LinkedListNode>;
  length: number;
}

const createNodeId = () => `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export class LinkedListPlugin implements Plugin<LinkedListData> {
  id = 'linkedlist';
  name = 'Linked List';
  description = 'Singly linked list visualization';
  version = '1.0.0';

  getInitialState(): VisualizationState<LinkedListData> {
    return {
      data: { head: null, nodes: {}, length: 0 },
      highlights: [],
      annotations: [],
      metadata: {},
    };
  }

  validateOperation(operation: Operation): boolean {
    const validTypes = ['create', 'insertHead', 'insertTail', 'insertAt', 'deleteHead', 'deleteTail', 'deleteAt', 'search', 'reverse'];
    if (!validTypes.includes(operation.type)) return false;

    switch (operation.type) {
      case 'create':
        return true;
      case 'insertHead':
      case 'insertTail':
        return typeof operation.payload.value === 'number';
      case 'insertAt':
        return typeof operation.payload.index === 'number' && typeof operation.payload.value === 'number';
      case 'deleteAt':
        return typeof operation.payload.index === 'number';
      case 'search':
        return typeof operation.payload.value === 'number';
      default:
        return true;
    }
  }

  execute(ctx: PluginContext<LinkedListData>): VisualizationState<LinkedListData> {
    const { state, operation } = ctx;
    const data = state.data || this.getInitialState().data;
    const newData: LinkedListData = JSON.parse(JSON.stringify(data));

    switch (operation.type) {
      case 'create': {
        const initialValues = operation.payload.initialValues as number[] | undefined;
        if (initialValues && initialValues.length > 0) {
          let prevId: string | null = null;
          for (const val of initialValues) {
            const nodeId = createNodeId();
            newData.nodes[nodeId] = { value: val, next: null };
            if (prevId) {
              newData.nodes[prevId].next = nodeId;
            } else {
              newData.head = nodeId;
            }
            prevId = nodeId;
          }
          newData.length = initialValues.length;
        } else {
          newData.head = null;
          newData.nodes = {};
          newData.length = 0;
        }
        break;
      }

      case 'insertHead': {
        const nodeId = createNodeId();
        newData.nodes[nodeId] = { value: operation.payload.value as number, next: newData.head };
        newData.head = nodeId;
        newData.length++;
        break;
      }

      case 'insertTail': {
        const nodeId = createNodeId();
        newData.nodes[nodeId] = { value: operation.payload.value as number, next: null };
        
        if (!newData.head) {
          newData.head = nodeId;
        } else {
          let currentId: string | null = newData.head;
          while (currentId && newData.nodes[currentId].next) {
            currentId = newData.nodes[currentId].next;
          }
          if (currentId) {
            newData.nodes[currentId].next = nodeId;
          }
        }
        newData.length++;
        break;
      }

      case 'insertAt': {
        const { index, value } = operation.payload as { index: number; value: number };
        if (index < 0 || index > newData.length) {
          throw new Error(`Index ${index} out of bounds`);
        }
        if (index === 0) {
          return this.execute({ ...ctx, operation: { type: 'insertHead', payload: { value } } });
        }
        if (index === newData.length) {
          return this.execute({ ...ctx, operation: { type: 'insertTail', payload: { value } } });
        }

        let currentId = newData.head;
        for (let i = 0; i < index - 1 && currentId; i++) {
          currentId = newData.nodes[currentId].next;
        }

        const nodeId = createNodeId();
        newData.nodes[nodeId] = { value, next: newData.nodes[currentId!].next };
        newData.nodes[currentId!].next = nodeId;
        newData.length++;
        break;
      }

      case 'deleteHead': {
        if (!newData.head) {
          throw new Error('List is empty');
        }
        const oldHead = newData.head;
        newData.head = newData.nodes[oldHead].next;
        delete newData.nodes[oldHead];
        newData.length--;
        break;
      }

      case 'deleteTail': {
        if (!newData.head) {
          throw new Error('List is empty');
        }
        if (!newData.nodes[newData.head].next) {
          return this.execute({ ...ctx, operation: { type: 'deleteHead', payload: {} } });
        }

        let currentId = newData.head;
        while (newData.nodes[newData.nodes[currentId].next!]?.next) {
          currentId = newData.nodes[currentId].next!;
        }
        const tailId = newData.nodes[currentId].next!;
        delete newData.nodes[tailId];
        newData.nodes[currentId].next = null;
        newData.length--;
        break;
      }

      case 'deleteAt': {
        const { index } = operation.payload as { index: number };
        if (index < 0 || index >= newData.length) {
          throw new Error(`Index ${index} out of bounds`);
        }
        if (index === 0) {
          return this.execute({ ...ctx, operation: { type: 'deleteHead', payload: {} } });
        }

        let currentId = newData.head;
        for (let i = 0; i < index - 1 && currentId; i++) {
          currentId = newData.nodes[currentId].next;
        }

        const toDeleteId = newData.nodes[currentId!].next!;
        newData.nodes[currentId!].next = newData.nodes[toDeleteId].next;
        delete newData.nodes[toDeleteId];
        newData.length--;
        break;
      }

      case 'search': {
        const { value } = operation.payload;
        let currentId = newData.head;
        let index = 0;
        while (currentId) {
          if (newData.nodes[currentId].value === value) {
            return {
              ...state,
              data: newData,
              highlights: [currentId],
              annotations: [{ id: `found_${index}`, text: `Found at index ${index}`, targetId: currentId }],
            };
          }
          currentId = newData.nodes[currentId].next;
          index++;
        }
        return {
          ...state,
          data: newData,
          annotations: [{ id: 'not_found', text: `Value ${value} not found`, targetId: null }],
        };
      }

      case 'reverse': {
        let prevId: string | null = null;
        let currentId = newData.head;
        
        while (currentId) {
          const nextId = newData.nodes[currentId].next;
          newData.nodes[currentId].next = prevId;
          prevId = currentId;
          currentId = nextId;
        }
        newData.head = prevId;
        break;
      }

      default:
        throw new Error(`Unknown operation: ${operation.type}`);
    }

    return { ...state, data: newData };
  }

  getDescription(): string {
    return this.description;
  }
}
