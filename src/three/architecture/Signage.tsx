"use client";

import { Text } from "@react-three/drei";
import { ATRIUM } from "@/architecture/floorplan";
import { exhibitions } from "@/content/exhibitions";
import { formatRange } from "@/lib/format";
import { asset } from "@/lib/paths";

const SERIF = asset("/fonts/InstrumentSerif-Regular.ttf");
const SANS = asset("/fonts/InstrumentSans.ttf");
const INK = "#2A211B";

/** Wall text at each gallery entrance: number, title, dates and opening paragraph. */
const wallTexts: { exId: string; position: [number, number, number]; rotation: number }[] = [
  { exId: "weight-of-stillness", position: [11.22, 1.9, -5], rotation: Math.PI / 2 },
  { exId: "grammar-of-walls", position: [-11.22, 1.9, 5], rotation: -Math.PI / 2 },
  { exId: "salt-and-light", position: [-5.6, 1.9, -11.22], rotation: Math.PI },
  { exId: "rooms-that-listen", position: [-6, 1.9, -27.22], rotation: Math.PI },
];

/** Labels carved above the passages inside the atrium drum, facing the centre. */
const drumLabels = [
  { text: "I · SCULPTURE", angle: 0 },
  { text: "RECEPTION · CAFÉ · SHOP", angle: Math.PI / 2 },
  { text: "II · PAINTING", angle: Math.PI },
  { text: "III · PHOTOGRAPHY  ·  IV · INSTALLATION", angle: -Math.PI / 2 },
];

const roman = ["I", "II", "III", "IV"];

export function Signage() {
  return (
    <group>
      {/* Façade lettering on the shop wing, beside the portal */}
      <group position={[-12.6, 3.3, 23.22]}>
        <Text font={SERIF} fontSize={1.25} letterSpacing={0.16} color={INK} anchorX="center" anchorY="middle">
          CALCE
        </Text>
        <Text font={SANS} fontSize={0.24} letterSpacing={0.18} color={INK} position={[0, -0.95, 0]} anchorX="center" anchorY="middle">
          THE CULTURAL SALON
        </Text>
      </group>

      {drumLabels.map((l) => {
        const r = ATRIUM.r - 0.22;
        const x = ATRIUM.cx + Math.cos(l.angle) * r;
        const z = ATRIUM.cz + Math.sin(l.angle) * r;
        return (
          <Text key={l.text} font={SANS} fontSize={0.2} letterSpacing={0.22} color={INK} position={[x, 4.95, z]} rotation={[0, -l.angle - Math.PI / 2, 0]} anchorX="center" anchorY="middle">
            {l.text}
          </Text>
        );
      })}

      {wallTexts.map((w) => {
        const ex = exhibitions.find((e) => e.id === w.exId)!;
        const i = Number(ex.number) - 1;
        return (
          <group key={w.exId} position={w.position} rotation={[0, w.rotation, 0]}>
            <Text font={SERIF} fontSize={0.62} color={ex.accent} anchorX="left" anchorY="top" position={[-1.3, 1.3, 0]}>
              {roman[i]}
            </Text>
            <Text font={SERIF} fontSize={0.3} color={INK} anchorX="left" anchorY="top" position={[-1.3, 0.55, 0]} maxWidth={2.6} lineHeight={1.05}>
              {ex.title}
            </Text>
            <Text font={SANS} fontSize={0.075} letterSpacing={0.12} color={INK} anchorX="left" anchorY="top" position={[-1.3, 0.05, 0]}>
              {formatRange(ex.opens, ex.closes).toUpperCase()}
            </Text>
            <Text font={SANS} fontSize={0.062} color={INK} anchorX="left" anchorY="top" position={[-1.3, -0.15, 0]} maxWidth={2.5} lineHeight={1.5}>
              {ex.statement[0]}
            </Text>
          </group>
        );
      })}
    </group>
  );
}
