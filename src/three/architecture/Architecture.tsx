"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { ATRIUM, ATRIUM_OPENING_HALF_ANGLE, WALL_THICKNESS, openings, type Opening } from "@/architecture/floorplan";
import { diffuser, matte, surface } from "../materials/materials";
import { TILE_METRES } from "../materials/textures";
import { buildCeilings, buildFloors, buildWalls, drumSection, type SkylightRect } from "./buildArchitecture";

/** Wall panel above an opening, with a semicircular arch cut from its underside. */
function lintelGeometry(o: Opening): THREE.ExtrudeGeometry {
  const w = o.width;
  const s = o.spring;
  const H = o.wallHeight;
  const shape = new THREE.Shape();
  shape.moveTo(-w / 2, s);
  shape.lineTo(-w / 2, H);
  shape.lineTo(w / 2, H);
  shape.lineTo(w / 2, s);
  shape.absarc(0, s, w / 2, 0, Math.PI, false);
  const g = new THREE.ExtrudeGeometry(shape, { depth: WALL_THICKNESS, bevelEnabled: false, curveSegments: 24 });
  const uv = g.attributes.uv as THREE.BufferAttribute;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) / TILE_METRES.plaster, uv.getY(i) / TILE_METRES.plaster);
  g.translate(0, 0, -WALL_THICKNESS / 2);
  if (o.axis === "z") g.rotateY(Math.PI / 2);
  g.translate(o.center[0], 0, o.center[1]);
  return g;
}

function Lintels() {
  const items = useMemo(() => openings.map((o) => ({ o, geo: lintelGeometry(o) })), []);
  return (
    <>
      {items.map(({ o, geo }) => (
        <mesh key={o.id} geometry={geo} material={[o.kind === "arch" ? surface("plaster") : surface("ashlar"), surface("limestone")]} castShadow receiveShadow />
      ))}
    </>
  );
}

/** Slim bronze frames marking the glazed garden doors, left open in summer. */
function GlazedFrames() {
  const bronze = matte("#4a3a2c", 0.5);
  return (
    <>
      {openings
        .filter((o) => o.kind === "glazed" || o.kind === "portal")
        .map((o) => {
          const rot = o.axis === "z" ? Math.PI / 2 : 0;
          const r = o.width / 2;
          return (
            <group key={o.id} position={[o.center[0], 0, o.center[1]]} rotation={[0, rot, 0]}>
              <mesh position={[0, o.spring, 0]} material={bronze}>
                <torusGeometry args={[r - 0.04, 0.035, 8, 48, Math.PI]} />
              </mesh>
              {[-1, 1].map((sd) => (
                <mesh key={sd} position={[sd * (r - 0.04), o.spring / 2, 0]} material={bronze}>
                  <boxGeometry args={[0.07, o.spring, 0.07]} />
                </mesh>
              ))}
            </group>
          );
        })}
    </>
  );
}

