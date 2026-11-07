"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { fixtures, roomById } from "@/architecture/floorplan";
import { giltMaterial, marbleWhite, matte } from "../materials/materials";
import { mergeParts, placement, type Part } from "./merge";

/** A Greek-key (meander) frieze painted on canvas: gold on deep oxblood. */
export function meanderTexture(repeat: number): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 64;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#3b1416";
  ctx.fillRect(0, 0, 256, 64);
  ctx.strokeStyle = "#caa24e";
  ctx.lineWidth = 5;
  ctx.lineCap = "square";
  // one meander unit is 64 px wide
  for (let u = 0; u < 4; u++) {
    const x = u * 64;
    ctx.beginPath();
    ctx.moveTo(x + 4, 54);
    ctx.lineTo(x + 4, 10);
    ctx.lineTo(x + 52, 10);
    ctx.lineTo(x + 52, 44);
    ctx.lineTo(x + 20, 44);
    ctx.lineTo(x + 20, 26);
    ctx.lineTo(x + 36, 26);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x + 4, 54);
    ctx.lineTo(x + 68, 54);
    ctx.stroke();
  }
  ctx.fillStyle = "#caa24e";
  ctx.fillRect(0, 0, 256, 3);
  ctx.fillRect(0, 61, 256, 3);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = THREE.RepeatWrapping;
  t.repeat.set(repeat, 1);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

const velvet = () => matte("#6b1e24", 0.95);

/** Many copies of one small part in a single draw call. */
function Instanced({ geometry, material, positions }: { geometry: THREE.BufferGeometry; material: THREE.Material; positions: [number, number, number][] }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    const m = ref.current;
    if (!m) return;
    const o = new THREE.Object3D();
    positions.forEach((p, i) => {
      o.position.set(...p);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
    });
    m.instanceMatrix.needsUpdate = true;
    m.computeBoundingSphere();
  }, [positions]);
  return <instancedMesh ref={ref} args={[geometry, material, positions.length]} />;
}

const candleGeometry = new THREE.CylinderGeometry(0.022, 0.022, 0.18, 8);
const flameGeometry = new THREE.SphereGeometry(0.03, 8, 8);
const flameMaterial = new THREE.MeshBasicMaterial({ color: "#ffe1a6", toneMapped: false });
const rosetteGeometry = new THREE.CylinderGeometry(0.16, 0.12, 0.05, 16);

/**
 * The Ionic colonnades and coffer ribs, baked into one marble and one gilt geometry:
 * square plinth, torus base, faceted (fluted) shaft and volute capital for each column.
 */
function useColonnadeGeometry(columns: { x: number; z: number }[], height: number) {
  return useMemo(() => {
    const marble: Part[] = [];
    const gilt: Part[] = [];
    const shaft = height - 0.75;
    const plinth = new THREE.BoxGeometry(0.95, 0.24, 0.95);
    const torus = new THREE.TorusGeometry(0.36, 0.07, 10, 32);
    // 24 flat facets read as flutes under raking light
    const fluted = new THREE.CylinderGeometry(0.3, 0.355, shaft, 24, 1, false);
    const echinus = new THREE.TorusGeometry(0.31, 0.045, 8, 32);
    const capital = new THREE.BoxGeometry(0.98, 0.2, 0.7);
    const volute = new THREE.TorusGeometry(0.13, 0.055, 10, 24);
    const abacus = new THREE.BoxGeometry(1.02, 0.08, 1.02);
    for (const c of columns) {
      const col = placement([c.x, 0, c.z]);
      const cap = placement([c.x, 0.34 + shaft, c.z], Math.PI / 2);
      marble.push({ geometry: plinth, position: [0, 0.12, 0], parent: col });
      marble.push({ geometry: torus, position: [0, 0.3, 0], rotation: [Math.PI / 2, 0, 0], parent: col });
      marble.push({ geometry: fluted, position: [0, 0.34 + shaft / 2, 0], parent: col });
      gilt.push({ geometry: echinus, position: [0, 0.06, 0], rotation: [Math.PI / 2, 0, 0], parent: cap });
      marble.push({ geometry: capital, position: [0, 0.2, 0], parent: cap });
      for (const s of [-1, 1]) marble.push({ geometry: volute, position: [s * 0.44, 0.12, 0], rotation: [0, Math.PI / 2, 0], parent: cap });
      marble.push({ geometry: abacus, position: [0, 0.34, 0], parent: cap });
    }
    // coffer ribs under the ceiling
    const room = roomById("gallery-royal");
    const sh = room.shape;
    if (sh.type === "rect") {
      const depth = 0.36;
      for (let x = sh.x0 + COFFER; x < sh.x1 - 0.1; x += COFFER) marble.push({ geometry: new THREE.BoxGeometry(0.2, depth, sh.z1 - sh.z0), position: [x, room.ceiling - depth / 2, (sh.z0 + sh.z1) / 2] });
      for (let z = sh.z0 + COFFER; z < sh.z1 - 0.1; z += COFFER) marble.push({ geometry: new THREE.BoxGeometry(sh.x1 - sh.x0, depth, 0.2), position: [(sh.x0 + sh.x1) / 2, room.ceiling - depth / 2, z] });
    }
    return { marble: mergeParts(marble), gilt: mergeParts(gilt) };
  }, [columns, height]);
}

