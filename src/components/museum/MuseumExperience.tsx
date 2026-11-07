"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SPAWN, roomById } from "@/architecture/floorplan";
import { arrivalFor, viewpointFor, type Viewpoint } from "@/architecture/navigation";
import { getArtist } from "@/content/artists";
import { artworks, getArtwork } from "@/content/artworks";
import { getExhibition } from "@/content/exhibitions";
import type { RoomId } from "@/content/types";
import { BrandMark } from "@/components/ui/BrandMark";
import { requestLock } from "@/three/controls/Player";
import { useMuseum, type Quality } from "@/three/state/museumStore";
import { ArtworkPanel } from "./ArtworkPanel";
import { Directory } from "./Directory";
import { Minimap } from "./Minimap";
import { TouchControls } from "./TouchControls";
import { TourPanel } from "./TourPanel";

const MuseumCanvas = dynamic(() => import("@/three/scene/MuseumCanvas"), { ssr: false });

/** Detects WebGL and whether the GPU looks integrated or mobile (a hint for the default quality). */
function probeGPU(): { webgl: boolean; modest: boolean } {
  try {
    const c = document.createElement("canvas");
    const gl = (c.getContext("webgl2") || c.getContext("webgl")) as WebGLRenderingContext | null;
    if (!gl) return { webgl: false, modest: true };
    const info = gl.getExtension("WEBGL_debug_renderer_info");
    const name = info ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL)) : "";
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return { webgl: true, modest: /intel|uhd|iris|mali|adreno|powervr|apple gpu|swiftshader|llvmpipe/i.test(name) };
  } catch {
    return { webgl: false, modest: true };
  }
}

type Deep = { kind: "room"; room: RoomId; view: Viewpoint } | { kind: "work"; id: string; view: Viewpoint } | { kind: "tour" } | null;

function useDeepLink(): Deep {
  const params = useSearchParams();
  return useMemo(() => {
    if (params.get("tour") === "1") return { kind: "tour" };
    const workId = params.get("work");
    const work = workId ? getArtwork(workId) : undefined;
    if (work) {
      const view = viewpointFor(work);
      if (view) return { kind: "work", id: work.id, view };
    }
    const room = params.get("room");
    if (room) {
      try {
        roomById(room as RoomId);
        return { kind: "room", room: room as RoomId, view: arrivalFor(room as RoomId) };
      } catch {
        return null;
      }
    }
    return null;
  }, [params]);
}

function Fallback({ reason }: { reason: string }) {
  return (
    <div className="m-fallback stack-lg" style={{ overflowY: "auto", height: "100%" }}>
      <BrandMark className="brand__mark" />
      <h1 className="h1">The 3D museum can’t open here</h1>
      <p className="lede">{reason}</p>
      <p>Every room and work is also available on the website, with the same texts and images.</p>
      <div className="btn-row">
        <Link href="/map" className="btn btn--primary">
          Map &amp; guided tour
        </Link>
        <Link href="/collection" className="btn">
          Browse the collection
        </Link>
        <Link href="/" className="btn">
          Home
        </Link>
      </div>
    </div>
  );
}

