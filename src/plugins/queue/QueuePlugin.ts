import { Plugin, PluginContext, Operation, VisualizationState } from '../../types/plugin';

export interface QueueData {
  elements: number[];
  front: number;
  rear: number;
  maxSize: number;
}

export class QueuePlugin implements Plugin<QueueData> {
  id = 'queue';
  name = 'Queue';
  description = 'FIFO queue visualization';
  version = '1.0.0';

  getInitialState(): VisualizationState<QueueData> {
    return {
      data: { elements: [], front: 0, rear: -1, maxSize: 10 },
      highlights: [],
      annotations: [],
      metadata: {},
    };
  }

  validateOperation(operation: Operation): boolean {
    const validTypes = ['create', 'enqueue', 'dequeue', 'front', 'isEmpty', 'isFull'];
    if (!validTypes.includes(operation.type)) return false;

    switch (operation.type) {
      case 'enqueue':
        return typeof operation.payload.value === 'number';
      default:
        return true;
    }
  }

  execute(ctx: PluginContext<QueueData>): VisualizationState<QueueData> {
    const { state, operation } = ctx;
    const data = state.data || this.getInitialState().data;
    const newData: QueueData = JSON.parse(JSON.stringify(data));

    switch (operation.type) {
      case 'create': {
        const maxSize = operation.payload.maxSize as number | undefined;
        newData.maxSize = maxSize || 10;
        newData.elements = [];
        newData.front = 0;
        newData.rear = -1;
        break;
      }

      case 'enqueue': {
        if (newData.elements.length >= newData.maxSize) {
          throw new Error('Queue overflow');
        }
        newData.elements.push(operation.payload.value as number);
        newData.rear = newData.elements.length - 1;
        break;
      }

      case 'dequeue': {
        if (newData.elements.length === 0) {
          throw new Error('Queue underflow');
        }
        newData.elements.shift();
        newData.rear = newData.elements.length - 1;
        if (newData.elements.length === 0) {
          newData.front = 0;
          newData.rear = -1;
        }
        break;
      }

      case 'front': {
        if (newData.elements.length === 0) {
          return {
            ...state,
            data: newData,
            annotations: [{ id: 'front_empty', text: 'Queue is empty', targetId: null }],
          };
        }
        return {
          ...state,
          data: newData,
          highlights: ['front_element'],
          annotations: [{ id: 'front_result', text: `Front element: ${newData.elements[0]}`, targetId: 'front_element' }],
        };
      }

      case 'isEmpty': {
        const isEmpty = newData.elements.length === 0;
        return {
          ...state,
          data: newData,
          annotations: [{ id: 'is_empty', text: `Queue is ${isEmpty ? 'empty' : 'not empty'}`, targetId: null }],
        };
      }

      case 'isFull': {
        const isFull = newData.elements.length >= newData.maxSize;
        return {
          ...state,
          data: newData,
          annotations: [{ id: 'is_full', text: `Queue is ${isFull ? 'full' : 'not full'}`, targetId: null }],
        };
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