const COFFER = 2.5;

/** Architrave, Greek-key frieze and cornice carried along a colonnade. */
function Entablature({ x, z0, z1, y }: { x: number; z0: number; z1: number; y: number }) {
  const len = z1 - z0;
  const frieze = useMemo(() => meanderTexture(len / 0.9), [len]);
  const zc = (z0 + z1) / 2;
  return (
    <group position={[x, y, zc]}>
      <mesh position={[0, 0.17, 0]} material={marbleWhite()} castShadow receiveShadow>
        <boxGeometry args={[0.95, 0.34, len]} />
      </mesh>
      <mesh position={[0, 0.6, 0]} castShadow>
        <boxGeometry args={[0.9, 0.52, len]} />
        <meshStandardMaterial attach="material-0" map={frieze} roughness={0.6} />
        <meshStandardMaterial attach="material-1" map={frieze} roughness={0.6} />
        <meshStandardMaterial attach="material-2" color="#3b1416" />
        <meshStandardMaterial attach="material-3" color="#3b1416" />
        <meshStandardMaterial attach="material-4" color="#3b1416" />
        <meshStandardMaterial attach="material-5" color="#3b1416" />
      </mesh>
      <mesh position={[0, 0.94, 0]} material={marbleWhite()} castShadow>
        <boxGeometry args={[1.15, 0.16, len]} />
      </mesh>
      <mesh position={[0, 0.865, 0]} material={giltMaterial()}>
        <boxGeometry args={[0.96, 0.03, len]} />
      </mesh>
    </group>
  );
}

/** Gilt ring chandelier with twelve glowing candles (no extra real-time light: the room wash carries it). */
function Chandelier({ x, y, z, ceiling }: { x: number; y: number; z: number; ceiling: number }) {
  const arms = 12;
  const candles = useMemo(() => Array.from({ length: arms }, (_, i) => [Math.cos((i / arms) * Math.PI * 2) * 0.85, Math.sin((i / arms) * Math.PI * 2) * 0.85] as const), []);
  return (
    <group position={[x, y, z]}>
      <mesh position={[0, (ceiling - y) / 2, 0]} material={giltMaterial()}>
        <cylinderGeometry args={[0.015, 0.015, ceiling - y, 6]} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} material={giltMaterial()}>
        <torusGeometry args={[0.85, 0.035, 8, 48]} />
      </mesh>
      <mesh position={[0, 0.35, 0]} rotation={[Math.PI / 2, 0, 0]} material={giltMaterial()}>
        <torusGeometry args={[0.5, 0.025, 8, 36]} />
      </mesh>
      <mesh position={[0, -0.1, 0]} material={giltMaterial()}>
        <sphereGeometry args={[0.16, 20, 14]} />
      </mesh>
      <Instanced geometry={candleGeometry} material={matte("#f3ece0", 0.6)} positions={candles.map(([cx, cz]) => [cx, 0.09, cz])} />
      <Instanced geometry={flameGeometry} material={flameMaterial} positions={candles.map(([cx, cz]) => [cx, 0.21, cz])} />
    </group>
  );
}

