import React from 'react';
import { VisualizationState } from '../../types/plugin';

interface VisualizationCanvasProps<T = any> {
  state: VisualizationState<T>;
  width?: number;
  height?: number;
  renderFn: (state: VisualizationState<T>, ctx: CanvasRenderingContext2D) => void;
}

export const VisualizationCanvas = <T,>({
  state,
  width = 800,
  height = 600,
  renderFn,
}: VisualizationCanvasProps<T>) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);
    renderFn(state, ctx);
  }, [state, width, height, renderFn]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="visualization-canvas"
    />
  );
};
