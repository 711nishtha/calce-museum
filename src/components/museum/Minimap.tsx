"use client";

import { useMemo } from "react";
import { rooms } from "@/architecture/floorplan";
import { arrivalFor } from "@/architecture/navigation";
import { MAP_VIEWBOX, mapSvg } from "@/graphics/map-svg";
import { useMuseum } from "@/three/state/museumStore";

/** Floor plan with the visitor's position and heading. Rooms are buttons that take you there. */
export function Minimap() {
  const pose = useMuseum((s) => s.pose);
  const room = useMuseum((s) => s.room);
  const goTo = useMuseum((s) => s.goTo);
  const svg = useMemo(() => mapSvg({ labels: false, works: true, background: "#F5F0E7" }), []);
  const deg = (-pose.yaw * 180) / Math.PI;
  const current = rooms.find((r) => r.id === room);

  return (
    <nav className="m-minimap" aria-label="Museum map">
      <div className="m-minimap__frame">
        <div aria-hidden="true" dangerouslySetInnerHTML={{ __html: svg }} />
        <svg className="m-minimap__overlay" viewBox={MAP_VIEWBOX} preserveAspectRatio="xMidYMid meet">
          {rooms
            .filter((r) => r.kind !== "passage")
            .map((r) => {
              const go = () => goTo(arrivalFor(r.id));
              const props = {
                role: "button",
                tabIndex: 0,
                "aria-label": `Go to ${r.name}`,
                onClick: go,
                onKeyDown: (e: React.KeyboardEvent) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), go()),
              };
              const s = r.shape;
              return (
                <g key={r.id} {...props}>
                  <title>{r.name}</title>
                  {s.type === "rect" ? (
                    <rect x={s.x0} y={s.z0} width={s.x1 - s.x0} height={s.z1 - s.z0} fill={r.id === room ? "rgb(167 95 64 / 16%)" : "transparent"} />
                  ) : (
                    <circle cx={s.cx} cy={s.cz} r={s.r} fill={r.id === room ? "rgb(167 95 64 / 16%)" : "transparent"} />
                  )}
                </g>
              );
            })}
          <g transform={`translate(${pose.x} ${pose.z}) rotate(${deg})`} pointerEvents="none">
            <path d="M0,-2.6 L1.7,1.8 L0,0.9 L-1.7,1.8 Z" fill="#8C4A2F" stroke="#F5F0E7" strokeWidth="0.4" />
          </g>
        </svg>
      </div>
      <p className="m-minimap__caption" aria-live="polite">
        {current ? current.name : "Outside"}
      </p>
    </nav>
  );
}