function Amphora({ x, z }: { x: number; z: number }) {
  const body = useMemo(
    () =>
      new THREE.LatheGeometry(
        [
          [0.001, 0],
          [0.09, 0],
          [0.07, 0.06],
          [0.17, 0.22],
          [0.24, 0.42],
          [0.2, 0.62],
          [0.09, 0.74],
          [0.08, 0.86],
          [0.12, 0.9],
          [0.1, 0.92],
        ].map(([r, y]) => new THREE.Vector2(r, y)),
        40,
      ),
    [],
  );
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.45, 0]} material={marbleWhite()} castShadow receiveShadow>
        <boxGeometry args={[0.62, 0.9, 0.62]} />
      </mesh>
      <group position={[0, 0.9, 0]}>
        <mesh geometry={body} material={matte("#b8653f", 0.7)} castShadow />
        {/* black-figure band and handles */}
        <mesh position={[0, 0.4, 0]} material={matte("#1b1512", 0.5)}>
          <cylinderGeometry args={[0.243, 0.235, 0.16, 40, 1, true]} />
        </mesh>
        {[-1, 1].map((s) => (
          <mesh key={s} position={[s * 0.15, 0.74, 0]} rotation={[0, 0, s * 0.3]} material={matte("#1b1512", 0.5)}>
            <torusGeometry args={[0.09, 0.016, 8, 16, Math.PI]} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

function Ottoman({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.22, 0]} material={velvet()} castShadow receiveShadow>
        <cylinderGeometry args={[1.2, 1.15, 0.44, 48]} />
      </mesh>
      <mesh position={[0, 0.03, 0]} rotation={[Math.PI / 2, 0, 0]} material={giltMaterial()}>
        <torusGeometry args={[1.16, 0.03, 8, 64]} />
      </mesh>
      <mesh position={[0, 0.88, 0]} material={velvet()} castShadow>
        <cylinderGeometry args={[0.34, 0.42, 0.9, 32]} />
      </mesh>
      <mesh position={[0, 1.38, 0]} material={giltMaterial()}>
        <sphereGeometry args={[0.1, 16, 12]} />
      </mesh>
    </group>
  );
}

/** A gilt rosette in every coffer, leaving the lantern strip over the nave open. */
function Rosettes() {
  const room = roomById("gallery-royal");
  const s = room.shape;
  const positions = useMemo(() => {
    if (s.type !== "rect") return [];
    const out: [number, number, number][] = [];
    for (let x = s.x0 + COFFER; x < s.x1 - COFFER; x += COFFER)
      for (let z = s.z0 + COFFER; z < s.z1 - COFFER; z += COFFER) if (Math.abs(x + COFFER / 2 - -21) >= 2) out.push([x + COFFER / 2, room.ceiling - 0.02, z + COFFER / 2]);
    return out;
  }, [s, room.ceiling]);
  return <Instanced geometry={rosetteGeometry} material={giltMaterial()} positions={positions} />;
}

// Fixed positions from the floor plan (module constants, so memoised geometry is built once).
const columns = fixtures.filter((f) => f.type === "circle" && f.tag === "column") as { x: number; z: number }[];
const amphorae = fixtures.filter((f) => f.type === "circle" && f.tag === "amphora") as { x: number; z: number }[];
const ottoman = fixtures.find((f) => f.type === "circle" && f.tag === "ottoman") as { x: number; z: number };

/** Gallery V — a temple-fronted picture gallery: colonnades, frieze, coffers, chandeliers. */
export function RoyalSalon() {
  const room = roomById("gallery-royal");
  const columnHeight = 6.8;
  const colonnade = useColonnadeGeometry(columns, columnHeight);
  const rows = [...new Set(columns.map((c) => c.x))];
  return (
    <group>
      <mesh geometry={colonnade.marble} material={marbleWhite()} castShadow receiveShadow />
      <mesh geometry={colonnade.gilt} material={giltMaterial()} />
      {rows.map((x) => (
        <Entablature key={x} x={x} z0={-31.8} z1={-10.2} y={columnHeight + 0.1} />
      ))}
      <Rosettes />
      <Chandelier x={-21} y={5.4} z={-15.5} ceiling={room.ceiling} />
      <Chandelier x={-21} y={5.4} z={-25.5} ceiling={room.ceiling} />
      <Ottoman x={ottoman.x} z={ottoman.z} />
      {amphorae.map((a) => (
        <Amphora key={a.x} x={a.x} z={a.z} />
      ))}
    </group>
  );
}
