"use client";

import { create } from "zustand";
import type { RoomId } from "@/content/types";

export type MuseumMode = "intro" | "walk" | "tour";
export type Quality = "high" | "balanced";

export interface CameraTarget {
  position: [number, number, number];
  /** point to look at once arrived */
  lookAt: [number, number, number];
  /** seconds; 0 jumps instantly */
  duration?: number;
}

interface MuseumState {
  mode: MuseumMode;
  /** pointer is captured for mouse-look */
  locked: boolean;
  /** a panel (artwork, directory, map) is open; movement input is ignored */
  panel: "none" | "artwork" | "directory" | "help";
  room: RoomId | null;
  focusedArtworkId: string | null;
  openArtworkId: string | null;
  tourIndex: number;
  quality: Quality;
  touch: boolean;
  /** pending scripted camera move, consumed by the player controller */
  cameraTarget: CameraTarget | null;
  /** while a scripted move is animating */
  travelling: boolean;
  /** live position for the minimap, updated at a low rate */
  pose: { x: number; z: number; yaw: number };
  loadingProgress: number;
  ready: boolean;

  setMode: (m: MuseumMode) => void;
  setLocked: (v: boolean) => void;
  setPanel: (p: MuseumState["panel"]) => void;
  setRoom: (r: RoomId | null) => void;
  setFocused: (id: string | null) => void;
  openArtwork: (id: string) => void;
  closeArtwork: () => void;
  setTourIndex: (i: number) => void;
  setQuality: (q: Quality) => void;
  setTouch: (v: boolean) => void;
  goTo: (t: CameraTarget) => void;
  consumeCameraTarget: () => CameraTarget | null;
  setTravelling: (v: boolean) => void;
  setPose: (p: MuseumState["pose"]) => void;
  setLoading: (progress: number, ready: boolean) => void;
}

export const useMuseum = create<MuseumState>()((set, get) => ({
  mode: "intro",
  locked: false,
  panel: "none",
  room: null,
  focusedArtworkId: null,
  openArtworkId: null,
  tourIndex: 0,
  quality: "high",
  touch: false,
  cameraTarget: null,
  travelling: false,
  pose: { x: 0, z: 39, yaw: 0 },
  loadingProgress: 0,
  ready: false,

  setMode: (mode) => set({ mode }),
  setLocked: (locked) => set({ locked }),
  setPanel: (panel) => set({ panel }),
  setRoom: (room) => (get().room === room ? undefined : set({ room })),
  setFocused: (focusedArtworkId) => (get().focusedArtworkId === focusedArtworkId ? undefined : set({ focusedArtworkId })),
  openArtwork: (id) => set({ openArtworkId: id, panel: "artwork" }),
  closeArtwork: () => set({ openArtworkId: null, panel: "none" }),
  setTourIndex: (tourIndex) => set({ tourIndex }),
  setQuality: (quality) => set({ quality }),
  setTouch: (touch) => set({ touch }),
  goTo: (cameraTarget) => set({ cameraTarget }),
  consumeCameraTarget: () => {
    const t = get().cameraTarget;
    if (t) set({ cameraTarget: null });
    return t;
  },
  setTravelling: (travelling) => set({ travelling }),
  setPose: (pose) => set({ pose }),
  setLoading: (loadingProgress, ready) => set({ loadingProgress, ready }),
}));

/** Input that the touch controls write and the player controller reads every frame (no React renders). */
export const touchInput = { moveX: 0, moveY: 0, lookX: 0, lookY: 0 };
