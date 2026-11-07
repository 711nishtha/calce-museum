"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import type { Artwork, Facing } from "@/content/types";
import { giltMaterial, matte, surface } from "../materials/materials";
import { registerHit } from "../interaction/registry";
import { useArtworkTexture } from "./useArtworkTexture";

export const facingRotation: Record<Facing, number> = { south: 0, north: Math.PI, east: Math.PI / 2, west: -Math.PI / 2 };

export function HitBox({ id, size, position = [0, 0, 0] }: { id: string; size: [number, number, number]; position?: [number, number, number] }) {
  const ref = useRef<THREE.Mesh>(null);
  useEffect(() => registerHit(ref.current, id), [id]);
  return (
    <mesh ref={ref} position={position} visible={false}>
      <boxGeometry args={size} />
      <meshBasicMaterial />
    </mesh>
  );
}

/**
 * A picture-plane material lit by the gallery: the image is also fed to the emissive
 * channel at low strength, standing in for the dedicated picture lighting of a real hang.
 */
function useImageMaterial(tex: THREE.Texture | null, glow: number) {
  return useMemo(() => {
    if (!tex) return matte("#e9e1d2", 0.95);
    return new THREE.MeshStandardMaterial({ map: tex, emissiveMap: tex, emissive: new THREE.Color("#ffffff"), emissiveIntensity: glow, roughness: 0.86 });
  }, [tex, glow]);
}

/** Paintings on stretched linen, prints behind a mat in an oak frame, and wall reliefs. */
export function WallArtwork({ work }: { work: Artwork }) {
  const p = work.placement;
  const tex = useArtworkTexture(work);
  const isPhoto = work.medium === "photography";
  const isRelief = work.visual.kind === "sculpture";
  const image = useImageMaterial(tex, isPhoto ? 0.22 : 0.12);
  if (p.type !== "wall") return null;

  const w = work.dimensions.w / 100;
  const h = work.dimensions.h / 100;
  const y = p.y ?? 1.6;

  if (isRelief) {
    const d = (work.dimensions.d ?? 8) / 100;
    return (
      <group position={[p.x, y, p.z]} rotation={[0, facingRotation[p.facing], 0]}>
        <mesh position={[0, 0, d / 2]} material={surface("limestone")} castShadow receiveShadow>
          <boxGeometry args={[w, h, d]} />
        </mesh>
        <mesh position={[0, 0, d + 0.002]} material={image}>
          <planeGeometry args={[w, h]} />
        </mesh>
        <HitBox id={work.id} size={[w, h, 0.4]} position={[0, 0, 0.2]} />
      </group>
    );
  }

  if (isPhoto) {
    const mat = Math.min(w, h) * 0.22;
    const frame = 0.035;
    const W = w + mat * 2 + frame * 2;
    const Hh = h + mat * 2 + frame * 2;
    return (
      <group position={[p.x, y, p.z]} rotation={[0, facingRotation[p.facing], 0]}>
        <mesh position={[0, 0, 0.02]} material={surface("oak")} castShadow>
          <boxGeometry args={[W, Hh, 0.04]} />
        </mesh>
        <mesh position={[0, 0, 0.0405]} material={matte("#F7F3EA", 0.95)}>
          <planeGeometry args={[W - frame * 2, Hh - frame * 2]} />
        </mesh>
        <mesh position={[0, 0, 0.041]} material={image}>
          <planeGeometry args={[w, h]} />
        </mesh>
        <HitBox id={work.id} size={[W, Hh, 0.4]} position={[0, 0, 0.2]} />
      </group>
    );
  }

  // Old masters hang in moulded gilt frames; contemporary paintings sit unframed on deep stretchers.
  const gilt = work.visual.kind === "image";
  const fw = gilt ? THREE.MathUtils.clamp(0.07 + Math.max(w, h) * 0.03, 0.09, 0.26) : 0;
  return (
    <group position={[p.x, y, p.z]} rotation={[0, facingRotation[p.facing], 0]}>
      {gilt ? <GiltFrame w={w} h={h} fw={fw} /> : (
        <mesh position={[0, 0, 0.025]} material={matte("#d9cdb6", 0.95)} castShadow>
          <boxGeometry args={[w, h, 0.05]} />
        </mesh>
      )}
      <mesh position={[0, 0, 0.0505]} material={image}>
        <planeGeometry args={[w, h]} />
      </mesh>
      <PictureLight width={Math.min(w * 0.7, 1.6)} top={h / 2 + fw} />
      <HitBox id={work.id} size={[w + fw * 2, h + fw * 2, 0.4]} position={[0, 0, 0.2]} />
    </group>
  );
}

const frameGeometries = new Map<string, THREE.ExtrudeGeometry>();

/** A moulded frame: a rectangle with a rectangular opening, extruded with a rounded bevel. */
function GiltFrame({ w, h, fw }: { w: number; h: number; fw: number }) {
  const key = `${w.toFixed(3)}x${h.toFixed(3)}x${fw.toFixed(3)}`;
  let geo = frameGeometries.get(key);
  if (!geo) {
    const W = w / 2 + fw;
    const H = h / 2 + fw;
    const shape = new THREE.Shape([new THREE.Vector2(-W, -H), new THREE.Vector2(W, -H), new THREE.Vector2(W, H), new THREE.Vector2(-W, H)]);
    shape.holes.push(new THREE.Path([new THREE.Vector2(-w / 2, -h / 2), new THREE.Vector2(-w / 2, h / 2), new THREE.Vector2(w / 2, h / 2), new THREE.Vector2(w / 2, -h / 2)]));
    geo = new THREE.ExtrudeGeometry(shape, { depth: 0.05, bevelEnabled: true, bevelThickness: fw * 0.35, bevelSize: fw * 0.3, bevelSegments: 4 });
    frameGeometries.set(key, geo);
  }
  return (
    <>
      <mesh geometry={geo} material={giltMaterial()} castShadow />
      {/* a dark velvet slip between frame and canvas */}
      <mesh position={[0, 0, 0.045]} material={matte("#2a1a14", 0.9)}>
        <planeGeometry args={[w + 0.04, h + 0.04]} />
      </mesh>
    </>
  );
}

/** Brass picture light above a painting, with a warm glowing lip. */
function PictureLight({ width, top }: { width: number; top: number }) {
  return (
    <group position={[0, top + 0.16, 0.2]}>
      <mesh rotation={[0, 0, Math.PI / 2]} material={giltMaterial()}>
        <cylinderGeometry args={[0.032, 0.032, width, 16]} />
      </mesh>
      <mesh position={[0, -0.033, 0.005]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[width * 0.95, 0.03]} />
        <meshBasicMaterial color="#fff1d0" toneMapped={false} />
      </mesh>
      <mesh position={[0, 0.02, -0.1]} rotation={[Math.PI / 2, 0, 0]} material={giltMaterial()}>
        <cylinderGeometry args={[0.012, 0.012, 0.2, 8]} />
      </mesh>
    </group>
  );
}
