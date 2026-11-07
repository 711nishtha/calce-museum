"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useMuseum } from "../state/museumStore";
import { artworkHits } from "./registry";

const REACH = 5;

/**
 * Looks along the centre of view a few times a second. The nearest artwork within
 * reach, not hidden behind architecture, becomes "focused"; E, Enter or a click opens it.
 */
export function Interaction() {
  const { camera, scene, gl } = useThree();
  const ray = useMemo(() => {
    const r = new THREE.Raycaster();
    r.far = REACH;
    return r;
  }, []);
  const last = useRef(0);
  const centre = useMemo(() => new THREE.Vector2(0, 0), []);

  useFrame(() => {
    const now = performance.now();
    if (now - last.current < 110) return;
    last.current = now;
    const s = useMuseum.getState();
    if (s.travelling || s.panel !== "none") return;
    ray.setFromCamera(centre, camera);
    const hits = ray.intersectObjects([...artworkHits], false);
    const hit = hits[0];
    if (!hit) return s.setFocused(null);
    const arch = scene.getObjectByName("architecture");
    if (arch) {
      const block = ray.intersectObject(arch, true)[0];
      if (block && block.distance + 0.05 < hit.distance) return s.setFocused(null);
    }
    s.setFocused(hit.object.userData.artworkId as string);
  });

  useEffect(() => {
    const open = () => {
      const s = useMuseum.getState();
      if (!s.focusedArtworkId || s.panel !== "none") return false;
      s.openArtwork(s.focusedArtworkId);
      if (document.pointerLockElement) document.exitPointerLock();
      return true;
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.code === "KeyE" || (e.code === "Enter" && document.pointerLockElement)) {
        if (open()) e.preventDefault();
      }
    };
    const onClick = () => {
      if (document.pointerLockElement === gl.domElement) open();
    };
    window.addEventListener("keydown", onKey);
    gl.domElement.addEventListener("click", onClick);
    return () => {
      window.removeEventListener("keydown", onKey);
      gl.domElement.removeEventListener("click", onClick);
    };
  }, [gl]);

  return null;
}
