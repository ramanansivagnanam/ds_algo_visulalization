import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import type { VisualizerProps } from '../../types';
import type { LinkedListData, LinkedListNode } from './LinkedListPlugin';

const NODE_WIDTH = 80;
const NODE_HEIGHT = 50;
const ARROW_WIDTH = 60;
const PADDING = 40;

interface LLVisualizerProps extends VisualizerProps {
  state: {
    type: 'linkedlist';
    linkedList: LinkedListData;
    highlights: string[];
    annotations: Array<{ id: string; text: string; targetId: string | null }>;
    metadata: Record<string, unknown>;
  };
}

export function LinkedListVisualizer({ state, highlight, width, height }: LLVisualizerProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const llState = state.linkedList;

  useEffect(() => {
    if (!svgRef.current || !llState) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    if (!llState.head || Object.keys(llState.nodes).length === 0) {
      svg.append('text')
        .attr('x', width / 2)
        .attr('y', height / 2)
        .attr('text-anchor', 'middle')
        .attr('fill', '#64748b')
        .attr('font-size', '16px')
        .attr('font-family', 'Inter, sans-serif')
        .text('Empty Linked List — Insert nodes to begin');
      return;
    }

    // Calculate positions
    const nodes: Array<{ id: string; value: number; x: number; y: number }> = [];
    let currentId: string | null = llState.head;
    let x = PADDING;
    const y = height / 2 - NODE_HEIGHT / 2;

    const visited = new Set<string>();
    while (currentId && !visited.has(currentId)) {
      visited.add(currentId);
      const nodeData: LinkedListNode = llState.nodes[currentId];
      nodes.push({ id: currentId, value: nodeData.value, x, y });
      x += NODE_WIDTH + ARROW_WIDTH;
      currentId = nodeData.next;
    }

    // Draw arrows first (so they appear behind nodes)
    for (let i = 0; i < nodes.length - 1; i++) {
      const startX = nodes[i].x + NODE_WIDTH;
      const startY = nodes[i].y + NODE_HEIGHT / 2;
      const endX = nodes[i + 1].x;
      const endY = nodes[i + 1].y + NODE_HEIGHT / 2;

      const arrowGroup = svg.append('g')
        .attr('class', 'arrow')
        .attr('transform', `translate(${startX}, ${startY})`);

      // Arrow line
      arrowGroup.append('line')
        .attr('x1', 0)
        .attr('y1', 0)
        .attr('x2', ARROW_WIDTH)
        .attr('y2', 0)
        .attr('stroke', '#475569')
        .attr('stroke-width', 3)
        .attr('marker-end', 'url(#arrowhead)');

      // Arrowhead marker definition
      if (i === 0) {
        svg.append('defs')
          .append('marker')
          .attr('id', 'arrowhead')
          .attr('markerWidth', 10)
          .attr('markerHeight', 7)
          .attr('refX', 9)
          .attr('refY', 3.5)
          .attr('orient', 'auto')
          .append('polygon')
          .attr('points', '0 0, 10 3.5, 0 7')
          .attr('fill', '#475569');
      }
    }

    // Draw nodes
    const nodeGroups = svg.selectAll('g.node')
      .data(nodes)
      .join('g')
      .attr('class', 'node')
      .attr('transform', (d) => `translate(${d.x}, ${d.y})`);

    // Node background (rounded rectangle split into two parts)
    nodeGroups.each(function(datum, index) {
      const group = d3.select(this);
      const datumTyped = nodes[index];
      
      // Value part (left 65%)
      group.append('rect')
        .attr('width', NODE_WIDTH * 0.65)
        .attr('height', NODE_HEIGHT)
        .attr('rx', 8)
        .attr('ry', 8)
        .attr('fill', highlight.includes(datumTyped.id) ? '#3b82f6' : '#1e293b')
        .attr('stroke', highlight.includes(datumTyped.id) ? '#60a5fa' : '#475569')
        .attr('stroke-width', highlight.includes(datumTyped.id) ? 3 : 2);

      // Pointer part (right 35%)
      group.append('rect')
        .attr('x', NODE_WIDTH * 0.65)
        .attr('width', NODE_WIDTH * 0.35)
        .attr('height', NODE_HEIGHT)
        .attr('rx', 0)
        .attr('ry', 0)
        .attr('fill', '#0f172a')
        .attr('stroke', '#475569')
        .attr('stroke-width', 2);

      // Value text
      group.append('text')
        .attr('x', NODE_WIDTH * 0.65 / 2)
        .attr('y', NODE_HEIGHT / 2 + 5)
        .attr('text-anchor', 'middle')
        .attr('fill', '#f1f5f9')
        .attr('font-size', '18px')
        .attr('font-family', 'JetBrains Mono, monospace')
        .attr('font-weight', '600')
        .text(String(datumTyped.value));

      // Pointer symbol
      group.append('text')
        .attr('x', NODE_WIDTH * 0.65 + NODE_WIDTH * 0.35 / 2)
        .attr('y', NODE_HEIGHT / 2 + 5)
        .attr('text-anchor', 'middle')
        .attr('fill', '#64748b')
        .attr('font-size', '14px')
        .attr('font-family', 'JetBrains Mono, monospace')
        .text('→');
    });

    // Draw head label
    svg.append('text')
      .attr('x', nodes[0].x - 10)
      .attr('y', nodes[0].y - 15)
      .attr('text-anchor', 'end')
      .attr('fill', '#3b82f6')
      .attr('font-size', '14px')
      .attr('font-family', 'JetBrains Mono, monospace')
      .attr('font-weight', '600')
      .text('HEAD →');

    // Draw annotations
    if (state.annotations && state.annotations.length > 0) {
      state.annotations.forEach((annotation, idx) => {
        if (annotation.targetId) {
          const node = nodes.find((n) => n.id === annotation.targetId);
          if (node) {
            svg.append('text')
              .attr('x', node.x + NODE_WIDTH / 2)
              .attr('y', node.y - 20)
              .attr('text-anchor', 'middle')
              .attr('fill', '#10b981')
              .attr('font-size', '12px')
              .attr('font-family', 'Inter, sans-serif')
              .attr('font-weight', '500')
              .text(annotation.text);
          }
        } else {
          // Global annotation
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

  }, [llState, highlight, state.annotations, width, height]);

  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      className="w-full h-full"
    />
  );
}
