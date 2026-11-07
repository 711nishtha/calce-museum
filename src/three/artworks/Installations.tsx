"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import { Reflector } from "three/examples/jsm/objects/Reflector.js";
import * as THREE from "three";
import type { Artwork } from "@/content/types";
import { matte } from "../materials/materials";
import { useMuseum } from "../state/museumStore";
import { HitBox, facingRotation } from "./WallArtwork";

const reducedMotion = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Collettivo Mareo — linen threads that sway and part around the visitor. */
function Threads({ work }: { work: Artwork }) {
  const p = work.placement as { x: number; z: number };
  const quality = useMuseum((s) => s.quality);
  const count = quality === "high" ? 1400 : 700;
  const top = 6.6;
  const { geometry, beads, base } = useMemo(() => {
    const pos = new Float32Array(count * 6);
    const bead = new Float32Array(count * 3);
    const base = new Float32Array(count * 3);
    let seed = 11;
    const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < count; i++) {
      const x = p.x + (rand() - 0.5) * 4;
      const z = p.z + (rand() - 0.5) * 4;
      const yb = 0.1 + rand() * 0.08;
      pos.set([x, top, z, x, yb, z], i * 6);
      bead.set([x, yb, z], i * 3);
      base.set([x, yb, z], i * 3);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    const b = new THREE.BufferGeometry();
    b.setAttribute("position", new THREE.BufferAttribute(bead, 3));
    return { geometry: g, beads: b, base };
  }, [count, p.x, p.z]);
  const still = useMemo(reducedMotion, []);

  useFrame(({ clock, camera }) => {
    if (still) return;
    const t = clock.elapsedTime;
    const cx = camera.position.x;
    const cz = camera.position.z;
    if (Math.abs(cx - p.x) > 12 || Math.abs(cz - p.z) > 12) return; // only animate nearby
    const line = geometry.attributes.position as THREE.BufferAttribute;
    const bead = beads.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < count; i++) {
      const bx = base[i * 3]!;
      const bz = base[i * 3 + 2]!;
      let ox = Math.sin(t * 0.45 + bx * 0.9 + bz * 0.4) * 0.035;
      let oz = Math.cos(t * 0.38 + bz * 0.8) * 0.03;
      const dx = bx - cx;
      const dz = bz - cz;
      const d = Math.hypot(dx, dz);
      if (d < 1.6 && d > 0.001) {
        const push = (1.6 - d) * 0.22;
        ox += (dx / d) * push;
        oz += (dz / d) * push;
      }
      line.array[i * 6 + 3] = bx + ox;
      line.array[i * 6 + 5] = bz + oz;
      bead.array[i * 3] = bx + ox;
      bead.array[i * 3 + 2] = bz + oz;
    }
    line.needsUpdate = true;
    bead.needsUpdate = true;
  });

  return (
    <group>
      <lineSegments geometry={geometry}>
        <lineBasicMaterial color="#efe5d2" transparent opacity={0.55} />
      </lineSegments>
      <points geometry={beads}>
        <pointsMaterial color="#c59a5a" size={0.03} sizeAttenuation />
      </points>
      <HitBox id={work.id} size={[4.4, 3, 4.4]} position={[p.x, 1.5, p.z]} />
    </group>
  );
}

