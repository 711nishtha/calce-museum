"use client";

import { RoundedBox } from "@react-three/drei";
import { useMemo } from "react";
import * as THREE from "three";
import type { Artwork, SculptureForm } from "@/content/types";
import { rng } from "@/graphics/rng";
import { matte, sculptureMaterial, surface } from "../materials/materials";
import { HitBox } from "./WallArtwork";

function lathe(profile: [number, number][], segments = 48) {
  return new THREE.LatheGeometry(
    profile.map(([r, y]) => new THREE.Vector2(r, y)),
    segments,
  );
}

function archGeometry(w: number, h: number, d: number) {
  const t = w * 0.2;
  const shape = new THREE.Shape();
  shape.moveTo(-w / 2, 0);
  shape.lineTo(-w / 2, h - w / 2);
  shape.absarc(0, h - w / 2, w / 2, Math.PI, 0, true);
  shape.lineTo(w / 2, 0);
  shape.lineTo(w / 2 - t, 0);
  shape.lineTo(w / 2 - t, h - w / 2);
  shape.absarc(0, h - w / 2, w / 2 - t, 0, Math.PI, false);
  shape.lineTo(-w / 2 + t, 0);
  shape.closePath();
  const g = new THREE.ExtrudeGeometry(shape, { depth: d, bevelEnabled: true, bevelSize: 0.01, bevelThickness: 0.01, bevelSegments: 2, curveSegments: 32 });
  g.translate(0, 0, -d / 2);
  return g;
}

function seatGeometry(w: number, h: number, d: number) {
  const s = new THREE.Shape();
  s.moveTo(-w / 2, 0);
  s.lineTo(-w / 2, h * 0.6);
  s.quadraticCurveTo(0, h * 1.25, w / 2, h * 0.6);
  s.lineTo(w / 2, 0);
  s.lineTo(w / 2 - 0.18, 0);
  s.lineTo(w / 2 - 0.18, h * 0.35);
  s.lineTo(-w / 2 + 0.18, h * 0.35);
  s.lineTo(-w / 2 + 0.18, 0);
  s.closePath();
  const g = new THREE.ExtrudeGeometry(s, { depth: d, bevelEnabled: true, bevelSize: 0.015, bevelThickness: 0.015, bevelSegments: 2, curveSegments: 24 });
  g.translate(0, 0, -d / 2);
  return g;
}

function Form({ form, work }: { form: SculptureForm; work: Artwork }) {
  const v = work.visual;
  const mat = sculptureMaterial(v.kind === "sculpture" ? v.material : "limestone");
  const w = work.dimensions.w / 100;
  const h = work.dimensions.h / 100;
  const d = (work.dimensions.d ?? work.dimensions.w) / 100;
  const geo = useMemo(() => {
    switch (form) {
      case "vessel":
        return lathe([
          [0.001, 0],
          [w * 0.22, 0],
          [w * 0.42, h * 0.3],
          [w * 0.5, h * 0.55],
          [w * 0.38, h * 0.85],
          [w * 0.2, h * 0.97],
          [w * 0.22, h],
          [w * 0.18, h],
          [w * 0.15, h * 0.9],
        ]);
      case "column":
        return lathe([
          [0.001, 0],
          [w * 0.42, 0],
          [w * 0.62, h * 0.35],
          [w * 0.66, h * 0.5],
          [w * 0.6, h * 0.66],
          [w * 0.42, h],
          [0.001, h],
        ]);
      case "arch":
        return archGeometry(w, h, d);
      case "seat":
        return seatGeometry(w, h, d);
      case "ring": {
        const tube = d * 0.42;
        const g = new THREE.TorusGeometry(w / 2 - tube, tube, 20, 72);
        g.translate(0, w / 2, 0);
        return g;
      }
      default:
        return null;
    }
  }, [form, w, h, d]);

  if (form === "stack") {
    const r = rng(v.seed);
    const n = r.int(5, 7);
    let y = 0;
    const blocks = Array.from({ length: n }, (_, i) => {
      const bh = (h / n) * r.range(0.8, 1.2);
      const bw = w * r.range(0.7, 1) * (1 - i * 0.04);
      const bd = d * r.range(0.7, 1);
      const b = { y: y + bh / 2, bw, bh, bd, x: r.range(-0.03, 0.03) + i * 0.006, rot: r.range(-0.12, 0.12) };
      y += bh;
      return b;
    });
    return (
      <>
        {blocks.map((b, i) => (
          <RoundedBox key={i} args={[b.bw, b.bh, b.bd]} radius={Math.min(0.04, b.bh * 0.3)} smoothness={3} position={[b.x, b.y, 0]} rotation={[0, b.rot, 0]} material={mat} castShadow receiveShadow />
        ))}
      </>
    );
  }
  if (!geo) return null;
  return <mesh geometry={geo} material={mat} castShadow receiveShadow />;
}

export function Sculpture({ work }: { work: Artwork }) {
  const p = work.placement;
  if (p.type !== "floor" || work.visual.kind !== "sculpture") return null;
  const form = work.visual.form;
  const outdoors = p.room === "garden";
  const plinth = form === "seat" ? 0 : outdoors ? 0.14 : 0.32;
  const plinthW = form === "arch" ? 1.8 : 1.05;
  const h = work.dimensions.h / 100;
  return (
    <group position={[p.x, 0, p.z]} rotation={[0, ((p.rotation ?? 0) * Math.PI) / 180, 0]}>
      {plinth > 0 && (
        <mesh position={[0, plinth / 2, 0]} material={outdoors ? surface("limestone") : matte("#F1ECE2", 0.9)} castShadow receiveShadow>
          <boxGeometry args={[plinthW, plinth, form === "arch" ? 0.8 : 1.05]} />
        </mesh>
      )}
      <group position={[0, plinth, 0]}>
        <Form form={form} work={work} />
      </group>
      <HitBox id={work.id} size={[1.4, plinth + h + 0.2, 1.4]} position={[0, (plinth + h) / 2, 0]} />
    </group>
  );
}
