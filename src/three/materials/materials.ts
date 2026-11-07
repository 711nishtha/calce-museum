/**
 * Shared physically based materials. Created once and reused across the scene so
 * that walls in every room batch onto the same shader programs.
 */
import * as THREE from "three";
import { sculptureColours } from "@/graphics/artwork-svg";
import type { SculptureMaterial } from "@/content/types";
import { surfaceTexture, type Surface } from "./textures";

const cache = new Map<string, THREE.Material>();

function memo<T extends THREE.Material>(key: string, make: () => T): T {
  const hit = cache.get(key);
  if (hit) return hit as T;
  const m = make();
  cache.set(key, m);
  return m;
}

const roughness: Record<Surface, number> = {
  limestone: 0.82,
  ashlar: 0.9,
  plaster: 0.94,
  travertine: 0.7,
  oak: 0.62,
  terracotta: 0.85,
  gravel: 1,
  earth: 1,
  nightPlaster: 0.95,
};

export function surface(s: Surface): THREE.MeshStandardMaterial {
  return memo(`surface:${s}`, () => {
    const map = surfaceTexture(s);
    const mat = new THREE.MeshStandardMaterial({ map, roughness: roughness[s] });
    if (s !== "plaster" && s !== "nightPlaster") {
      mat.bumpMap = map;
      mat.bumpScale = s === "ashlar" || s === "limestone" ? 0.18 : 0.5;
    }
    return mat;
  });
}

export const matte = (color: string, rough = 0.9) => memo(`matte:${color}:${rough}`, () => new THREE.MeshStandardMaterial({ color, roughness: rough }));

export function sculptureMaterial(m: SculptureMaterial): THREE.MeshStandardMaterial {
  return memo(`sculpture:${m}`, () => {
    const c = sculptureColours[m];
    if (m === "bronze") return new THREE.MeshStandardMaterial({ color: "#6b4a2c", metalness: 0.85, roughness: 0.38 });
    if (m === "limestone") return new THREE.MeshStandardMaterial({ color: c.light, roughness: 0.85, map: surfaceTexture("limestone"), bumpMap: surfaceTexture("limestone"), bumpScale: 0.8 });
    if (m === "travertine") return new THREE.MeshStandardMaterial({ color: "#f2e6cf", roughness: 0.78, map: surfaceTexture("travertine"), bumpMap: surfaceTexture("travertine"), bumpScale: 1.2 });
    if (m === "terracotta") return new THREE.MeshStandardMaterial({ color: "#c27552", roughness: 0.88, map: surfaceTexture("terracotta", 256), bumpMap: surfaceTexture("terracotta", 256), bumpScale: 0.3 });
    if (m === "oak") return new THREE.MeshStandardMaterial({ color: c.light, roughness: 0.6, map: surfaceTexture("oak") });
    return new THREE.MeshStandardMaterial({ color: c.light, roughness: 0.4 });
  });
}

export const glass = () =>
  memo("glass", () => new THREE.MeshPhysicalMaterial({ color: "#dfe9e6", metalness: 0, roughness: 0.05, transmission: 0, transparent: true, opacity: 0.18, depthWrite: false }));

export const diffuser = () => memo("diffuser", () => new THREE.MeshStandardMaterial({ color: "#fffaf0", emissive: "#fff3dc", emissiveIntensity: 1.25, roughness: 1 }));

/** Scale a geometry's UVs so that one texture repeat equals `tile` metres. */
export function scaleBoxUVs(geo: THREE.BoxGeometry, w: number, h: number, d: number, tile: number) {
  const uv = geo.attributes.uv as THREE.BufferAttribute;
  // BoxGeometry faces: +x, -x, +y, -y, +z, -z (4 vertices each)
  const dims: [number, number][] = [
    [d, h],
    [d, h],
    [w, d],
    [w, d],
    [w, h],
    [w, h],
  ];
  for (let f = 0; f < 6; f++) {
    const [fu, fv] = dims[f]!;
    for (let k = 0; k < 4; k++) {
      const i = f * 4 + k;
      uv.setXY(i, (uv.getX(i) * fu) / tile, (uv.getY(i) * fv) / tile);
    }
  }
  uv.needsUpdate = true;
  return geo;
}

export function scalePlaneUVs(geo: THREE.BufferGeometry, w: number, h: number, tile: number) {
  const uv = geo.attributes.uv as THREE.BufferAttribute;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, (uv.getX(i) * w) / tile, (uv.getY(i) * h) / tile);
  uv.needsUpdate = true;
  return geo;
}
