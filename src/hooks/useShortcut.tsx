import { useEffect } from 'react';

type ModifierKey = 'ctrl' | 'shift' | 'alt' | 'meta';

type Key = string;

type Shortcut = (ModifierKey | Key)[];

export function useShortcut(keys: Shortcut, callback: (event: KeyboardEvent) => void) {
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const pressedKeys: string[] = [];

      if (event.ctrlKey) pressedKeys.push('ctrl');
      if (event.shiftKey) pressedKeys.push('shift');
      if (event.altKey) pressedKeys.push('alt');
      if (event.metaKey) pressedKeys.push('meta');

      pressedKeys.push(event.key.toLowerCase());

      if (keys.sort().join('+') === pressedKeys.sort().join('+')) {
        event.preventDefault();
        callback(event);
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [keys, callback]);
}
