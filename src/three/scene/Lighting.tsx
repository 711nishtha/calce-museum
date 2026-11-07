"use client";

import { Environment, Lightformer, Sky } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import { RectAreaLightUniformsLib } from "three/examples/jsm/lights/RectAreaLightUniformsLib.js";
import { rooms } from "@/architecture/floorplan";
import type { RoomId } from "@/content/types";
import { useMuseum } from "../state/museumStore";

/** Late-afternoon sun from the south-west: long shadows, warm light through the oculus. */
export const SUN_DIRECTION = new THREE.Vector3(-0.55, 0.72, 0.42).normalize();
const SITE_CENTRE = new THREE.Vector3(2, 0, -1);

/** Daylight wash per room, standing in for diffuse light from the skylights. */
const roomWash: Partial<Record<RoomId, { intensity: number; color: string }>> = {
  reception: { intensity: 3.2, color: "#fff4e2" },
  shop: { intensity: 3, color: "#ffeed8" },
  cafe: { intensity: 3, color: "#ffe9cf" },
  "gallery-sculpture": { intensity: 4.2, color: "#fff6ea" },
  "gallery-painting": { intensity: 4, color: "#fff7ee" },
  "gallery-photography": { intensity: 2.4, color: "#fff4e6" },
  "gallery-installation": { intensity: 1.5, color: "#fff1dc" },
  "gallery-royal": { intensity: 3.4, color: "#ffe8cc" },
};

function Sun() {
  const quality = useMuseum((s) => s.quality);
  const { scene } = useThree();
  const light = useMemo(() => {
    const l = new THREE.DirectionalLight("#ffeccc", 2.7);
    l.position.copy(SITE_CENTRE).addScaledVector(SUN_DIRECTION, 90);
    l.target.position.copy(SITE_CENTRE);
    l.castShadow = true;
    const cam = l.shadow.camera;
    cam.left = -50;
    cam.right = 50;
    cam.top = 50;
    cam.bottom = -50;
    cam.near = 10;
    cam.far = 190;
    l.shadow.bias = -0.0004;
    l.shadow.normalBias = 0.035;
    return l;
  }, []);
  useEffect(() => {
    const size = quality === "high" ? 4096 : 2048;
    light.shadow.mapSize.set(size, size);
    light.shadow.map?.dispose();
    light.shadow.map = null;
  }, [quality, light]);
  useEffect(() => {
    scene.add(light, light.target);
    return () => {
      scene.remove(light, light.target);
    };
  }, [scene, light]);
  return null;
}

interface Wash {
  position: [number, number, number];
  width: number;
  height: number;
  intensity: number;
  color: string;
}

/** Daylight wash rectangles for every room that has one. */
const washes: Partial<Record<RoomId, Wash>> = Object.fromEntries(
  rooms.flatMap((room) => {
    const wash = roomWash[room.id];
    if (!wash || room.shape.type !== "rect") return [];
    const { x0, x1, z0, z1 } = room.shape;
    // the installation chamber stays dark: light only the main hall of the Long Room
    const xr = room.id === "gallery-installation" ? [x0, 3.6] : [x0, x1];
    return [[room.id, { position: [(xr[0]! + xr[1]!) / 2, room.ceiling - 0.05, (z0 + z1) / 2], width: (xr[1]! - xr[0]!) * 0.8, height: (z1 - z0) * 0.8, ...wash }]];
  }),
);

function WashLight({ wash }: { wash: Wash | undefined }) {
  // An unused slot stays in the scene at zero intensity so the shader light count never changes.
  const w = wash ?? { position: [0, -50, 0] as [number, number, number], width: 1, height: 1, intensity: 0, color: "#ffffff" };
  return <rectAreaLight position={w.position} rotation={[-Math.PI / 2, 0, 0]} width={w.width} height={w.height} intensity={w.intensity} color={w.color} />;
}

/**
 * Area lights are the most expensive part of shading. High quality lights every room; Balanced
 * keeps a fixed pool of two that follow the visitor: the room they are in and the last one before.
 */
function RoomWash() {
  const quality = useMuseum((s) => s.quality);
  const room = useMuseum((s) => s.room);
  const [pool, setPool] = useState<[RoomId | null, RoomId | null]>(["reception", null]);
  useEffect(() => {
    if (!room || !washes[room]) return;
    setPool(([a, b]) => (a === room ? [a, b] : [room, a]));
  }, [room]);
  if (quality === "high") return <>{(Object.keys(washes) as RoomId[]).map((id) => <WashLight key={id} wash={washes[id]} />)}</>;
  return (
    <>
      <WashLight wash={pool[0] ? washes[pool[0]] : undefined} />
      <WashLight wash={pool[1] ? washes[pool[1]] : undefined} />
    </>
  );
}

export function Lighting() {
  useMemo(() => RectAreaLightUniformsLib.init(), []);
  const sunPos = useMemo(() => SUN_DIRECTION.clone().multiplyScalar(1000), []);
  return (
    <>
      <Sky distance={4500} sunPosition={sunPos} turbidity={5.5} rayleigh={1.1} mieCoefficient={0.004} mieDirectionalG={0.82} />
      <fog attach="fog" args={["#e3dccd", 110, 380]} />
      <hemisphereLight args={["#f3eadb", "#7d6b55", 0.55]} />
      <Sun />
      <RoomWash />
      {/* Warm bounce in the atrium from the sunlit drum */}
      <pointLight position={[0, 6.5, 0]} intensity={60} distance={18} decay={2} color="#ffe7c6" />
      <Environment resolution={128} frames={1} environmentIntensity={0.35}>
        <Lightformer form="rect" intensity={2.2} color="#fff3df" position={[0, 12, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[30, 30, 1]} />
        <Lightformer form="rect" intensity={1.2} color="#e9dcc5" position={[0, -6, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[30, 30, 1]} />
        <Lightformer form="rect" intensity={1.6} color="#ffe2b8" position={[-12, 6, 10]} rotation={[0, Math.PI / 3, 0]} scale={[12, 6, 1]} />
        <Lightformer form="ring" intensity={3} color="#fffaf0" position={[0, 9, -6]} scale={3} />
      </Environment>
    </>
  );
}
