import React, { useEffect } from 'react';

interface KeyboardShortcut {
  key: string;
  handler: (e: KeyboardEvent) => void;
  description?: string;
}

interface UseKeyboardShortcutsOptions {
  shortcuts: KeyboardShortcut[];
  enabled?: boolean;
}

export function useKeyboardShortcuts({
  shortcuts,
  enabled = true,
}: UseKeyboardShortcutsOptions) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const shortcut = shortcuts.find((s) => s.key.toLowerCase() === e.key.toLowerCase());
      if (shortcut) {
        e.preventDefault();
        shortcut.handler(e);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts, enabled]);
}

// Common keyboard shortcuts
export const commonShortcuts = {
  play: { key: ' ', description: 'Play/Pause' },
  stepForward: { key: 'ArrowRight', description: 'Step forward' },
  stepBackward: { key: 'ArrowLeft', description: 'Step backward' },
  stop: { key: 'Escape', description: 'Stop' },
  faster: { key: '+', description: 'Increase speed' },
  slower: { key: '-', description: 'Decrease speed' },
};
