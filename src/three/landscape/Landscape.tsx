"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { fixtures } from "@/architecture/floorplan";
import { scalePlaneUVs, surface, matte } from "../materials/materials";
import { TILE_METRES } from "../materials/textures";
import { OliveTree } from "./OliveTree";

/** The site beyond the walls: dry meadow, a ring of low hills and the olive trees. */
export function Landscape() {
  const ground = useMemo(() => {
    const g = scalePlaneUVs(new THREE.PlaneGeometry(420, 420), 420, 420, TILE_METRES.earth);
    g.rotateX(-Math.PI / 2);
    return g;
  }, []);
  const hills = useMemo(() => {
    const out: { pos: [number, number, number]; scale: [number, number, number]; color: string }[] = [];
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2;
      const d = 150 + (i % 3) * 30;
      out.push({ pos: [Math.cos(a) * d, -6, Math.sin(a) * d], scale: [40 + (i % 4) * 12, 14 + (i % 5) * 5, 30], color: i % 2 ? "#9a9a74" : "#a7a07c" });
    }
    return out;
  }, []);
  const planters = fixtures.filter((f) => f.type === "rect" && f.tag === "planter") as Extract<(typeof fixtures)[number], { type: "rect" }>[];

  return (
    <group>
      <mesh geometry={ground} position={[0, -0.02, 0]} material={surface("earth")} receiveShadow />
      {hills.map((h, i) => (
        <mesh key={i} position={h.pos} scale={h.scale} material={matte(h.color, 1)}>
          <sphereGeometry args={[1, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
        </mesh>
      ))}

      {/* Forecourt planters: low limestone kerbs with olive trees in raked soil */}
      {planters.map((p, i) => {
        const w = p.x1 - p.x0;
        const d = p.z1 - p.z0;
        const cx = (p.x0 + p.x1) / 2;
        const cz = (p.z0 + p.z1) / 2;
        return (
          <group key={i}>
            <mesh position={[cx, 0.25, cz]} material={surface("limestone")} castShadow receiveShadow>
              <boxGeometry args={[w, 0.5, d]} />
            </mesh>
            <mesh position={[cx, 0.505, cz]} rotation={[-Math.PI / 2, 0, 0]} material={matte("#6f5d48", 1)} receiveShadow>
              <planeGeometry args={[w - 0.5, d - 0.5]} />
            </mesh>
            {[-2.6, 0.2, 2.8].map((dx, k) => (
              <OliveTree key={k} position={[cx + dx, 0.5, cz + (k % 2 ? 1.2 : -1.1)]} scale={1.15 - k * 0.08} seed={i * 10 + k + 3} />
            ))}
          </group>
        );
      })}

      {/* Atrium: the olive tree in its round planter, ringed by a stone bench */}
      <group>
        <mesh position={[0, 0.23, 0]} material={surface("limestone")} castShadow receiveShadow>
          <cylinderGeometry args={[2.4, 2.4, 0.46, 64]} />
        </mesh>
        <mesh position={[0, 0.47, 0]} material={matte("#6f5d48", 1)}>
          <cylinderGeometry args={[1.85, 1.85, 0.02, 48]} />
        </mesh>
        <OliveTree position={[0, 0.46, 0]} scale={1.45} seed={42} />
      </group>

      {/* Garden olives */}
      {fixtures
        .filter((f) => f.type === "circle" && f.tag === "olive")
        .map((f, i) => f.type === "circle" && <OliveTree key={i} position={[f.x, 0, f.z]} scale={1.3} seed={70 + i} />)}
    </group>
  );
}
