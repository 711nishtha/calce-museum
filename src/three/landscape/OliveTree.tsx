"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { rng } from "@/graphics/rng";

const leafGeometry = new THREE.IcosahedronGeometry(1, 1);
const leafMaterial = new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.92, flatShading: true });
const barkMaterial = new THREE.MeshStandardMaterial({ color: "#6d6150", roughness: 1 });

/**
 * A procedural olive: a short, twisted trunk splitting into three or four limbs,
 * each ending in a cluster of silvery-green foliage masses.
 */
export function OliveTree({ position, scale = 1, seed = 1 }: { position: [number, number, number]; scale?: number; seed?: number }) {
  const canopy = useRef<THREE.InstancedMesh>(null);
  const { limbs, blobs } = useMemo(() => {
    const r = rng(seed);
    const limbs: THREE.TubeGeometry[] = [];
    const tips: THREE.Vector3[] = [];
    const base = new THREE.Vector3(r.range(-0.1, 0.1), 1.1, r.range(-0.1, 0.1));
    limbs.push(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0.15, 0.5, -0.1), base]), 12, 0.2, 7, false));
    const n = r.int(3, 4);
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + r.range(-0.4, 0.4);
      const reach = r.range(0.9, 1.5);
      const mid = base.clone().add(new THREE.Vector3(Math.cos(a) * reach * 0.45, r.range(0.6, 0.9), Math.sin(a) * reach * 0.45));
      const tip = base.clone().add(new THREE.Vector3(Math.cos(a) * reach, r.range(1.4, 2.1), Math.sin(a) * reach));
      limbs.push(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([base, mid, tip]), 10, r.range(0.07, 0.11), 6, false));
      tips.push(tip);
    }
    const blobs: { p: THREE.Vector3; s: THREE.Vector3; c: THREE.Color }[] = [];
    const greens = ["#7f8a5e", "#8e9670", "#6f7a52", "#a3a887", "#76805a"];
    for (const tip of tips) {
      for (let k = 0; k < 14; k++) {
        const p = tip.clone().add(new THREE.Vector3(r.range(-0.9, 0.9), r.range(-0.35, 0.55), r.range(-0.9, 0.9)));
        const sz = r.range(0.35, 0.62);
        blobs.push({ p, s: new THREE.Vector3(sz, sz * 0.62, sz), c: new THREE.Color(r.pick(greens)) });
      }
    }
    return { limbs, blobs };
  }, [seed]);

  useLayoutEffect(() => {
    const m = canopy.current;
    if (!m) return;
    const o = new THREE.Object3D();
    blobs.forEach((b, i) => {
      o.position.copy(b.p);
      o.scale.copy(b.s);
      o.rotation.set(0, i * 1.3, 0);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
      m.setColorAt(i, b.c);
    });
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  }, [blobs]);

  return (
    <group position={position} scale={scale}>
      {limbs.map((g, i) => (
        <mesh key={i} geometry={g} material={barkMaterial} castShadow />
      ))}
      <instancedMesh ref={canopy} args={[leafGeometry, leafMaterial, blobs.length]} castShadow />
    </group>
  );
}
