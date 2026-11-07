"use client";

import { AdaptiveDpr, Preload } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import * as THREE from "three";
import { Architecture } from "../architecture/Architecture";
import { Furniture } from "../architecture/Furniture";
import { Ornament } from "../architecture/Ornament";
import { RoyalSalon } from "../architecture/RoyalSalon";
import { Signage } from "../architecture/Signage";
import { Artworks } from "../artworks/Artworks";
import { Player } from "../controls/Player";
import { Interaction } from "../interaction/Interaction";
import { Landscape } from "../landscape/Landscape";
import { useMuseum } from "../state/museumStore";
import { Lighting } from "./Lighting";

export default function MuseumCanvas({ onContextLost }: { onContextLost: () => void }) {
  const quality = useMuseum((s) => s.quality);
  return (
    <Canvas
      shadows={{ type: THREE.PCFSoftShadowMap }}
      dpr={quality === "high" ? [1, 2] : [0.75, 1.25]}
      camera={{ fov: 62, near: 0.05, far: 700, position: [0, 1.62, 39] }}
      gl={{ antialias: true, powerPreference: "high-performance", toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 0.82 }}
      onCreated={({ gl }) => {
        gl.domElement.addEventListener("webglcontextlost", (e) => {
          e.preventDefault();
          onContextLost();
        });
      }}
      aria-label="Real-time 3D view of the museum"
    >
      <Lighting />
      <group name="architecture">
        <Architecture />
      </group>
      <Landscape />
      <Furniture />
      <Ornament />
      <RoyalSalon />
      <Artworks />
      <Suspense fallback={null}>
        <Signage />
      </Suspense>
      <Player />
      <Interaction />
      <AdaptiveDpr pixelated={false} />
      <Preload all />
    </Canvas>
  );
}
