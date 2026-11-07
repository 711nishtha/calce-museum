"use client";

import { fixtures, type Obstacle } from "@/architecture/floorplan";
import { matte, surface } from "../materials/materials";

type Rect = Extract<Obstacle, { type: "rect" }>;
type Circle = Extract<Obstacle, { type: "circle" }>;

const centre = (r: Rect) => [(r.x0 + r.x1) / 2, (r.z0 + r.z1) / 2] as const;

function Block({ r, h, material, y = 0 }: { r: Rect; h: number; material: ReturnType<typeof matte>; y?: number }) {
  const [cx, cz] = centre(r);
  return (
    <mesh position={[cx, y + h / 2, cz]} material={material} castShadow receiveShadow>
      <boxGeometry args={[r.x1 - r.x0, h, r.z1 - r.z0]} />
    </mesh>
  );
}

function OakBench({ r }: { r: Rect }) {
  const [cx, cz] = centre(r);
  const along = r.x1 - r.x0 > r.z1 - r.z0;
  const len = along ? r.x1 - r.x0 : r.z1 - r.z0;
  const dep = along ? r.z1 - r.z0 : r.x1 - r.x0;
  return (
    <group position={[cx, 0, cz]} rotation={[0, along ? 0 : Math.PI / 2, 0]}>
      <mesh position={[0, 0.44, 0]} material={surface("oak")} castShadow receiveShadow>
        <boxGeometry args={[len, 0.07, dep]} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * (len / 2 - 0.2), 0.2, 0]} material={matte("#3b3029", 0.6)} castShadow>
          <boxGeometry args={[0.06, 0.4, dep - 0.08]} />
        </mesh>
      ))}
    </group>
  );
}

function CafeTable({ c }: { c: Circle }) {
  const chairs = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2];
  return (
    <group position={[c.x, 0, c.z]}>
      <mesh position={[0, 0.74, 0]} material={surface("travertine")} castShadow receiveShadow>
        <cylinderGeometry args={[0.42, 0.42, 0.04, 32]} />
      </mesh>
      <mesh position={[0, 0.37, 0]} material={matte("#3b3029", 0.5)} castShadow>
        <cylinderGeometry args={[0.035, 0.18, 0.72, 12]} />
      </mesh>
      {chairs.map((a) => (
        <group key={a} position={[Math.cos(a) * 0.62, 0, Math.sin(a) * 0.62]} rotation={[0, -a + Math.PI / 2, 0]}>
          <mesh position={[0, 0.45, 0]} material={surface("oak")} castShadow>
            <boxGeometry args={[0.42, 0.04, 0.4]} />
          </mesh>
          <mesh position={[0, 0.72, -0.19]} material={surface("oak")} castShadow>
            <boxGeometry args={[0.42, 0.5, 0.03]} />
          </mesh>
          <mesh position={[0, 0.22, 0]} material={matte("#3b3029", 0.5)}>
            <boxGeometry args={[0.36, 0.44, 0.34]} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function ShopShelf({ r }: { r: Rect }) {
  const [cx, cz] = centre(r);
  const len = r.z1 - r.z0;
  const objects = ["#A75F40", "#E8DFCE", "#2E4560", "#777C58", "#C8B69A", "#674B3A"];
  return (
    <group position={[cx, 0, cz]}>
      {[0.1, 0.75, 1.4, 2.05].map((y) => (
        <mesh key={y} position={[0, y, 0]} material={surface("oak")} castShadow receiveShadow>
          <boxGeometry args={[r.x1 - r.x0, 0.04, len]} />
        </mesh>
      ))}
      {Array.from({ length: 24 }, (_, i) => {
        const shelf = [0.1, 0.75, 1.4][i % 3]!;
        const z = -len / 2 + 0.4 + (i * 0.41) % (len - 0.8);
        const tall = 0.18 + ((i * 7) % 5) * 0.06;
        return (
          <mesh key={i} position={[0, shelf + 0.02 + tall / 2, z]} material={matte(objects[i % objects.length]!, 0.8)} castShadow>
            <boxGeometry args={[0.24, tall, 0.06 + (i % 3) * 0.04]} />
          </mesh>
        );
      })}
    </group>
  );
}

/** Reception desk, café, shop and gallery furniture, all derived from the fixture list. */
export function Furniture() {
  return (
    <group>
      {fixtures.map((f, i) => {
        if (f.type === "circle" && f.tag === "table") return <CafeTable key={i} c={f} />;
        if (f.type !== "rect") return null;
        switch (f.tag) {
          case "desk":
          case "counter":
          case "shop-counter":
            return (
              <group key={i}>
                <Block r={f} h={1.02} material={surface("ashlar")} />
                <Block r={{ ...f, x0: f.x0 - 0.05, x1: f.x1 + 0.05, z0: f.z0 - 0.05, z1: f.z1 + 0.05 }} h={0.05} y={1.02} material={surface("travertine")} />
              </group>
            );
          case "shelf":
            return <ShopShelf key={i} r={f} />;
          case "shop-table":
          case "reading-table":
            return (
              <group key={i}>
                <Block r={f} h={0.05} y={0.78} material={surface("oak")} />
                <Block r={{ ...f, x0: f.x0 + 0.3, x1: f.x1 - 0.3, z0: f.z0 + 0.3, z1: f.z1 - 0.3 }} h={0.78} material={matte("#3b3029", 0.6)} />
                {Array.from({ length: f.tag === "reading-table" ? 4 : 9 }, (_, k) => {
                  const [cx, cz] = centre(f);
                  const cols = f.tag === "reading-table" ? 2 : 3;
                  const x = cx + ((k % cols) - (cols - 1) / 2) * 0.8;
                  const z = cz + (Math.floor(k / cols) - (f.tag === "reading-table" ? 0.5 : 1)) * 0.9;
                  return (
                    <mesh key={k} position={[x, 0.85, z]} rotation={[0, k * 0.2, 0]} material={matte(["#E8DFCE", "#2E4560", "#A75F40", "#F5F0E7"][k % 4]!, 0.8)} castShadow>
                      <boxGeometry args={[0.32, 0.03 + (k % 2) * 0.02, 0.44]} />
                    </mesh>
                  );
                })}
              </group>
            );
          case "bench":
            return <OakBench key={i} r={f} />;
          default:
            return null;
        }
      })}
    </group>
  );
}
