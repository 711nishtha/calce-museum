"use client";

import { create } from "zustand";
import { createJSONStorage, persist, type StateStorage } from "zustand/middleware";

/** localStorage can throw in private windows; fall back to memory. */
const safeStorage: StateStorage = {
  getItem: (k) => {
    try {
      return localStorage.getItem(k);
    } catch {
      return null;
    }
  },
  setItem: (k, v) => {
    try {
      localStorage.setItem(k, v);
    } catch {
      /* ignore */
    }
  },
  removeItem: (k) => {
    try {
      localStorage.removeItem(k);
    } catch {
      /* ignore */
    }
  },
};

interface BagState {
  items: Record<string, number>;
  add: (id: string) => void;
  remove: (id: string) => void;
  clear: () => void;
}

export const useBag = create<BagState>()(
  persist(
    (set) => ({
      items: {},
      add: (id) => set((s) => ({ items: { ...s.items, [id]: Math.min(9, (s.items[id] ?? 0) + 1) } })),
      remove: (id) =>
        set((s) => {
          const next = { ...s.items };
          if ((next[id] ?? 0) > 1) next[id]! -= 1;
          else delete next[id];
          return { items: next };
        }),
      clear: () => set({ items: {} }),
    }),
    { name: "calce.bag", storage: createJSONStorage(() => safeStorage), skipHydration: true },
  ),
);
