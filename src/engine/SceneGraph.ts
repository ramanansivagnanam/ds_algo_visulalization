import type { SceneNode } from '../types';

export class SceneGraph {
  private nodes: Map<string, SceneNode> = new Map();

  addNode(node: SceneNode): void {
    this.nodes.set(node.id, node);
  }

  removeNode(id: string): void {
    this.nodes.delete(id);
  }

  getNode(id: string): SceneNode | undefined {
    return this.nodes.get(id);
  }

  clear(): void {
    this.nodes.clear();
  }

  getNodes(): SceneNode[] {
    return Array.from(this.nodes.values());
  }

  buildTree(rootId: string): SceneNode | undefined {
    const root = this.nodes.get(rootId);
    if (!root) return undefined;

    const build = (node: SceneNode): SceneNode => {
      if (node.children) {
        node.children = node.children.map((child) => {
          const fullChild = this.nodes.get(child.id) || child;
          return build(fullChild);
        });
      }
      return { ...node };
    };

    return build(root);
  }

  updateHighlights(highlightIds: string[]): void {
    this.nodes.forEach((node) => {
      node.highlighted = highlightIds.includes(node.id);
    });
  }
}

export const sceneGraph = new SceneGraph();