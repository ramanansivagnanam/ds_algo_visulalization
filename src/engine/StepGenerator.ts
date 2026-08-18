import type { StepEvent } from '../types';

let stepCounter = 0;

export class StepGenerator {
  generate(
    operation: string,
    partials: Omit<StepEvent, 'id'>[]
  ): StepEvent[] {
    return partials.map((partial) => ({
      ...partial,
      id: `step-${++stepCounter}`,
    }));
  }

  createStep(params: {
    operation: string;
    snapshot: StepEvent['snapshot'];
    highlight: string[];
    explanation: string;
    pseudocodeLine: number | null;
    variables?: Record<string, unknown>;
    complexity?: { time: string; space: string };
  }): StepEvent {
    return {
      id: `step-${++stepCounter}`,
      operation: params.operation,
      snapshot: params.snapshot,
      highlight: params.highlight,
      explanation: params.explanation,
      pseudocodeLine: params.pseudocodeLine,
      variables: params.variables ?? {},
      complexity: params.complexity,
    };
  }
}

export const stepGenerator = new StepGenerator();