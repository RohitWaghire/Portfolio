import { useSyncExternalStore } from 'react';
import { SheetType } from '@/types';

let currentSheet: SheetType = null;
const listeners = new Set<() => void>();

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export function openSheet(sheet: SheetType) {
  currentSheet = sheet;
  listeners.forEach((listener) => listener());
}

export function useSheet(): SheetType {
  return useSyncExternalStore(
    subscribe,
    () => currentSheet,
    () => null
  );
}
