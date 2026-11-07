import type * as THREE from "three";

/** Invisible hit volumes for artworks, raycast by the interaction system. */
export const artworkHits = new Set<THREE.Object3D>();

export function registerHit(o: THREE.Object3D | null, id: string) {
  if (!o) return;
  o.userData.artworkId = id;
  artworkHits.add(o);
  return () => {
    artworkHits.delete(o);
  };
}
