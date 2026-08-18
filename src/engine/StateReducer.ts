import type { StepEvent, DSState } from '../types';

export class StateReducer {
  applyStep(state: DSState, step: StepEvent): DSState {
    return step.snapshot;
  }

  applySteps(steps: StepEvent[]): DSState[] {
    return steps.map((step) => step.snapshot);
  }
}

export const stateReducer = new StateReducer();