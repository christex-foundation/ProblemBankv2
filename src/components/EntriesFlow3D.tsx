"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

const FOREGROUND = "#0e0e0d";
const ACCENT = "#c8442a";
const MUTED = "#6e6a62";

type NodeDef = {
  id: string;
  text: string;
  pos: [number, number, number];
  fontSize: number;
  dim?: boolean;
  accent?: boolean;
};

const NODES: NodeDef[] = [
  { id: "n1", text: "From the community",           pos: [-5.8, 3.6, 0],    fontSize: 0.32, dim: true },
  { id: "n2", text: "Submitted via community feed", pos: [-5.8, 1.6, 0],    fontSize: 0.4 },
  { id: "n3", text: "Gains traction",               pos: [0.4, 1.6, 0],     fontSize: 0.42 },
  { id: "n4", text: "Christex Foundation",          pos: [3.6, 3.6, 0],     fontSize: 0.32, dim: true },
  { id: "n5", text: "Research",                     pos: [3.6, -0.3, 0.3],  fontSize: 0.6 },
  { id: "n6", text: "Vetted + documents published", pos: [-1.6, -2.6, 0],   fontSize: 0.4 },
  { id: "n7", text: "SHIPPED BY BUILDERS",          pos: [-5.8, -4.2, 0.5], fontSize: 0.62, accent: true },
];

type EdgeDef = {
  id: string;
  start: [number, number, number];
  cp1: [number, number, number];
  cp2: [number, number, number];
  end: [number, number, number];
  accent?: boolean;
  particles?: number;
};

const EDGES: EdgeDef[] = [
  // N1 -> N2 : community tag curves down to "Submitted via community feed"
  {
    id: "e1",
    start: [-4.5, 3.35, 0],
    cp1:   [-4.2, 2.8, 0.1],
    cp2:   [-5.0, 2.2, 0],
    end:   [-5.5, 1.85, 0],
  },
  // N2 -> N3 : rightward to "Gains traction"
  {
    id: "e2",
    start: [-2.3, 1.55, 0],
    cp1:   [-1.7, 1.25, 0.05],
    cp2:   [-0.4, 1.25, 0.05],
    end:   [ 0.25, 1.55, 0],
  },
  // N3 -> N5 : curves right and down into Research
  {
    id: "e3",
    start: [ 2.4, 1.55, 0],
    cp1:   [ 3.2, 1.1, 0.1],
    cp2:   [ 3.6, 0.5, 0.2],
    end:   [ 3.55, -0.05, 0.25],
  },
  // N4 -> N5 : Christex Foundation curves down into Research
  {
    id: "e4",
    start: [ 4.7, 3.35, 0],
    cp1:   [ 5.1, 2.4, 0.1],
    cp2:   [ 4.6, 0.7, 0.2],
    end:   [ 4.2, -0.05, 0.25],
  },
  // N5 -> N6 : Research curves down-left to "Vetted + documents published"
  {
    id: "e5",
    start: [ 3.6, -0.65, 0.2],
    cp1:   [ 2.6, -1.6, 0.1],
    cp2:   [ 0.4, -2.3, 0],
    end:   [-1.3, -2.5, 0],
  },
  // N6 -> N7 : accent — vetted to shipped (outcome)
  {
    id: "e6",
    start: [-1.85, -2.85, 0],
    cp1:   [-2.6, -3.5, 0.2],
    cp2:   [-4.0, -3.95, 0.4],
    end:   [-5.0, -4.05, 0.5],
    accent: true,
    particles: 3,
  },
];

function nodeColor(node: NodeDef): string {
  if (node.accent) return ACCENT;
  if (node.dim) return MUTED;
  return FOREGROUND;
}

function NodeLabel({ node }: { node: NodeDef }) {
  return (
    <Text
      position={node.pos}
      fontSize={node.fontSize}
      anchorX="left"
      anchorY="middle"
      color={nodeColor(node)}
      letterSpacing={node.accent ? 0.05 : 0}
      fontWeight={node.accent ? 900 : node.dim ? 400 : 500}
    >
      {node.text}
    </Text>
  );
}

function NodeUnderline({ node }: { node: NodeDef }) {
  // A subtle line beneath each label, echoing the sketch's underlines.
  // Width is estimated from char count for simplicity.
  const w = node.text.length * node.fontSize * 0.5;
  const y = node.pos[1] - node.fontSize * 0.55;
  const x = node.pos[0];
  const z = node.pos[2];
  const color = nodeColor(node);
  const opacity = node.dim ? 0.18 : 0.3;
  return (
    <mesh position={[x + w / 2, y, z]}>
      <planeGeometry args={[w, 0.025]} />
      <meshBasicMaterial color={color} transparent opacity={opacity} />
    </mesh>
  );
}

function buildCurve(edge: EdgeDef): THREE.CubicBezierCurve3 {
  return new THREE.CubicBezierCurve3(
    new THREE.Vector3(...edge.start),
    new THREE.Vector3(...edge.cp1),
    new THREE.Vector3(...edge.cp2),
    new THREE.Vector3(...edge.end),
  );
}

