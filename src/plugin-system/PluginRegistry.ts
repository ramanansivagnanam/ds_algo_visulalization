import type { DataStructurePlugin } from '../types';

export class PluginRegistry {
  private plugins: Map<string, DataStructurePlugin> = new Map();

  register(plugin: DataStructurePlugin): void {
    if (this.plugins.has(plugin.id)) {
      console.warn(`Plugin "${plugin.id}" is already registered. Overwriting.`);
    }
    this.plugins.set(plugin.id, plugin);
  }

  get(id: string): DataStructurePlugin | undefined {
    return this.plugins.get(id);
  }

  getAll(): DataStructurePlugin[] {
    return Array.from(this.plugins.values());
  }

  getByCategory(category: DataStructurePlugin['category']): DataStructurePlugin[] {
    return this.getAll().filter((p) => p.category === category);
  }

  unregister(id: string): boolean {
    return this.plugins.delete(id);
  }

  has(id: string): boolean {
    return this.plugins.has(id);
  }

  get ids(): string[] {
    return Array.from(this.plugins.keys());
  }
}

export const pluginRegistry = new PluginRegistry();