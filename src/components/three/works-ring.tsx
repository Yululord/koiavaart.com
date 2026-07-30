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
const TILT = -0.1;
/** Radians per second of idle rotation. */
const IDLE_SPIN = 0.055;
/** Progress at which the ring has fully unwound into the line. */
const UNWIND_END = 0.55;
/** Progress at which the resolved line starts fading out. */
const FADE_START = 0.8;
/** Ring radius as a fraction of viewport width. */
const RADIUS_FACTOR = 0.54;

/** 0 while the ring is coiled, 1 once it has resolved into the line. */
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
      far={distance * 12}
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

  useFrame(() => {
    const mesh = meshRef.current;
    const material = materialRef.current;
    if (!mesh || !material) return;

    const p = ringScrollProgress();
    const e = unwindAmount(p);
    const vw = size.width;
    const vh = size.height;

    // --- Circle pose -----------------------------------------------------
    // Planes ring the group's own origin, each facing outward, so the far
    // half presents its back and reads mirrored — as in the Figma hero.
    const theta = (index / total) * Math.PI * 2;
    const radius = vw * RADIUS_FACTOR;
    const ringX = Math.sin(theta) * radius;
    const ringZ = Math.cos(theta) * radius;
    const ringY = -vh * 0.11;
    const ringCardW = vw * 0.088;
    const ringCardH = ringCardW / aspect;

    // --- Line pose -------------------------------------------------------
    const spacing = (vw * 0.94) / total;
    const lineX = (index - (total - 1) / 2) * spacing;
    const lineCardW = spacing * 0.84;
    const lineCardH = lineCardW / aspect;

    mesh.position.set(
      THREE.MathUtils.lerp(ringX, lineX, e),
      THREE.MathUtils.lerp(ringY, 0, e),
      THREE.MathUtils.lerp(ringZ, 0, e),
    );
    mesh.scale.set(
      THREE.MathUtils.lerp(ringCardW, lineCardW, e),
      THREE.MathUtils.lerp(ringCardH, lineCardH, e),
      1,
    );
    mesh.rotation.y = THREE.MathUtils.lerp(theta, 0, e);

    // Depth haze on the ring's far side, resolving to solid in the line.
    const depth = (ringZ + radius) / (2 * radius);
    let opacity = THREE.MathUtils.lerp(
      THREE.MathUtils.lerp(0.2, 1, depth),
      1,
      e,
    );

    // Clear the stage before the About section arrives.
    if (p > FADE_START) {
      opacity *= 1 - THREE.MathUtils.smoothstep(p, FADE_START, 1);
    }
    material.opacity = opacity;
  });

  return (
    <mesh ref={meshRef}>
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
  const spin = useRef(0);
  const { size } = useThree();

  useFrame((_, delta) => {
    const group = groupRef.current;
    if (!group) return;

    const e = unwindAmount(ringScrollProgress());
    spin.current += delta * IDLE_SPIN;

    // Rotation, tilt and depth offset all unwind to zero, leaving a
    // straight, camera-facing row at z = 0.
    group.rotation.y = spin.current * (1 - e);
    group.rotation.x = TILT * (1 - e);
    group.position.z = -size.width * RADIUS_FACTOR * (1 - e);
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
  return (
    <div className="pointer-events-none fixed inset-0 z-10" aria-hidden>
      <Canvas gl={{ alpha: true, antialias: true }} dpr={[1, 2]}>
        <CameraRig />
        <Ring />
      </Canvas>
    </div>
  );
}
