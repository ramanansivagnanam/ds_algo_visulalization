import type { DataStructurePlugin } from '../types';

export class PluginLoader {
  private loaders: Map<string, () => Promise<DataStructurePlugin>> = new Map();

  registerLoader(id: string, loader: () => Promise<DataStructurePlugin>): void {
    this.loaders.set(id, loader);
  }

  async load(id: string): Promise<DataStructurePlugin> {
    const loader = this.loaders.get(id);
    if (!loader) {
      throw new Error(`No loader registered for plugin "${id}"`);
    }
    return loader();
  }

  async loadAll(): Promise<DataStructurePlugin[]> {
    const plugins: DataStructurePlugin[] = [];
    for (const [id] of this.loaders) {
      const plugin = await this.load(id);
      plugins.push(plugin);
    }
    return plugins;
  }
}

export const pluginLoader = new PluginLoader();