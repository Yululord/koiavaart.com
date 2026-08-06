"use client";

import { useEffect, useMemo, useRef, useSyncExternalStore } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";
import { buildRingSlots, workCaption } from "@/data/works";
import {
  BUTTON_ASPECT,
  LABEL_ASPECT,
  cardLabelTexture,
  learnMoreTexture,
} from "@/components/three/caption-texture";
import { ringScrollOverflow, ringScrollProgress } from "@/lib/scroll-progress";
import { mobileBandCentre } from "@/lib/hero-layout";
import { openWork } from "@/lib/work-overlay";
import {
  activeRing,
  isMobileRing,
  ringSetSize,
  ringTotalCount,
  signedJitter,
  subscribeRingConfig,
} from "@/config/ring";

const textureLoader = new THREE.TextureLoader();

/**
 * Top edge of the Contact button, in px up from the bottom of the viewport:
 * it is centred in a 96px bar and stands 48px tall. Keep in step with
 * <ContactPill />.
 */
const PILL_TOP_FROM_BOTTOM = 72;
/** Breathing room between a card's caption and the button. */
const PILL_CLEARANCE = 12;

/** Match the site's ink and secondary text colours. */
const TITLE_COLOR = "#000000";
const INFO_COLOR = "#737373";

/**
 * Touch devices get the Learn more button permanently, since there is no
 * hover to reveal it with.
 */
