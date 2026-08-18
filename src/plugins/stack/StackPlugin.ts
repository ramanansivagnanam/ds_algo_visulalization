import { Plugin, PluginContext, Operation, VisualizationState } from '../../types/plugin';

export interface StackNode {
  value: number;
}

export interface StackData {
  elements: StackNode[];
  top: number;
  maxSize: number;
}

export class StackPlugin implements Plugin<StackData> {
  id = 'stack';
  name = 'Stack';
  description = 'LIFO stack visualization';
  version = '1.0.0';

  getInitialState(): VisualizationState<StackData> {
    return {
      data: { elements: [], top: -1, maxSize: 10 },
      highlights: [],
      annotations: [],
      metadata: {},
    };
  }

  validateOperation(operation: Operation): boolean {
    const validTypes = ['create', 'push', 'pop', 'peek', 'isEmpty', 'isFull'];
    if (!validTypes.includes(operation.type)) return false;

    switch (operation.type) {
      case 'push':
        return typeof operation.payload.value === 'number';
      default:
        return true;
    }
  }

  execute(ctx: PluginContext<StackData>): VisualizationState<StackData> {
    const { state, operation } = ctx;
    const data = state.data || this.getInitialState().data;
    const newData: StackData = JSON.parse(JSON.stringify(data));

    switch (operation.type) {
      case 'create': {
        const maxSize = operation.payload.maxSize as number | undefined;
        newData.maxSize = maxSize || 10;
        newData.elements = [];
        newData.top = -1;
        break;
      }

      case 'push': {
        if (newData.elements.length >= newData.maxSize) {
          throw new Error('Stack overflow');
        }
        newData.elements.push({ value: operation.payload.value as number });
        newData.top = newData.elements.length - 1;
        break;
      }

      case 'pop': {
        if (newData.elements.length === 0) {
          throw new Error('Stack underflow');
        }
        newData.elements.pop();
        newData.top = newData.elements.length - 1;
        break;
      }

      case 'peek': {
        if (newData.elements.length === 0) {
          return {
            ...state,
            data: newData,
            annotations: [{ id: 'peek_empty', text: 'Stack is empty', targetId: null }],
          };
        }
        const topValue = newData.elements[newData.top].value;
        return {
          ...state,
          data: newData,
          highlights: [`element_${newData.top}`],
          annotations: [{ id: 'peek_result', text: `Top element: ${topValue}`, targetId: `element_${newData.top}` }],
        };
      }

      case 'isEmpty': {
        const isEmpty = newData.elements.length === 0;
        return {
          ...state,
          data: newData,
          annotations: [{ id: 'is_empty', text: `Stack is ${isEmpty ? 'empty' : 'not empty'}`, targetId: null }],
        };
      }

      case 'isFull': {
        const isFull = newData.elements.length >= newData.maxSize;
        return {
          ...state,
          data: newData,
          annotations: [{ id: 'is_full', text: `Stack is ${isFull ? 'full' : 'not full'}`, targetId: null }],
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
