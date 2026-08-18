import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import type { VisualizerProps } from '../../types';
import type { QueueData } from './QueuePlugin';

const CELL_WIDTH = 120;
const CELL_HEIGHT = 60;
const GAP = 15;
const PADDING = 60;

interface QueueVisualizerProps extends VisualizerProps {
  state: {
    type: 'queue';
    queue: QueueData;
    highlights: string[];
    annotations: Array<{ id: string; text: string; targetId: string | null }>;
    metadata: Record<string, unknown>;
  };
}

export function QueueVisualizer({ state, highlight, width, height }: QueueVisualizerProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const queueState = state.queue;

  useEffect(() => {
    if (!svgRef.current || !queueState) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    if (queueState.elements.length === 0) {
      svg.append('text')
        .attr('x', width / 2)
        .attr('y', height / 2)
        .attr('text-anchor', 'middle')
        .attr('fill', '#64748b')
        .attr('font-size', '16px')
        .attr('font-family', 'Inter, sans-serif')
        .text('Empty Queue — Enqueue elements to begin');
      return;
    }

    const elements = queueState.elements;
    const totalWidth = elements.length * (CELL_WIDTH + GAP) - GAP + PADDING * 2;
    const startX = Math.max(PADDING, (width - totalWidth) / 2 + PADDING);
    const startY = (height - CELL_HEIGHT) / 2;

    // Draw queue container background
    svg.append('rect')
      .attr('x', startX - 15)
      .attr('y', startY - 15)
      .attr('width', totalWidth + 30)
      .attr('height', CELL_HEIGHT + 30)
      .attr('rx', 12)
      .attr('fill', '#0f172a')
      .attr('stroke', '#334155')
      .attr('stroke-width', 2);

    // Draw "FRONT" label
    svg.append('text')
      .attr('x', startX - 20)
      .attr('y', startY + CELL_HEIGHT / 2 + 5)
      .attr('text-anchor', 'end')
      .attr('dominant-baseline', 'middle')
      .attr('fill', '#10b981')
      .attr('font-size', '14px')
      .attr('font-family', 'JetBrains Mono, monospace')
      .attr('font-weight', '600')
      .text('FRONT →');

    // Draw "REAR" label
    const rearX = startX + (elements.length - 1) * (CELL_WIDTH + GAP) + CELL_WIDTH + 20;
    svg.append('text')
      .attr('x', rearX)
      .attr('y', startY + CELL_HEIGHT / 2 + 5)
      .attr('text-anchor', 'start')
      .attr('dominant-baseline', 'middle')
      .attr('fill', '#f59e0b')
      .attr('font-size', '14px')
      .attr('font-family', 'JetBrains Mono, monospace')
      .attr('font-weight', '600')
      .text('← REAR');

    // Draw arrows for FIFO flow
    for (let i = 0; i < elements.length - 1; i++) {
      const arrowX = startX + i * (CELL_WIDTH + GAP) + CELL_WIDTH;
      svg.append('line')
        .attr('x1', arrowX)
        .attr('y1', startY + CELL_HEIGHT / 2)
        .attr('x2', arrowX + GAP)
        .attr('y2', startY + CELL_HEIGHT / 2)
        .attr('stroke', '#475569')
        .attr('stroke-width', 3)
        .attr('marker-end', 'url(#queue-arrow)');
    }

    // Arrowhead marker
    svg.append('defs')
      .append('marker')
      .attr('id', 'queue-arrow')
      .attr('markerWidth', 10)
      .attr('markerHeight', 7)
      .attr('refX', 9)
      .attr('refY', 3.5)
      .attr('orient', 'auto')
      .append('polygon')
      .attr('points', '0 0, 10 3.5, 0 7')
      .attr('fill', '#475569');

    // Draw elements
    elements.forEach((value, idx) => {
      const isHighlighted = highlight.includes(`element_${idx}`);
      const x = startX + idx * (CELL_WIDTH + GAP);

      const group = svg.append('g')
        .attr('class', 'queue-element')
        .attr('transform', `translate(${x}, ${startY})`);

      // Cell background
      group.append('rect')
        .attr('width', CELL_WIDTH)
        .attr('height', CELL_HEIGHT)
        .attr('rx', 8)
        .attr('fill', isHighlighted ? '#3b82f6' : '#1e293b')
        .attr('stroke', isHighlighted ? '#60a5fa' : '#475569')
        .attr('stroke-width', isHighlighted ? 3 : 2)
        .transition()
        .duration(300)
        .attr('fill', isHighlighted ? '#3b82f6' : '#1e293b');

      // Value text
      group.append('text')
        .attr('x', CELL_WIDTH / 2)
        .attr('y', CELL_HEIGHT / 2 + 5)
        .attr('text-anchor', 'middle')
        .attr('fill', '#f1f5f9')
        .attr('font-size', '20px')
        .attr('font-family', 'JetBrains Mono, monospace')
        .attr('font-weight', '600')
        .text(String(value));

      // Index label below
      group.append('text')
        .attr('x', CELL_WIDTH / 2)
        .attr('y', CELL_HEIGHT + 18)
        .attr('text-anchor', 'middle')
        .attr('fill', '#64748b')
        .attr('font-size', '12px')
        .attr('font-family', 'JetBrains Mono, monospace')
        .text(`[${idx}]`);
    });

    // Draw annotations
    if (state.annotations && state.annotations.length > 0) {
      state.annotations.forEach((annotation) => {
        if (annotation.targetId) {
          const idx = parseInt(annotation.targetId.split('_')[1]);
          const x = startX + idx * (CELL_WIDTH + GAP) + CELL_WIDTH / 2;
          svg.append('text')
            .attr('x', x)
            .attr('y', startY - 20)
            .attr('text-anchor', 'middle')
            .attr('fill', '#10b981')
            .attr('font-size', '12px')
            .attr('font-family', 'Inter, sans-serif')
            .attr('font-weight', '500')
            .text(annotation.text);
        } else {
          svg.append('text')
            .attr('x', width / 2)
            .attr('y', height - 30)
            .attr('text-anchor', 'middle')
            .attr('fill', '#f59e0b')
            .attr('font-size', '14px')
            .attr('font-family', 'Inter, sans-serif')
            .attr('font-weight', '500')
            .text(annotation.text);
        }
      });
    }

  }, [queueState, highlight, state.annotations, width, height]);

  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      className="w-full h-full"
    />
  );
}
