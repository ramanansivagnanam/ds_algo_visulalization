import { create } from 'zustand';
import type { DataStructurePlugin } from '../types';
import { pluginRegistry } from '../plugin-system';
import { visualizationEngine } from '../engine';

interface PluginState {
  plugins: DataStructurePlugin[];
  activePluginId: string | null;
  activePlugin: DataStructurePlugin | null;

  selectPlugin: (id: string) => void;
  registerPlugin: (plugin: DataStructurePlugin) => void;
}

export const usePluginStore = create<PluginState>((set) => ({
  plugins: pluginRegistry.getAll(),
  activePluginId: null,
  activePlugin: null,

  selectPlugin: (id: string) => {
    const plugin = pluginRegistry.get(id);
    if (plugin) {
      visualizationEngine.loadPlugin(plugin);
      set({
        activePluginId: id,
        activePlugin: plugin,
      });
    }
  },

  registerPlugin: (plugin: DataStructurePlugin) => {
    pluginRegistry.register(plugin);
    set({ plugins: pluginRegistry.getAll() });
  },
}));