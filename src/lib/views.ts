import type { RoomId } from "@/content/types";
import { asset } from "./paths";

/**
 * Stills rendered from the real-time 3D museum (High quality, interface hidden), so the
 * website shows the spaces as they actually appear when you walk through them.
 */
const views: Partial<Record<RoomId, string>> = {
  forecourt: "forecourt",
  "gallery-sculpture": "gallery-sculpture",
  "gallery-painting": "gallery-painting",
  "gallery-photography": "gallery-photography",
  "gallery-installation": "gallery-installation",
  "gallery-royal": "gallery-royal",
};

export function roomView(room: RoomId): string | undefined {
  const name = views[room];
  return name ? asset(`/views/${name}.webp`) : undefined;
}
