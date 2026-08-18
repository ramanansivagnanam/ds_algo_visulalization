export type DSState = any;

export interface StepEvent {
  id: string;
  operation: string;
  snapshot: DSState;
  highlight: string[];
  explanation: string;
  pseudocodeLine: number | null;
  variables: Record<string, unknown>;
  complexity?: {
    time: string;
    space: string;
  };
}

export interface SceneNode {
  id: string;
  type: 'element' | 'container' | 'label' | 'arrow' | 'pointer';
  x: number;
  y: number;
  width?: number;
  height?: number;
  data: Record<string, unknown>;
  children?: SceneNode[];
  highlighted?: boolean;
  color?: string;
  label?: string;
}

export interface VisualizerProps {
  state: DSState;
  highlight: string[];
  sceneGraph: SceneNode[];
  width: number;
  height: number;
  speed: number;
}

export interface PseudocodeBlock {
  line: number;
  text: string;
  indent: number;
}

export interface ComplexityInfo {
  time: string;
  space: string;
  description: string;
}