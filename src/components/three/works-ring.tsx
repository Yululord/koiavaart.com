"use client";

import { useEffect, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";
import { ringSlots } from "@/data/works";
import { ringScrollProgress } from "@/lib/scroll-progress";

const textureLoader = new THREE.TextureLoader();

const FOV = 45;
/** Ring is tipped back so its far side rides higher on screen. */
const TILT = -0.09;
/** Progress at which the circle has fully opened into the line. */
const UNWIND_END = 0.42;
/** Progress at which the strip starts fading out before the About section. */
const FADE_START = 0.9;
/** Ring radius as a fraction of viewport width. */
const RADIUS_FACTOR = 0.5;
/**
 * The band travels right-to-left, so both the idle drift and the
 * scroll-driven travel are negative shifts along the arc.
 */
const STRIP_TRAVEL = -1.2;
const IDLE_LOOPS_PER_SEC = -1 / 90;
/**
 * How far the pointer nudges the carousel, as a fraction of one loop.
 * Kept well under one slot (1/18 of a loop) so parallax never drags a card
 * out from under the cursor mid-hover.
 */
const POINTER_PUSH = 0.014;
const HOVER_SCALE = 1.14;
/**
 * Share of each slot's arc taken up by the artwork. The coiled ring is
 * dense and small-carded like the Figma hero. Unrolled, half the slots have
 * dropped away, so the survivors are measured against a double-width slot
 * to open the paintings up.
 */
const CARD_FILL_RING = 0.62;
const CARD_FILL_LINE = 0.72;

/** Smoothed pointer, in normalised [-1, 1] screen coordinates. */
const pointer = { targetX: 0, targetY: 0, x: 0, y: 0 };

/** Wraps a value into [-span/2, span/2). */
function wrapSigned(value: number, span: number) {
  const half = span / 2;
  return ((((value + half) % span) + span) % span) - half;
}

/** 0 while coiled, 1 once the circle has opened into a straight line. */
function unwindAmount(p: number) {
  return THREE.MathUtils.smoothstep(
    THREE.MathUtils.clamp(p / UNWIND_END, 0, 1),
    0,
    1,
  );
}

/** Frames the camera so one world unit equals one CSS pixel at z = 0. */
function CameraRig() {
  const { size } = useThree();
  const distance =
    size.height / 2 / Math.tan(THREE.MathUtils.degToRad(FOV / 2));

  return (
    <PerspectiveCamera
      makeDefault
      fov={FOV}
      near={1}
      far={distance * 16}
      position={[0, 0, distance]}
    />
  );
}

function WorkPlane({
  src,
  aspect,
  index,
  total,
}: {
  src: string;
  aspect: number;
  index: number;
  total: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const materialRef = useRef<THREE.MeshBasicMaterial>(null!);
  const hovered = useRef(false);
  const hoverEase = useRef(0);
  const { size } = useThree();

  useEffect(() => {
    let cancelled = false;
    textureLoader.load(src, (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      if (cancelled || !materialRef.current) return;
      materialRef.current.map = tex;
      materialRef.current.needsUpdate = true;
    });
    return () => {
      cancelled = true;
    };
  }, [src]);

  useEffect(() => {
    return () => {
      // Never leave the cursor stuck if the plane unmounts while hovered.
      if (hovered.current) document.body.style.cursor = "";
    };
  }, []);

  useFrame((_, delta) => {
    const mesh = meshRef.current;
    const material = materialRef.current;
    if (!mesh || !material) return;

    const p = ringScrollProgress();
    const e = unwindAmount(p);
    const vw = size.width;

    const radius = vw * RADIUS_FACTOR;
    const circumference = 2 * Math.PI * radius;

    // Arc-length position of this card along the band. Everything that
    // moves the carousel — idle drift, scroll, pointer — is expressed as a
    // shift along the arc, so the cards always travel in the direction of
    // rotation rather than being squeezed inward.
    const idle =
      (performance.now() / 1000) * IDLE_LOOPS_PER_SEC * circumference;
    const scrolled =
      (Math.max(0, p - UNWIND_END) / (1 - UNWIND_END)) *
      circumference *
      STRIP_TRAVEL;
    const nudge = pointer.x * circumference * POINTER_PUSH;
    const s = wrapSigned(
      (index / total - 0.5) * circumference + idle + scrolled + nudge,
      circumference,
    );

    // Unroll: the band keeps its arc length while its radius grows toward
    // infinity, so the circle opens out into a straight line instead of
    // collapsing into a spiral. k = 1 is the closed ring, k → 0 is flat.
    const k = Math.max(1 - e, 1e-4);
    const r = radius / k;
    const phi = s / r;
    const x = r * Math.sin(phi);
    const z = r * Math.cos(phi) - r;

    hoverEase.current = THREE.MathUtils.lerp(
      hoverEase.current,
      hovered.current ? 1 : 0,
      1 - Math.pow(0.002, delta),
    );
    const hoverScale = 1 + (HOVER_SCALE - 1) * hoverEase.current;

    // Odd slots exist only to pack the coiled ring; they retire during the
    // unroll so the strip shows each painting exactly once. The survivors
    // are then sized against a slot twice as wide.
    const slotArc = circumference / total;
    const cardW =
      THREE.MathUtils.lerp(
        CARD_FILL_RING * slotArc,
        CARD_FILL_LINE * slotArc * 2,
        e,
      ) * hoverScale;
    const cardH = cardW / aspect;

    mesh.position.set(x, 0, z);
    mesh.scale.set(cardW, cardH, 1);
    mesh.rotation.y = phi;
    // Nearer cards draw last so they sit on top of the hazy far side.
    mesh.renderOrder = Math.round(z);

    // Near edge of the ring sits at z = 0, far side at z = -2r.
    const depth = THREE.MathUtils.clamp((z + 2 * radius) / (2 * radius), 0, 1);
    let opacity = THREE.MathUtils.lerp(0.25, 1, depth);
    if (index % 2 === 1) opacity *= 1 - e;
    if (p > FADE_START) {
      opacity *= 1 - THREE.MathUtils.smoothstep(p, FADE_START, 1);
    }
    material.opacity = opacity;

    // Skips both drawing and raycasting, so retired cards cannot be hovered.
    mesh.visible = opacity > 0.01;
  });

  return (
    <mesh
      ref={meshRef}
      onPointerOver={(event) => {
        event.stopPropagation();
        hovered.current = true;
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        hovered.current = false;
        document.body.style.cursor = "";
      }}
    >
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial
        ref={materialRef}
        transparent
        opacity={0}
        side={THREE.DoubleSide}
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  );
}

function Ring() {
  const groupRef = useRef<THREE.Group>(null!);

  useFrame((_, delta) => {
    const group = groupRef.current;
    if (!group) return;

    const smoothing = 1 - Math.pow(0.005, delta);
    pointer.x = THREE.MathUtils.lerp(pointer.x, pointer.targetX, smoothing);
    pointer.y = THREE.MathUtils.lerp(pointer.y, pointer.targetY, smoothing);

    const e = unwindAmount(ringScrollProgress());
    group.rotation.x = (TILT + pointer.y * 0.07) * (1 - e);
  });

  return (
    <group ref={groupRef}>
      {ringSlots.map((work, index) => (
        <WorkPlane
          key={`${work.id}-${work.slot}`}
          src={work.src}
          aspect={work.width / work.height}
          index={index}
          total={ringSlots.length}
        />
      ))}
    </group>
  );
}

export function WorksRing() {
  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      pointer.targetX = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.targetY = (event.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  return (
    <div className="fixed inset-0 z-10" aria-hidden>
      <Canvas gl={{ alpha: true, antialias: true }} dpr={[1, 2]}>
        <CameraRig />
        <Ring />
      </Canvas>
    </div>
  );
}