function EdgeTube({ edge }: { edge: EdgeDef }) {
  const curve = useMemo(() => buildCurve(edge), [edge]);
  const geometry = useMemo(
    () => new THREE.TubeGeometry(curve, 80, edge.accent ? 0.022 : 0.014, 10, false),
    [curve, edge.accent],
  );
  const color = edge.accent ? ACCENT : FOREGROUND;
  const opacity = edge.accent ? 0.85 : 0.4;
  return (
    <mesh geometry={geometry}>
      <meshBasicMaterial color={color} transparent opacity={opacity} />
    </mesh>
  );
}

function EdgeArrowhead({ edge }: { edge: EdgeDef }) {
  const curve = useMemo(() => buildCurve(edge), [edge]);
  // Cone oriented along the curve's tangent at t=1
  const { position, quaternion } = useMemo(() => {
    const tip = curve.getPointAt(1);
    const tangent = curve.getTangentAt(1).normalize();
    // Move cone so its tip lands at the curve endpoint
    const coneHalfHeight = edge.accent ? 0.11 : 0.08;
    const pos = tip.clone().sub(tangent.clone().multiplyScalar(coneHalfHeight));
    // Cone default points along +Y; orient toward tangent
    const up = new THREE.Vector3(0, 1, 0);
    const q = new THREE.Quaternion().setFromUnitVectors(up, tangent);
    return { position: pos, quaternion: q };
  }, [curve, edge.accent]);

  const radius = edge.accent ? 0.08 : 0.06;
  const height = edge.accent ? 0.22 : 0.16;
  const color = edge.accent ? ACCENT : FOREGROUND;
  const opacity = edge.accent ? 0.9 : 0.55;
  return (
    <mesh position={position} quaternion={quaternion}>
      <coneGeometry args={[radius, height, 12]} />
      <meshBasicMaterial color={color} transparent opacity={opacity} />
    </mesh>
  );
}

function Particle({
  curve,
  color,
  offset,
  speed,
  size,
}: {
  curve: THREE.CubicBezierCurve3;
  color: string;
  offset: number;
  speed: number;
  size: number;
}) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = (clock.getElapsedTime() * speed + offset) % 1;
    const p = curve.getPointAt(t);
    ref.current.position.copy(p);
  });
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[size, 12, 12]} />
      <meshBasicMaterial color={color} />
    </mesh>
  );
}

function EdgeParticles({ edge }: { edge: EdgeDef }) {
  const curve = useMemo(() => buildCurve(edge), [edge]);
  const color = edge.accent ? ACCENT : FOREGROUND;
  const count = edge.particles ?? 2;
  const speed = edge.accent ? 0.32 : 0.22;
  const size = edge.accent ? 0.075 : 0.05;
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <Particle
          key={i}
          curve={curve}
          color={color}
          offset={i / count}
          speed={speed}
          size={size}
        />
      ))}
    </>
  );
}

function Scene({ scrollProgressRef }: { scrollProgressRef: React.MutableRefObject<number> }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!groupRef.current) return;
    const p = scrollProgressRef.current;
    // Map scroll progress 0->1 to rotation. Centered at p=0.5 = no rotation.
    const targetRotY = (p - 0.5) * 0.55;
    const targetRotX = (p - 0.5) * 0.18;
    // Ease toward target for smooth motion
    groupRef.current.rotation.y += (targetRotY - groupRef.current.rotation.y) * 0.08;
    groupRef.current.rotation.x += (targetRotX - groupRef.current.rotation.x) * 0.08;
  });

  return (
    <group ref={groupRef}>
      {NODES.map((n) => (
        <NodeLabel key={n.id} node={n} />
      ))}
      {NODES.map((n) => (
        <NodeUnderline key={`u-${n.id}`} node={n} />
      ))}
      {EDGES.map((e) => (
        <EdgeTube key={e.id} edge={e} />
      ))}
      {EDGES.map((e) => (
        <EdgeArrowhead key={`a-${e.id}`} edge={e} />
      ))}
      {EDGES.map((e) => (
        <EdgeParticles key={`p-${e.id}`} edge={e} />
      ))}
    </group>
  );
}

export default function EntriesFlow3D() {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollProgressRef = useRef(0.5);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const updateProgress = () => {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      // 0 when section's top is at the bottom of the viewport,
      // 1 when section's bottom passes the top of the viewport.
      const totalTravel = vh + rect.height;
      const traveled = vh - rect.top;
      const raw = traveled / totalTravel;
      scrollProgressRef.current = Math.min(1, Math.max(0, raw));
    };
    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);
    return () => {
      window.removeEventListener("scroll", updateProgress);
      window.removeEventListener("resize", updateProgress);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full max-w-[1100px] mx-auto aspect-[16/11]"
    >
      {mounted && (
        <Canvas
          camera={{ position: [0, 0, 11], fov: 50 }}
          gl={{ antialias: true, alpha: true }}
          dpr={[1, 2]}
        >
          <Scene scrollProgressRef={scrollProgressRef} />
        </Canvas>
      )}
    </div>
  );
}
