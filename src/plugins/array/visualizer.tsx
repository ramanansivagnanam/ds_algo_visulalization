import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import type { VisualizerProps, DSState } from '../../types';

interface ArrayState extends DSState {
  elements: (number | string | null)[];
  size: number;
}

const CELL_WIDTH = 60;
const CELL_HEIGHT = 50;
const CELL_GAP = 8;
const PADDING = 20;
const INDEX_HEIGHT = 24;

export function ArrayVisualizer({ state, highlight, width, height }: VisualizerProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const arrState = state as ArrayState;

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    if (!arrState || !arrState.elements) {
      svg.append('text')
        .attr('x', width / 2)
        .attr('y', height / 2)
        .attr('text-anchor', 'middle')
        .attr('fill', '#94a3b8')
        .attr('font-size', '14px')
        .attr('font-family', 'Inter, sans-serif')
        .text('Select a data structure to begin');
      return;
    }

    const elements = arrState.elements;
    const totalWidth = elements.length * (CELL_WIDTH + CELL_GAP) - CELL_GAP + PADDING * 2;
    const startX = Math.max(PADDING, (width - totalWidth) / 2 + PADDING);
    const startY = (height - CELL_HEIGHT - INDEX_HEIGHT) / 2;

    // Create a group for each element
    const groups = svg.selectAll('g.cell')
      .data(elements)
      .join('g')
      .attr('class', 'cell')
      .attr('transform', (_d: unknown, i: number) =>
        `translate(${startX + i * (CELL_WIDTH + CELL_GAP)}, ${startY})`
      );

    // Cell background
    groups.append('rect')
      .attr('width', CELL_WIDTH)
      .attr('height', CELL_HEIGHT)
      .attr('rx', 6)
      .attr('fill', (_d: unknown, i: number) =>
        highlight.includes(`idx-${i}`) ? '#3b82f6' : '#1e293b'
      )
      .attr('stroke', (_d: unknown, i: number) =>
        highlight.includes(`idx-${i}`) ? '#60a5fa' : '#334155'
      )
      .attr('stroke-width', (_d: unknown, i: number) =>
        highlight.includes(`idx-${i}`) ? 2 : 1
      )
      .transition()
      .duration(300)
      .attr('fill', (_d: unknown, i: number) =>
        highlight.includes(`idx-${i}`) ? '#3b82f6' : '#1e293b'
      )
      .attr('stroke', (_d: unknown, i: number) =>
        highlight.includes(`idx-${i}`) ? '#60a5fa' : '#334155'
      );

    // Cell value text
    groups.append('text')
      .attr('x', CELL_WIDTH / 2)
      .attr('y', CELL_HEIGHT / 2 + 5)
      .attr('text-anchor', 'middle')
      .attr('fill', '#f1f5f9')
      .attr('font-size', '16px')
      .attr('font-family', 'JetBrains Mono, monospace')
      .attr('font-weight', '500')
      .text((d: unknown) => d === null || d === undefined ? '' : String(d));

    // Index label below each cell
    groups.append('text')
      .attr('x', CELL_WIDTH / 2)
      .attr('y', CELL_HEIGHT + 18)
      .attr('text-anchor', 'middle')
      .attr('fill', '#64748b')
      .attr('font-size', '12px')
      .attr('font-family', 'JetBrains Mono, monospace')
      .text((_d: unknown, i: number) => String(i));

    // Empty state
    if (elements.length === 0) {
      svg.append('text')
        .attr('x', width / 2)
        .attr('y', height / 2)
        .attr('text-anchor', 'middle')
        .attr('fill', '#64748b')
        .attr('font-size', '14px')
        .attr('font-family', 'Inter, sans-serif')
        .text('Empty Array — run an operation to add elements');
    }

  }, [arrState, highlight, width, height]);

  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      className="w-full h-full"
    />
  );
}