function Atrium() {
  const geo = useMemo(() => {
    const a = ATRIUM_OPENING_HALF_ANGLE;
    const q = Math.PI / 2;
    const inner: THREE.BufferGeometry[] = [];
    const outer: THREE.BufferGeometry[] = [];
    const rIn = ATRIUM.r - WALL_THICKNESS / 2;
    const rOut = ATRIUM.r + WALL_THICKNESS / 2;
    for (let k = 0; k < 4; k++) {
      inner.push(drumSection(rIn, k * q + a, (k + 1) * q - a, 0, ATRIUM.height));
      outer.push(drumSection(rOut, k * q + a, (k + 1) * q - a, 0, ATRIUM.height));
      // above each passage opening
      inner.push(drumSection(rIn, k * q - a, k * q + a, 4.4, ATRIUM.height));
      outer.push(drumSection(rOut, k * q - a, k * q + a, 4.4, ATRIUM.height));
    }
    return { inner, outer, rIn, rOut };
  }, []);
  const plasterBack = useMemo(() => {
    const m = surface("plaster").clone();
    m.side = THREE.BackSide;
    return m;
  }, []);
  const roofMat = useMemo(() => {
    const m = surface("plaster").clone();
    m.side = THREE.DoubleSide;
    return m;
  }, []);
  return (
    <group>
      {geo.inner.map((g, i) => (
        <mesh key={`i${i}`} geometry={g} material={plasterBack} receiveShadow />
      ))}
      {geo.outer.map((g, i) => (
        <mesh key={`o${i}`} geometry={g} material={surface("ashlar")} castShadow receiveShadow />
      ))}
      {/* coping and roof ring with the oculus */}
      <mesh position={[ATRIUM.cx, ATRIUM.height + 0.01, ATRIUM.cz]} rotation={[-Math.PI / 2, 0, 0]} material={surface("limestone")}>
        <ringGeometry args={[geo.rIn, geo.rOut, 96]} />
      </mesh>
      <mesh position={[ATRIUM.cx, ATRIUM.height - 0.4, ATRIUM.cz]} rotation={[-Math.PI / 2, 0, 0]} material={roofMat} castShadow receiveShadow>
        <ringGeometry args={[ATRIUM.oculus, geo.rIn, 96, 1]} />
      </mesh>
      <mesh position={[ATRIUM.cx, ATRIUM.height - 0.2, ATRIUM.cz]} material={roofMat} castShadow>
        <cylinderGeometry args={[ATRIUM.oculus, ATRIUM.oculus, 0.4, 64, 1, true]} />
      </mesh>
      {/* shallow coffers: concentric rings under the roof */}
      {[4.2, 6, 7.6].map((r) => (
        <mesh key={r} position={[ATRIUM.cx, ATRIUM.height - 0.46, ATRIUM.cz]} rotation={[Math.PI / 2, 0, 0]} material={surface("limestone")}>
          <torusGeometry args={[r, 0.06, 6, 96]} />
        </mesh>
      ))}
      {/* stone cornice where the drum meets the roof */}
      <mesh position={[ATRIUM.cx, ATRIUM.height - 0.55, ATRIUM.cz]} rotation={[Math.PI / 2, 0, 0]} material={surface("limestone")}>
        <torusGeometry args={[geo.rIn - 0.05, 0.12, 6, 96]} />
      </mesh>
    </group>
  );
}

function Skylights({ rects }: { rects: SkylightRect[] }) {
  return (
    <>
      {rects.map((r, i) => (
        <mesh key={i} position={[(r.x0 + r.x1) / 2, r.y, (r.z0 + r.z1) / 2]} rotation={[Math.PI / 2, 0, 0]} material={diffuser()}>
          <planeGeometry args={[r.x1 - r.x0, r.z1 - r.z0]} />
        </mesh>
      ))}
    </>
  );
}

export function Architecture() {
  const wallGeos = useMemo(() => buildWalls(), []);
  const ceilings = useMemo(() => buildCeilings(), []);
  const floors = useMemo(() => buildFloors(), []);

  const floorMats = { oak: surface("oak"), travertine: surface("travertine"), terracotta: surface("terracotta"), gravel: surface("gravel"), limestone: surface("limestone"), marble: surface("marble") } as const;

  return (
    <group>
      {(Object.keys(wallGeos) as (keyof typeof wallGeos)[]).map((k) => (
        <mesh key={k} geometry={wallGeos[k]} material={surface(k)} castShadow receiveShadow />
      ))}
      <mesh geometry={ceilings.geometry} material={surface("plaster")} castShadow receiveShadow />
      {(Object.keys(floors) as (keyof typeof floors)[]).map((k) => (
        <mesh key={k} geometry={floors[k]} material={floorMats[k]} receiveShadow />
      ))}
      <Lintels />
      <GlazedFrames />
      <Atrium />
      <Skylights rects={ceilings.skylights} />
    </group>
  );
}