export function MuseumExperience() {
  const deep = useDeepLink();
  const [support, setSupport] = useState<"checking" | "ok" | "none" | "lost">("checking");
  const [showMap, setShowMap] = useState(true);
  const rootRef = useRef<HTMLDivElement>(null);
  const s = useMuseum();
  const focused = s.focusedArtworkId ? getArtwork(s.focusedArtworkId) : undefined;
  const room = s.room ? roomById(s.room) : null;
  const exhibition = room?.exhibitionId ? getExhibition(room.exhibitionId) : undefined;

  useEffect(() => {
    const gpu = probeGPU();
    setSupport(gpu.webgl ? "ok" : "none");
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    useMuseum.getState().setTouch(coarse);
    if (coarse || window.innerWidth < 720) setShowMap(false);
    if (gpu.modest || coarse || (navigator.hardwareConcurrency ?? 8) <= 4) useMuseum.getState().setQuality("balanced");
    return () => {
      // leaving the route: reset so returning starts fresh
      useMuseum.setState({ mode: "intro", panel: "none", openArtworkId: null, focusedArtworkId: null, tourIndex: 0, cameraTarget: null, travelling: false });
    };
  }, []);

  const canvas = () => rootRef.current?.querySelector("canvas") ?? null;

  const lockIfDesktop = useCallback(() => {
    if (!useMuseum.getState().touch) requestLock(canvas());
  }, []);

  const begin = (mode: "walk" | "tour") => {
    const st = useMuseum.getState();
    st.setMode(mode);
    if (mode === "tour") {
      st.setTourIndex(0);
      return;
    }
    if (deep?.kind === "room" || deep?.kind === "work") {
      st.goTo(deep.view);
      if (deep.kind === "work") {
        const unsub = useMuseum.subscribe((n, p) => {
          if (p.travelling && !n.travelling) {
            unsub();
            useMuseum.getState().openArtwork(deep.id);
          }
        });
      }
    } else st.goTo({ position: SPAWN.position, lookAt: [0, 3, 23], duration: 0.9 });
    lockIfDesktop();
  };

  const closePanel = useCallback(() => {
    const st = useMuseum.getState();
    st.closeArtwork();
    if (st.mode === "walk") lockIfDesktop();
  }, [lockIfDesktop]);

  const exitTour = useCallback(() => {
    useMuseum.getState().setMode("walk");
    lockIfDesktop();
  }, [lockIfDesktop]);

  // Global shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const st = useMuseum.getState();
      if (st.mode === "intro") return;
      if (e.code === "KeyM") setShowMap((v) => !v);
      if (e.code === "KeyG" && st.panel === "none") {
        if (document.pointerLockElement) document.exitPointerLock();
        st.setPanel("directory");
      }
      if (e.code === "KeyT" && st.panel === "none") {
        if (st.mode === "tour") exitTour();
        else {
          if (document.pointerLockElement) document.exitPointerLock();
          st.setMode("tour");
          st.setTourIndex(0);
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [exitTour]);

  if (support === "none") return <div className="museum"><Fallback reason="Your browser or device doesn’t provide WebGL, which the real-time museum needs." /></div>;
  if (support === "lost") return <div className="museum"><Fallback reason="The graphics device stopped responding. Reloading the page usually brings the museum back." /></div>;

  const loading = Math.round(s.loadingProgress * 100);
  const deepLabel = deep?.kind === "room" ? roomById(deep.room).name : deep?.kind === "work" ? getArtwork(deep.id)?.title : null;
  const showPaused = s.mode === "walk" && !s.locked && !s.touch && s.panel === "none";

  return (
    <div className="museum" ref={rootRef}>
      {support === "ok" && <MuseumCanvas onContextLost={() => setSupport("lost")} />}
      <div id="museum-veil" className="museum-veil" aria-hidden="true" />

      {s.touch && s.mode !== "intro" && s.panel === "none" && <TouchControls />}

      {s.mode !== "intro" && (
        <header className="m-top">
          <Link href="/" className="m-brand" aria-label="Leave the 3D museum and return to the website">
            <BrandMark />
            <span>CALCE</span>
          </Link>
          <div className="m-place" aria-live="polite">
            <div className="m-place__room">{room?.name ?? "Outside"}</div>
            {exhibition && <div className="m-place__ex">{exhibition.title}</div>}
          </div>
          <div className="m-tools">
            <button type="button" className="m-btn" aria-pressed={showMap} onClick={() => setShowMap((v) => !v)}>
              Map <kbd>M</kbd>
            </button>
            <button type="button" className="m-btn" onClick={() => s.setPanel("directory")}>
              Directory <kbd>G</kbd>
            </button>
            <button
              type="button"
              className="m-btn"
              aria-pressed={s.mode === "tour"}
              onClick={() => {
                if (s.mode === "tour") exitTour();
                else {
                  s.setMode("tour");
                  s.setTourIndex(0);
                }
              }}
            >
              <span className="m-btn__label--wide">Guided</span> tour <kbd>T</kbd>
            </button>
            <Link href="/" className="m-btn m-btn--exit">
              Exit
            </Link>
          </div>
        </header>
      )}

      {s.mode !== "intro" && !s.touch && s.locked && <div className="m-reticle" data-focus={!!focused} aria-hidden="true" />}

      {s.mode !== "intro" && focused && s.panel === "none" && !s.travelling && (
        <div className="m-prompt" role="status">
          <span className="m-prompt__title">{focused.title}</span>
          <span className="m-prompt__by">{getArtist(focused.artistId)?.name}</span>
          <button
            type="button"
            className="m-btn m-btn--primary"
            onClick={() => {
              s.openArtwork(focused.id);
              if (document.pointerLockElement) document.exitPointerLock();
            }}
          >
            {s.touch ? "Read" : (
              <>
                Read <kbd>E</kbd>
              </>
            )}
          </button>
        </div>
      )}

      {s.mode !== "intro" && showMap && <Minimap />}
      {s.mode === "tour" && s.panel === "none" && <TourPanel onExit={exitTour} />}

      {showPaused && s.mode === "walk" && (
        <div className="m-panel m-paused" role="status">
          <span>Paused — click the view to look around, or keep using the arrow keys.</span>
          <button type="button" className="m-btn m-btn--primary" onClick={lockIfDesktop}>
            Continue walking
          </button>
        </div>
      )}

      {s.panel === "artwork" && <ArtworkPanel onClose={closePanel} />}
      {s.panel === "directory" && <Directory onClose={() => s.setPanel("none")} />}

      {s.mode === "intro" && (
        <section className="m-start" aria-labelledby="m-start-title">
          <div className="m-start__inner">
            <span className="eyebrow">CALCE · The 3D museum</span>
            <h1 id="m-start-title">{deepLabel ? <>Into {deepLabel}</> : <>Walk in slowly</>}</h1>
            <p className="lede mt-4">
              A real-time model of the museum: the forecourt, reception, atrium, four galleries, the café, garden and shop, hung with all {artworks.length} works.
            </p>
            {s.touch ? (
              <dl className="m-keys">
                <dt>Walk</dt>
                <dd>Drag on the left of the screen</dd>
                <dt>Look</dt>
                <dd>Drag on the right of the screen</dd>
                <dt>Read</dt>
                <dd>Face a work and tap “Read”</dd>
              </dl>
            ) : (
              <dl className="m-keys">
                <dt>W A S D / ↑ ↓</dt>
                <dd>Walk · hold Shift to walk briskly</dd>
                <dt>Mouse / ← →</dt>
                <dd>Look around (keyboard turning works without a mouse)</dd>
                <dt>E or click</dt>
                <dd>Read about the work in front of you</dd>
                <dt>M · G · T</dt>
                <dd>Map · directory of rooms and works · guided tour</dd>
                <dt>Esc</dt>
                <dd>Release the mouse; close a panel</dd>
              </dl>
            )}
            <div className="m-progress" aria-hidden="true">
              <span style={{ width: `${loading}%` }} />
            </div>
            <p className="small soft" role="status">
              {s.ready ? "All works are hung." : `Hanging the works… ${loading}%`}
            </p>
            <div className="btn-row mt-4">
              <button type="button" className="m-btn m-btn--primary" onClick={() => begin(deep?.kind === "tour" ? "tour" : "walk")}>
                {deep?.kind === "tour" ? "Begin the guided tour" : deepLabel ? `Go to ${deepLabel}` : "Enter the museum"}
              </button>
              <button type="button" className="m-btn" onClick={() => begin(deep?.kind === "tour" ? "walk" : "tour")}>
                {deep?.kind === "tour" ? "Explore freely instead" : "Guided tour"}
              </button>
              <Link href="/" className="m-btn">
                Back to the website
              </Link>
              {s.touch && (
                <Link href="/map" className="m-btn">
                  Room by room, without 3D
                </Link>
              )}
            </div>
            <fieldset className="mt-6" style={{ border: 0, padding: 0, margin: "var(--space-5) 0 0" }}>
              <legend className="label">Picture quality</legend>
              <div className="btn-row" style={{ marginTop: 6 }}>
                {(["high", "balanced"] as Quality[]).map((q) => (
                  <button key={q} type="button" className="m-btn" aria-pressed={s.quality === q} onClick={() => s.setQuality(q)}>
                    {q === "high" ? "High" : "Balanced — for laptops & phones"}
                  </button>
                ))}
              </div>
            </fieldset>
          </div>
        </section>
      )}
    </div>
  );
}
