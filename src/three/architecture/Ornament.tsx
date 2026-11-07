"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { ATRIUM, WALL_THICKNESS, fixtures, openings, roomAt } from "@/architecture/floorplan";
import { giltMaterial, marbleWhite, matte, surface } from "../materials/materials";
import { mergeParts, placement, type Part } from "./merge";
import { meanderTexture } from "./RoyalSalon";

const PILASTER_TOP = 7.7;

/**
 * Static ornament — atrium pilasters, the floor medallion and arch surrounds — baked into
 * one geometry per material, so the whole set costs a handful of draw calls.
 */
function useOrnamentGeometry() {
  return useMemo(() => {
    const marble: Part[] = [];
    const gilt: Part[] = [];
    const limestone: Part[] = [];
    const dark: Part[] = [];
    const light: Part[] = [];
    const terracotta: Part[] = [];

    // Atrium pilasters
    const shaft = new THREE.CylinderGeometry(0.2, 0.24, PILASTER_TOP - 0.6, 20);
    const base = new THREE.BoxGeometry(0.62, 0.3, 0.4);
    const capital = new THREE.BoxGeometry(0.6, 0.18, 0.44);
    const collar = new THREE.TorusGeometry(0.22, 0.03, 8, 24);
    for (const f of fixtures) {
      if (f.type !== "circle" || f.tag !== "pilaster") continue;
      const a = Math.atan2(f.z - ATRIUM.cz, f.x - ATRIUM.cx);
      const parent = placement([f.x, 0, f.z], -a + Math.PI / 2);
      marble.push({ geometry: base, position: [0, 0.15, 0], parent });
      marble.push({ geometry: shaft, position: [0, 0.3 + (PILASTER_TOP - 0.6) / 2, 0], parent });
      marble.push({ geometry: capital, position: [0, PILASTER_TOP - 0.2, 0], parent });
      gilt.push({ geometry: collar, position: [0, PILASTER_TOP - 0.33, 0], rotation: [Math.PI / 2, 0, 0], parent });
    }
    const r = ATRIUM.r - WALL_THICKNESS / 2;
    marble.push({ geometry: new THREE.TorusGeometry(r - 0.06, 0.1, 6, 128), position: [ATRIUM.cx, PILASTER_TOP + 0.58, ATRIUM.cz], rotation: [Math.PI / 2, 0, 0] });
    gilt.push({ geometry: new THREE.TorusGeometry(r - 0.04, 0.035, 6, 128), position: [ATRIUM.cx, PILASTER_TOP, ATRIUM.cz], rotation: [Math.PI / 2, 0, 0] });

    // Atrium floor medallion: rings and a sixteen-point star
    const ring = (inner: number, outer: number, to: Part[], start = 0, length = Math.PI * 2) =>
      to.push({ geometry: new THREE.RingGeometry(inner, outer, 96, 1, start, length), position: [ATRIUM.cx, 0.006, ATRIUM.cz], rotation: [-Math.PI / 2, 0, 0] });
    ring(2.45, 2.7, dark);
    ring(2.7, 2.78, terracotta);
    for (let i = 0; i < 16; i++) ring(2.78, 5.4, i % 2 ? dark : light, (i / 16) * Math.PI * 2, (Math.PI * 2) / 16);
    ring(5.4, 5.5, terracotta);
    ring(5.5, 5.75, dark);

    // Moulded surrounds with a keystone on both faces of every arch (gilt in the Royal Salon)
    for (const o of openings) {
      if (o.kind !== "arch") continue;
      for (const side of [1, -1]) {
        const [nx, nz] = o.axis === "x" ? [0, side] : [side, 0];
        const probe = roomAt(o.center[0] + nx * 0.7, o.center[1] + nz * 0.7);
        const off = WALL_THICKNESS / 2 + 0.03;
        const rotY = o.axis === "x" ? (side > 0 ? 0 : Math.PI) : side > 0 ? Math.PI / 2 : -Math.PI / 2;
        const parent = placement([o.center[0] + nx * off, 0, o.center[1] + nz * off], rotY);
        const to = probe?.id === "gallery-royal" ? gilt : limestone;
        const rr = o.width / 2 + 0.09;
        to.push({ geometry: new THREE.TorusGeometry(rr, 0.065, 8, 40, Math.PI), position: [0, o.spring, 0], parent });
        for (const s of [-1, 1]) to.push({ geometry: new THREE.BoxGeometry(0.13, o.spring, 0.08), position: [s * rr, o.spring / 2, 0], parent });
        to.push({ geometry: new THREE.BoxGeometry(0.26, 0.34, 0.1), position: [0, o.spring + rr + 0.05, 0.01], parent });
      }
    }
    const merged = { marble, gilt, limestone, dark, light, terracotta };
    return Object.fromEntries(Object.entries(merged).map(([k, parts]) => [k, mergeParts(parts)])) as Record<keyof typeof merged, THREE.BufferGeometry>;
  }, []);
}

export function Ornament() {
  const g = useOrnamentGeometry();
  const frieze = useMemo(() => new THREE.MeshStandardMaterial({ map: meanderTexture((2 * Math.PI * ATRIUM.r) / 0.9), side: THREE.BackSide, roughness: 0.6 }), []);
  const r = ATRIUM.r - WALL_THICKNESS / 2;
  return (
    <group>
      <mesh geometry={g.marble} material={marbleWhite()} castShadow receiveShadow />
      <mesh geometry={g.gilt} material={giltMaterial()} />
      <mesh geometry={g.limestone} material={surface("limestone")} castShadow />
      <mesh geometry={g.dark} material={matte("#2f2722", 0.35)} receiveShadow />
      <mesh geometry={g.light} material={marbleWhite()} receiveShadow />
      <mesh geometry={g.terracotta} material={matte("#a75f40", 0.6)} receiveShadow />
      {/* Greek-key frieze band round the drum, above the pilasters */}
      <mesh position={[ATRIUM.cx, PILASTER_TOP + 0.28, ATRIUM.cz]} material={frieze}>
        <cylinderGeometry args={[r - 0.01, r - 0.01, 0.5, 128, 1, true]} />
      </mesh>
    </group>
  );
}
