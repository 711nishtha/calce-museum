"use client";

import { useRef, useState } from "react";
import { touchInput } from "@/three/state/museumStore";

const RADIUS = 48;

/**
 * Touch navigation: drag on the left half to walk (a joystick appears under your
 * thumb), drag on the right half to look around.
 */
export function TouchControls() {
  const [stick, setStick] = useState<{ x: number; y: number; dx: number; dy: number } | null>(null);
  const moveId = useRef<number | null>(null);
  const look = useRef<{ id: number; x: number; y: number } | null>(null);

  const onDown = (e: React.PointerEvent) => {
    if (e.pointerType === "mouse") return;
    try {
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    } catch {
      /* capture is a nicety; dragging still works without it */
    }
    if (e.clientX < window.innerWidth / 2 && moveId.current === null) {
      moveId.current = e.pointerId;
      setStick({ x: e.clientX, y: e.clientY, dx: 0, dy: 0 });
    } else if (!look.current) {
      look.current = { id: e.pointerId, x: e.clientX, y: e.clientY };
    }
  };
  const onMove = (e: React.PointerEvent) => {
    if (e.pointerId === moveId.current && stick) {
      let dx = e.clientX - stick.x;
      let dy = e.clientY - stick.y;
      const d = Math.hypot(dx, dy);
      if (d > RADIUS) {
        dx = (dx / d) * RADIUS;
        dy = (dy / d) * RADIUS;
      }
      touchInput.moveX = dx / RADIUS;
      touchInput.moveY = dy / RADIUS;
      setStick({ ...stick, dx, dy });
    } else if (look.current && e.pointerId === look.current.id) {
      touchInput.lookX += e.clientX - look.current.x;
      touchInput.lookY += e.clientY - look.current.y;
      look.current = { ...look.current, x: e.clientX, y: e.clientY };
    }
  };
  const onUp = (e: React.PointerEvent) => {
    if (e.pointerId === moveId.current) {
      moveId.current = null;
      touchInput.moveX = 0;
      touchInput.moveY = 0;
      setStick(null);
    }
    if (look.current?.id === e.pointerId) look.current = null;
  };

  return (
    <div className="m-touch" onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp} aria-hidden="true">
      {stick ? (
        <div className="m-stick" style={{ left: stick.x, top: stick.y }}>
          <span style={{ transform: `translate(${stick.dx}px, ${stick.dy}px)` }} />
        </div>
      ) : (
        <p className="m-touch-hint">Drag left to walk · drag right to look</p>
      )}
    </div>
  );
}
