"use client";

import { useFrame, useThree } from "@react-three/fiber";
import gsap from "gsap";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { buildCollider, moveWithCollision } from "@/architecture/collision";
import { EYE_HEIGHT, SPAWN, roomAt } from "@/architecture/floorplan";
import { touchInput, useMuseum, type CameraTarget } from "../state/museumStore";

const WALK = 1.7; // m/s — an unhurried gallery pace
const BRISK = 3.2;
const TURN = 1.7; // rad/s for keyboard turning
const MOUSE = 0.0021;
const TOUCH_LOOK = 0.0042;
const PITCH_LIMIT = 1.3;

const MOVE_KEYS = new Set(["KeyW", "KeyA", "KeyS", "KeyD", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "ShiftLeft", "ShiftRight"]);

export function requestLock(el: HTMLElement | null) {
  if (!el || document.pointerLockElement === el) return;
  try {
    const r = el.requestPointerLock() as unknown as Promise<void> | undefined;
    r?.catch?.(() => undefined);
  } catch {
    /* pointer lock can be refused (iframes, rapid re-requests); the UI stays usable */
  }
}

export function Player() {
  const { camera, gl } = useThree();
  const collider = useMemo(() => buildCollider(), []);
  const keys = useRef(new Set<string>());
  const yaw = useRef(SPAWN.yaw);
  const pitch = useRef(0);
  const vel = useRef(new THREE.Vector2());
  const walked = useRef(0);
  const lastPose = useRef(0);
  const reduced = useMemo(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches, []);

  useEffect(() => {
    camera.position.set(...SPAWN.position);
    camera.rotation.order = "YXZ";
  }, [camera]);

  useEffect(() => {
    const el = gl.domElement;
    const onLock = () => useMuseum.getState().setLocked(document.pointerLockElement === el);
    const onMove = (e: MouseEvent) => {
      if (document.pointerLockElement !== el || useMuseum.getState().travelling) return;
      yaw.current -= e.movementX * MOUSE;
      pitch.current = THREE.MathUtils.clamp(pitch.current - e.movementY * MOUSE, -PITCH_LIMIT, PITCH_LIMIT);
    };
    const typing = (e: KeyboardEvent) => e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement;
    const onDown = (e: KeyboardEvent) => {
      if (typing(e) || !MOVE_KEYS.has(e.code)) return;
      const s = useMuseum.getState();
      if (s.panel !== "none" || s.mode === "intro") return;
      // arrow keys would otherwise scroll focused panels or the page
      if (e.code.startsWith("Arrow")) e.preventDefault();
      keys.current.add(e.code);
    };
    const onUp = (e: KeyboardEvent) => keys.current.delete(e.code);
    const clear = () => keys.current.clear();
    document.addEventListener("pointerlockchange", onLock);
    document.addEventListener("mousemove", onMove);
    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    window.addEventListener("blur", clear);
    return () => {
      document.removeEventListener("pointerlockchange", onLock);
      document.removeEventListener("mousemove", onMove);
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
      window.removeEventListener("blur", clear);
    };
  }, [gl]);

  // Panels opening should stop any held movement.
  useEffect(() => useMuseum.subscribe((s, prev) => s.panel !== prev.panel && keys.current.clear()), []);

  function travel(t: CameraTarget) {
    const store = useMuseum.getState();
    const from = camera.position.clone();
    const to = new THREE.Vector3(...t.position);
    const look = new THREE.Matrix4().lookAt(to, new THREE.Vector3(...t.lookAt), new THREE.Vector3(0, 1, 0));
    const endQ = new THREE.Quaternion().setFromRotationMatrix(look);
    const settle = () => {
      const e = new THREE.Euler().setFromQuaternion(endQ, "YXZ");
      yaw.current = e.y;
      pitch.current = THREE.MathUtils.clamp(e.x, -PITCH_LIMIT, PITCH_LIMIT);
      vel.current.set(0, 0);
      useMuseum.getState().setTravelling(false);
    };
    store.setTravelling(true);
    keys.current.clear();
    const sameRoom = roomAt(from.x, from.z)?.id === roomAt(to.x, to.z)?.id;
    const duration = t.duration ?? (sameRoom ? Math.min(2.4, 0.8 + from.distanceTo(to) * 0.18) : 0);

    if (reduced || duration === 0) {
      // Different rooms: fade through ivory rather than gliding through walls.
      const veil = document.getElementById("museum-veil");
      const jump = () => {
        camera.position.copy(to);
        camera.quaternion.copy(endQ);
        settle();
      };
      if (!veil || reduced) return jump();
      gsap.timeline()
        .to(veil, { opacity: 1, duration: 0.45, ease: "power2.in" })
        .add(jump)
        .to(veil, { opacity: 0, duration: 0.7, ease: "power2.out", delay: 0.15 });
      return;
    }
    const startQ = camera.quaternion.clone();
    const proxy = { k: 0 };
    gsap.to(proxy, {
      k: 1,
      duration,
      ease: "power2.inOut",
      onUpdate: () => {
        camera.position.lerpVectors(from, to, proxy.k);
        camera.quaternion.slerpQuaternions(startQ, endQ, proxy.k);
      },
      onComplete: settle,
    });
  }

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    const s = useMuseum.getState();
    const target = s.cameraTarget && s.consumeCameraTarget();
    if (target) travel(target);
    if (s.travelling) return;

    // Cinematic approach behind the start screen: a slow drift in front of the façade.
    if (s.mode === "intro") {
      const t = reduced ? 0 : performance.now() / 1000;
      camera.position.set(Math.sin(t * 0.05) * 5, 2.2 + Math.sin(t * 0.08) * 0.25, 41.2);
      camera.lookAt(-2 + Math.sin(t * 0.05) * 2, 3.6, 23);
      const e = new THREE.Euler().setFromQuaternion(camera.quaternion, "YXZ");
      yaw.current = e.y;
      pitch.current = e.x;
      return;
    }

    // Look: keyboard turning and touch drag
    const k = keys.current;
    if (k.has("ArrowLeft")) yaw.current += TURN * dt;
    if (k.has("ArrowRight")) yaw.current -= TURN * dt;
    if (touchInput.lookX || touchInput.lookY) {
      yaw.current -= touchInput.lookX * TOUCH_LOOK;
      pitch.current = THREE.MathUtils.clamp(pitch.current - touchInput.lookY * TOUCH_LOOK, -PITCH_LIMIT, PITCH_LIMIT);
      touchInput.lookX = 0;
      touchInput.lookY = 0;
    }
    camera.rotation.set(pitch.current, yaw.current, 0, "YXZ");

    // Move
    let fwd = 0;
    let side = 0;
    if (s.panel === "none") {
      if (k.has("KeyW") || k.has("ArrowUp")) fwd += 1;
      if (k.has("KeyS") || k.has("ArrowDown")) fwd -= 1;
      if (k.has("KeyD")) side += 1;
      if (k.has("KeyA")) side -= 1;
      fwd += -touchInput.moveY;
      side += touchInput.moveX;
    }
    const len = Math.hypot(fwd, side);
    if (len > 1) {
      fwd /= len;
      side /= len;
    }
    const speed = k.has("ShiftLeft") || k.has("ShiftRight") ? BRISK : WALK;
    const sin = Math.sin(yaw.current);
    const cos = Math.cos(yaw.current);
    const wantX = (-sin * fwd + cos * side) * speed;
    const wantZ = (-cos * fwd - sin * side) * speed;
    const ease = 1 - Math.exp(-dt * 9);
    vel.current.x += (wantX - vel.current.x) * ease;
    vel.current.y += (wantZ - vel.current.y) * ease;

    const [nx, nz] = moveWithCollision(collider, camera.position.x, camera.position.z, vel.current.x * dt, vel.current.y * dt);
    const moved = Math.hypot(nx - camera.position.x, nz - camera.position.z);
    walked.current += moved;
    camera.position.x = nx;
    camera.position.z = nz;
    const bob = reduced ? 0 : Math.sin(walked.current * 5.2) * 0.012 * Math.min(1, moved / (dt * WALK + 1e-6));
    camera.position.y = EYE_HEIGHT + bob;

    s.setRoom(roomAt(nx, nz)?.id ?? null);
    const now = performance.now();
    if (now - lastPose.current > 120) {
      lastPose.current = now;
      s.setPose({ x: nx, z: nz, yaw: yaw.current });
    }
  });

  return null;
}
