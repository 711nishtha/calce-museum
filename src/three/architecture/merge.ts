import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

/** One placed piece of static ornament: a geometry and where it goes. */
export interface Part {
  geometry: THREE.BufferGeometry;
  position?: [number, number, number];
  rotation?: [number, number, number];
  /** an optional parent transform applied after the part's own (e.g. a column or an arch face) */
  parent?: THREE.Matrix4;
}

/**
 * Bakes many static parts into a single geometry so they render in one draw call
 * (and one more for the shadow pass) instead of one each.
 */
export function mergeParts(parts: Part[]): THREE.BufferGeometry {
  const baked = parts.map((p) => {
    // non-indexed throughout, so geometries of any kind can be merged together
    const g = p.geometry.index ? p.geometry.toNonIndexed() : p.geometry.clone();
    const m = new THREE.Matrix4().compose(
      new THREE.Vector3(...(p.position ?? [0, 0, 0])),
      new THREE.Quaternion().setFromEuler(new THREE.Euler(...(p.rotation ?? [0, 0, 0]))),
      new THREE.Vector3(1, 1, 1),
    );
    if (p.parent) m.premultiply(p.parent);
    g.applyMatrix4(m);
    return g;
  });
  const merged = mergeGeometries(baked, false);
  if (!merged) throw new Error("mergeParts: incompatible geometries");
  merged.computeBoundingSphere();
  return merged;
}

export const placement = (position: [number, number, number], rotationY = 0) =>
  new THREE.Matrix4().compose(new THREE.Vector3(...position), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, rotationY, 0)), new THREE.Vector3(1, 1, 1));
