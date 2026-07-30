"use client";

import { useEffect, useMemo, useRef, useSyncExternalStore } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";
import { buildRingSlots } from "@/data/works";
import { ringScrollProgress } from "@/lib/scroll-progress";
import {
  ringConfig,
  signedJitter,
  subscribeRingConfig,
} from "@/config/ring";

const textureLoader = new THREE.TextureLoader();

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
    THREE.MathUtils.clamp(p / ringConfig.unwindEnd, 0, 1),
    0,
    1,
  );
}

/** Subscribes to a single config field that needs to drive React, not just the loop. */
function useConfigValue<T extends number>(read: () => T) {
  return useSyncExternalStore(subscribeRingConfig, read, read);
}

/** Frames the camera so one world unit equals one CSS pixel at z = 0. */
function CameraRig() {
  const { size } = useThree();
  const fov = useConfigValue(() => ringConfig.fov);
  const distance = size.height / 2 / Math.tan(THREE.MathUtils.degToRad(fov / 2));

  return (
    <PerspectiveCamera
      makeDefault
      fov={fov}
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
      if (hovered.current) document.body.style.cursor = "";
    };
  }, []);

  useFrame((_, delta) => {
    const mesh = meshRef.current;
    const material = materialRef.current;
    if (!mesh || !material) return;

    const cfg = ringConfig;
    const p = ringScrollProgress();
    const e = unwindAmount(p);
    const vw = size.width;
    const vh = size.height;

    const radius = vw * cfg.radiusFactor;
    const circumference = 2 * Math.PI * radius;

    // Arc-length position of this card along the band. Idle drift, scroll
    // and pointer parallax are all shifts along the arc, so cards always
    // travel in the direction of rotation.
    const idle = (performance.now() / 1000) * cfg.idleSpeed * circumference;
    const scrolled =
      (Math.max(0, p - cfg.unwindEnd) / (1 - cfg.unwindEnd)) *
      circumference *
      cfg.stripTravel;
    const nudge = pointer.x * circumference * cfg.pointerPush;
    const s = wrapSigned(
      (index / total - 0.5) * circumference + idle + scrolled + nudge,
      circumference,
    );

    // Unroll: the band keeps its arc length while its radius grows toward
    // infinity, so the circle opens out into a line rather than collapsing.
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
    const hoverScale = 1 + (cfg.hoverScale - 1) * hoverEase.current;

    // Jitter is ironed out as the band flattens, so the resolved line is
    // even — dial `jitterFlatten` down to carry the scatter into the strip.
    const jitter = 1 - e * cfg.jitterFlatten;
    const slotArc = circumference / total;
    const fill = THREE.MathUtils.lerp(cfg.cardFillRing, cfg.cardFillLine, e);
    const sizeVary = 1 + signedJitter(index, 1) * cfg.sizeJitter * jitter;

    const cardW = slotArc * fill * sizeVary * hoverScale;
    const cardH = cardW / aspect;
    const y =
      vh * cfg.verticalOffset +
      signedJitter(index, 2) * cfg.heightJitter * vh * jitter;

    mesh.position.set(x, y, z);
    mesh.scale.set(cardW, cardH, 1);
    mesh.rotation.set(0, phi, signedJitter(index, 3) * cfg.cardRoll * jitter);
    // Nearer cards draw last so they sit on top of the hazy far side.
    mesh.renderOrder = Math.round(z);

    // Near edge of the ring sits at z = 0, far side at z = -2r.
    const depth = THREE.MathUtils.clamp((z + 2 * radius) / (2 * radius), 0, 1);
    let opacity = THREE.MathUtils.lerp(cfg.depthFade, 1, depth);
    if (p > cfg.fadeStart) {
      opacity *= 1 - THREE.MathUtils.smoothstep(p, cfg.fadeStart, 1);
    }
    material.opacity = opacity;
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
  const repeats = useConfigValue(() => ringConfig.repeats);
  const slots = useMemo(() => buildRingSlots(repeats), [repeats]);

  useFrame((_, delta) => {
    const group = groupRef.current;
    if (!group) return;

    const smoothing = 1 - Math.pow(0.005, delta);
    pointer.x = THREE.MathUtils.lerp(pointer.x, pointer.targetX, smoothing);
    pointer.y = THREE.MathUtils.lerp(pointer.y, pointer.targetY, smoothing);

    const e = unwindAmount(ringScrollProgress());

    // Tilt unwinds to zero so the resolved strip faces the camera square on.
    group.rotation.x = (ringConfig.tiltX + pointer.y * 0.07) * (1 - e);
    group.rotation.z = ringConfig.tiltZ * (1 - e);
  });

  return (
    <group ref={groupRef}>
      {slots.map((work, index) => (
        <WorkPlane
          key={`${work.id}-${work.slot}`}
          src={work.src}
          aspect={work.width / work.height}
          index={index}
          total={slots.length}
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
