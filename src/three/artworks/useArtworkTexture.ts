"use client";

import { useEffect, useState } from "react";
import * as THREE from "three";
import { useMuseum } from "../state/museumStore";
import { artworkUrl } from "@/lib/paths";

const loader = new THREE.TextureLoader();
const cache = new Map<string, Promise<THREE.Texture>>();
const progress = { requested: 0, settled: 0 };

function report() {
  const ratio = progress.requested === 0 ? 1 : progress.settled / progress.requested;
  useMuseum.getState().setLoading(ratio, ratio >= 1);
}

/**
 * Loads the generated artwork image (the same SVG the website shows) as a texture.
 * Returns null while loading or if loading fails, so callers can show the bare
 * support (canvas, mat) instead of a broken image.
 */
export function useArtworkTexture(id: string, maxAnisotropy = 8): THREE.Texture | null {
  const [tex, setTex] = useState<THREE.Texture | null>(null);
  useEffect(() => {
    let alive = true;
    let p = cache.get(id);
    if (!p) {
      progress.requested++;
      report();
      p = loader.loadAsync(artworkUrl(id)).then((t) => {
        t.colorSpace = THREE.SRGBColorSpace;
        t.anisotropy = maxAnisotropy;
        t.generateMipmaps = true;
        return t;
      });
      p.finally(() => {
        progress.settled++;
        report();
      }).catch(() => undefined);
      cache.set(id, p);
    }
    p.then((t) => alive && setTex(t)).catch((err) => console.warn(`[museum] artwork texture ${id} failed`, err));
    return () => {
      alive = false;
    };
  }, [id, maxAnisotropy]);
  return tex;
}