/** Hana Ostrowa-Lind — a still basin that mirrors the skylight above. */
function MirrorPool({ work }: { work: Artwork }) {
  const p = work.placement as { x: number; z: number };
  const quality = useMuseum((s) => s.quality);
  // A true planar mirror for the water. It costs one extra render, so it only runs nearby.
  const mirror = useMemo(() => {
    const size = quality === "high" ? 1024 : 512;
    const r = new Reflector(new THREE.PlaneGeometry(3.4, 5.4), { textureWidth: size, textureHeight: Math.round(size * 1.6), color: 0x8a847c, clipBias: 0.003 });
    r.rotation.x = -Math.PI / 2;
    r.position.y = 0.3;
    return r;
  }, [quality]);
  useEffect(() => () => mirror.dispose(), [mirror]);
  useFrame(({ camera }) => {
    mirror.visible = Math.hypot(camera.position.x - p.x, camera.position.z - p.z) < 16;
  });
  return (
    <group position={[p.x, 0, p.z]}>
      <mesh position={[0, 0.15, 0]} material={matte("#1d1a17", 0.5)} castShadow receiveShadow>
        <boxGeometry args={[3.6, 0.3, 5.6]} />
      </mesh>
      <primitive object={mirror} />
      {/* a faint dark tint so the mirror reads as deep, still water */}
      <mesh position={[0, 0.306, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[3.4, 5.4]} />
        <meshBasicMaterial color="#120f0c" transparent opacity={0.35} depthWrite={false} />
      </mesh>
      <HitBox id={work.id} size={[3.6, 1.2, 5.6]} position={[0, 0.6, 0]} />
    </group>
  );
}

/** Hana Ostrowa-Lind — a wall that brightens and dims over sixty seconds. */
function BreathingWall({ work }: { work: Artwork }) {
  const p = work.placement as { x: number; z: number; y?: number; facing: keyof typeof facingRotation };
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#d9ccb3", emissive: new THREE.Color("#ffe6bf"), emissiveIntensity: 0.4, roughness: 0.95 }), []);
  const still = useMemo(reducedMotion, []);
  useFrame(({ clock }) => {
    if (still) return;
    const phase = (clock.elapsedTime % 60) / 60;
    mat.emissiveIntensity = 0.12 + 0.6 * (0.5 - 0.5 * Math.cos(phase * Math.PI * 2));
  });
  const w = work.dimensions.w / 100;
  const h = work.dimensions.h / 100;
  return (
    <group position={[p.x, p.y ?? 2, p.z]} rotation={[0, facingRotation[p.facing], 0]}>
      <mesh position={[0, 0, 0.01]} material={mat}>
        <planeGeometry args={[w, h]} />
      </mesh>
      <HitBox id={work.id} size={[w, h, 0.4]} position={[0, 0, 0.2]} />
    </group>
  );
}

function glowTexture() {
  const c = document.createElement("canvas");
  c.width = 64;
  c.height = 256;
  const ctx = c.getContext("2d")!;
  const g = ctx.createLinearGradient(0, 0, 64, 0);
  g.addColorStop(0, "rgba(255,240,210,0)");
  g.addColorStop(0.5, "rgba(255,240,210,1)");
  g.addColorStop(1, "rgba(255,240,210,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 256);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/** Brightness of daylight at the visitor's local time: dim at night, full at midday. */
export function localDaylight(date = new Date()): number {
  const h = date.getHours() + date.getMinutes() / 60;
  return Math.max(0.18, Math.min(1, Math.sin(((h - 6) / 13) * Math.PI) * 1.1));
}

/** Tariq Sorel — a single line of light whose brightness follows your local time of day. */
function LightSlot({ work }: { work: Artwork }) {
  const p = work.placement as { x: number; z: number; y?: number; facing: keyof typeof facingRotation };
  const level = useMemo(() => localDaylight(), []);
  const glow = useMemo(glowTexture, []);
  const h = work.dimensions.h / 100;
  return (
    <group position={[p.x, p.y ?? 2.4, p.z]} rotation={[0, facingRotation[p.facing], 0]}>
      <mesh position={[0, 0, 0.012]}>
        <planeGeometry args={[0.04, h]} />
        <meshBasicMaterial color={new THREE.Color("#fff6e4").multiplyScalar(1 + level * 2)} toneMapped={false} />
      </mesh>
      <mesh position={[0, 0, 0.02]}>
        <planeGeometry args={[1.1, h * 1.08]} />
        <meshBasicMaterial map={glow} transparent opacity={0.2 * level} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
      </mesh>
      <mesh position={[0, -(p.y ?? 2.4) + 0.01, 1.4]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.5, 2.8]} />
        <meshBasicMaterial map={glow} transparent opacity={0.22 * level} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
      </mesh>
      <pointLight position={[0, 0, 0.6]} intensity={1.1 * level} distance={4} decay={2} color="#ffe8c8" />
      <HitBox id={work.id} size={[1, h, 0.5]} position={[0, 0, 0.25]} />
    </group>
  );
}

export function Installation({ work }: { work: Artwork }) {
  if (work.visual.kind !== "installation") return null;
  switch (work.visual.form) {
    case "threads":
      return <Threads work={work} />;
    case "mirror-pool":
      return <MirrorPool work={work} />;
    case "breathing-wall":
      return <BreathingWall work={work} />;
    case "light-slot":
      return <LightSlot work={work} />;
  }
}
