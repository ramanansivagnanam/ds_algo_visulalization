import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import type { VisualizerProps } from '../../types';
import type { StackData } from './StackPlugin';

const CELL_WIDTH = 200;
const CELL_HEIGHT = 50;
const GAP = 10;
const PADDING = 40;

interface StackVisualizerProps extends VisualizerProps {
  state: {
    type: 'stack';
    stack: StackData;
    highlights: string[];
    annotations: Array<{ id: string; text: string; targetId: string | null }>;
    metadata: Record<string, unknown>;
  };
}

export function StackVisualizer({ state, highlight, width, height }: StackVisualizerProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const stackState = state.stack;

  useEffect(() => {
    if (!svgRef.current || !stackState) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    if (stackState.elements.length === 0) {
      svg.append('text')
        .attr('x', width / 2)
        .attr('y', height / 2)
        .attr('text-anchor', 'middle')
        .attr('fill', '#64748b')
        .attr('font-size', '16px')
        .attr('font-family', 'Inter, sans-serif')
        .text('Empty Stack — Push elements to begin');
      return;
    }

    const elements = stackState.elements;
    const totalHeight = elements.length * (CELL_HEIGHT + GAP) - GAP + PADDING * 2;
    const startX = (width - CELL_WIDTH) / 2;
    const startY = Math.max(PADDING, (height - totalHeight) / 2 + PADDING);

    // Draw stack container background
    svg.append('rect')
      .attr('x', startX - 10)
      .attr('y', startY - 10)
      .attr('width', CELL_WIDTH + 20)
      .attr('height', totalHeight + 20)
      .attr('rx', 12)
      .attr('fill', '#0f172a')
      .attr('stroke', '#334155')
      .attr('stroke-width', 2);

    // Draw "TOP" label
    svg.append('text')
      .attr('x', startX - 20)
      .attr('y', startY + CELL_HEIGHT / 2 + 5)
      .attr('text-anchor', 'end')
      .attr('fill', '#f59e0b')
      .attr('font-size', '14px')
      .attr('font-family', 'JetBrains Mono, monospace')
      .attr('font-weight', '600')
      .text('TOP →');

    // Draw elements from bottom to top (visually top to bottom)
    elements.forEach((element, idx) => {
      const isHighlighted = highlight.includes(`element_${idx}`);
      const y = startY + (elements.length - 1 - idx) * (CELL_HEIGHT + GAP);

      const group = svg.append('g')
        .attr('class', 'stack-element')
        .attr('transform', `translate(${startX}, ${y})`);

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
        .attr('font-size', '18px')
        .attr('font-family', 'JetBrains Mono, monospace')
        .attr('font-weight', '600')
        .text(String(element.value));

      // Index label
      group.append('text')
        .attr('x', CELL_WIDTH + 10)
        .attr('y', CELL_HEIGHT / 2 + 5)
        .attr('text-anchor', 'start')
        .attr('alignment-baseline', 'middle')
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
          const y = startY + (elements.length - 1 - idx) * (CELL_HEIGHT + GAP);
          svg.append('text')
            .attr('x', startX + CELL_WIDTH / 2)
            .attr('y', y - 15)
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

  }, [stackState, highlight, state.annotations, width, height]);

  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      className="w-full h-full"
    />
  );
}