function supportsHover() {
  return typeof window !== "undefined"
    ? window.matchMedia("(hover: hover)").matches
    : true;
}

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
    THREE.MathUtils.clamp(p / activeRing().unwindEnd, 0, 1),
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
  const fov = useConfigValue(() => activeRing().fov);
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
  title,
  info,
  slug,
}: {
  src: string;
  aspect: number;
  index: number;
  total: number;
  title: string;
  info: string;
  slug: string;
}) {
  const groupRef = useRef<THREE.Group>(null!);
  const meshRef = useRef<THREE.Mesh>(null!);
  const materialRef = useRef<THREE.MeshBasicMaterial>(null!);
  const labelRef = useRef<THREE.Mesh>(null);
  const labelMaterialRef = useRef<THREE.MeshBasicMaterial>(null);
  const buttonRef = useRef<THREE.Mesh>(null);
  const buttonMaterialRef = useRef<THREE.MeshBasicMaterial>(null);
  const hovered = useRef(false);
  const hoverEase = useRef(0);
  const hoverCapable = useRef(true);
  const { size } = useThree();

  useEffect(() => {
    hoverCapable.current = supportsHover();
  }, []);

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
    const group = groupRef.current;
    const mesh = meshRef.current;
    const material = materialRef.current;
    if (!group || !mesh || !material) return;

    const cfg = activeRing();
    const p = ringScrollProgress();
    const e = unwindAmount(p);
    const vw = size.width;
    const vh = size.height;

    const radius = vw * cfg.radiusFactor;

    // Ring spacing is pinned to whatever divides the circumference exactly,
    // so the cylinder always closes; the line uses its own. Every card is
    // carried through — nothing is dropped on the way.
    const spacing = THREE.MathUtils.lerp(
      (2 * Math.PI * radius) / total,
      vw * cfg.lineSpacing,
      e,
    );
    const period = spacing * total;

    // Motion is measured in passes through the set of works rather than
    // laps of the whole band, so the speed controls keep their meaning
    // however many copies are wrapped around the ring.
    const perPass = spacing * ringSetSize;

    // Arc-length position of this card along the band. Idle drift, scroll
    // and pointer parallax are all shifts along the arc, so cards always
    // travel in the direction of rotation.
    const idle = (performance.now() / 1000) * cfg.idleSpeed * perPass;
    const scrolled =
      (Math.max(0, p - cfg.unwindEnd) / (1 - cfg.unwindEnd)) *
      perPass *
      cfg.stripTravel;
    // Parallax belongs to the cylinder only: once the band is a flat row of
    // clickable artworks, having it drift under the cursor works against you.
    const nudge = pointer.x * perPass * cfg.pointerPush * (1 - e);
    const s = wrapSigned(
      (index - (total - 1) / 2) * spacing + idle + scrolled + nudge,
      period,
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
    const sizeVary = 1 + signedJitter(index, 1) * cfg.sizeJitter * jitter;

    // Card width is set outright rather than as a share of the gap, so size
    // and spacing can be dialled independently.
    let cardW =
      vw *
      THREE.MathUtils.lerp(cfg.cardWidthRing, cfg.cardWidthLine, e) *
      sizeVary *
      hoverScale;
    // Coiled, the band is placed as part of the hero group so it stays
    // centred with the text whatever the screen height; the resolved line
    // has the whole frame to itself and keeps its configured offset.
    const coiledY = isMobileRing()
      ? mobileBandCentre(vw, vh)
      : vh * cfg.verticalOffset;
    const y =
      THREE.MathUtils.lerp(coiledY, vh * cfg.verticalOffsetLine, e) +
      signedJitter(index, 2) * cfg.heightJitter * vh * jitter;

    // On a phone the Contact button is pinned over the strip, and a tall
    // portrait card pushes its caption underneath it. Cap the card so the
    // caption always clears the button — by width, so the artwork keeps its
    // aspect rather than being squashed. Only the resolved line is capped;
    // the cylinder is left alone.
    if (isMobileRing()) {
      // Everything below the card's centre: half the artwork, then the
      // caption hanging under it.
      const perWidth = 1 / (2 * aspect) + LABEL_ASPECT * 1.05;
      const room = y - (PILL_TOP_FROM_BOTTOM - vh / 2) - PILL_CLEARANCE;
      const capW = room > 0 ? room / perWidth : 0;
      cardW *= THREE.MathUtils.lerp(1, Math.min(1, capW / cardW), e);
    }

    const cardH = cardW / aspect;

    // The group carries placement; the meshes keep their own scales, so the
    // caption is not stretched by the artwork's aspect.
    group.position.set(x, y, z);
    group.rotation.set(0, phi, signedJitter(index, 3) * cfg.cardRoll * jitter);
    mesh.scale.set(cardW, cardH, 1);
    // Nearer cards draw last so they sit on top of the hazy far side.
    mesh.renderOrder = Math.round(z);

    // Near edge of the ring sits at z = 0, far side at z = -2r.
    const depth = THREE.MathUtils.clamp((z + 2 * radius) / (2 * radius), 0, 1);
    let opacity = THREE.MathUtils.lerp(cfg.depthFade, 1, depth);

    // At 1 the strip never fades — it scrolls away bodily instead, which is
    // the default. Lower it to dissolve the band before the runway ends.
    if (cfg.fadeStart < 1 && p > cfg.fadeStart) {
      opacity *= 1 - THREE.MathUtils.smoothstep(p, cfg.fadeStart, 1);
    }
    material.opacity = opacity;
    mesh.visible = opacity > 0.01;

    // Labels belong to the resolved line, so they arrive only once the band
    // has flattened out — there is no room for them on the cylinder.
    const reveal = THREE.MathUtils.smoothstep(e, 0.82, 1);
    // Hold the label steady while the artwork grows under the cursor.
    const labelW = cardW / hoverScale;
    const labelH = labelW * LABEL_ASPECT;
    const labelY = -cardH / 2 - labelH * 0.55;

    const label = labelRef.current;
    const labelMaterial = labelMaterialRef.current;
    if (label && labelMaterial) {
      label.scale.set(labelW, labelH, 1);
      // Just in front, so it never z-fights the artwork.
      label.position.set(0, labelY, 0.1);
      label.renderOrder = Math.round(z) + 1;
      labelMaterial.opacity = opacity * reveal;
      label.visible = labelMaterial.opacity > 0.01;
    }

    const button = buttonRef.current;
    const buttonMaterial = buttonMaterialRef.current;
    if (button && buttonMaterial) {
      // Centred over the artwork rather than below it. Sized from the
      // unscaled width so it stays put while the card zooms under it.
      const buttonW = labelW * 0.52;
      const buttonH = buttonW * BUTTON_ASPECT;
      button.scale.set(buttonW, buttonH, 1);
      button.position.set(0, 0, 0.1);
      button.renderOrder = Math.round(z) + 2;

      // Revealed by hover where there is a pointer, always shown where
      // there is not.
      const show = hoverCapable.current ? hoverEase.current : 1;
      buttonMaterial.opacity = opacity * reveal * show;
      button.visible = buttonMaterial.opacity > 0.01;
    }
  });

  return (
    <group ref={groupRef}>
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
        onClick={(event) => {
          event.stopPropagation();
          hovered.current = false;
          document.body.style.cursor = "";
          openWork(slug);
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

      {(title || info) && (
        <mesh ref={labelRef} raycast={() => null}>
          <planeGeometry args={[1, 1]} />
          <meshBasicMaterial
            ref={labelMaterialRef}
            map={cardLabelTexture(title, info, TITLE_COLOR, INFO_COLOR)}
            transparent
            opacity={0}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      )}

      {/* The artwork behind is the hit area, so the pill itself ignores
          the raycast and never steals the hover it is reacting to. */}
      <mesh ref={buttonRef} raycast={() => null}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial
          ref={buttonMaterialRef}
          map={learnMoreTexture(TITLE_COLOR)}
          transparent
          opacity={0}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

function Ring() {
  const groupRef = useRef<THREE.Group>(null!);
  const total = useConfigValue(ringTotalCount);
  const slots = useMemo(() => buildRingSlots(total), [total]);

  useFrame((_, delta) => {
    const group = groupRef.current;
    if (!group) return;

    const smoothing = 1 - Math.pow(0.005, delta);
    pointer.x = THREE.MathUtils.lerp(pointer.x, pointer.targetX, smoothing);
    pointer.y = THREE.MathUtils.lerp(pointer.y, pointer.targetY, smoothing);

    const e = unwindAmount(ringScrollProgress());

    // Tilt unwinds to zero so the resolved strip faces the camera square on.
    group.rotation.x =
      (activeRing().tiltX + pointer.y * activeRing().pointerTilt) * (1 - e);
    group.rotation.z = activeRing().tiltZ * (1 - e);

    // Past the end of the runway the band stops being pinned and rides the
    // page instead, translating up one-for-one with the scroll. One world
    // unit is one CSS pixel here, and +y is up, so it tracks the page
    // exactly — and unwinds in reverse on the way back.
    group.position.y = ringScrollOverflow();
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
          title={work.title ?? ""}
          info={workCaption(work)}
          slug={work.slug}
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
