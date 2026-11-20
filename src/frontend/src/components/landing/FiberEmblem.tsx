import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef, useState } from "react";
import * as THREE from "three";

const NODE_COUNT = 46;
const LINK_DISTANCE = 1.28;

type Vec3 = [number, number, number];

/** Deterministic pseudo-random so the constellation is stable across renders. */
function seeded(seed: number) {
  let value = seed;
  return () => {
    value = (value * 16807) % 2147483647;
    return value / 2147483647;
  };
}

function buildNodes(): Vec3[] {
  const random = seeded(20261120);
  const nodes: Vec3[] = [];
  for (let i = 0; i < NODE_COUNT; i += 1) {
    const theta = random() * Math.PI * 2;
    const phi = Math.acos(2 * random() - 1);
    const radius = 0.82 + random() * 0.34;
    nodes.push([
      radius * Math.sin(phi) * Math.cos(theta),
      radius * Math.cos(phi),
      radius * Math.sin(phi) * Math.sin(theta),
    ]);
  }
  return nodes;
}

function buildLinks(nodes: Vec3[]): Array<[Vec3, Vec3]> {
  const links: Array<[Vec3, Vec3]> = [];
  for (let i = 0; i < nodes.length; i += 1) {
    for (let j = i + 1; j < nodes.length; j += 1) {
      const a = nodes[i];
      const b = nodes[j];
      const dx = a[0] - b[0];
      const dy = a[1] - b[1];
      const dz = a[2] - b[2];
      if (Math.sqrt(dx * dx + dy * dy + dz * dz) < LINK_DISTANCE) {
        links.push([a, b]);
      }
    }
  }
  return links;
}

function Constellation({ dragging }: { dragging: boolean }) {
  const group = useRef<THREE.Group>(null);
  const nodes = useMemo(buildNodes, []);
  const links = useMemo(() => buildLinks(nodes), [nodes]);

  const nodeGeometry = useMemo(() => {
    const positions = new Float32Array(nodes.length * 3);
    nodes.forEach((node, index) => {
      positions[index * 3] = node[0];
      positions[index * 3 + 1] = node[1];
      positions[index * 3 + 2] = node[2];
    });
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geometry;
  }, [nodes]);

  const linkGeometry = useMemo(() => {
    const positions = new Float32Array(links.length * 6);
    links.forEach(([a, b], index) => {
      positions.set([a[0], a[1], a[2], b[0], b[1], b[2]], index * 6);
    });
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geometry;
  }, [links]);

  useFrame((state, delta) => {
    if (!group.current) return;
    const speed = dragging ? 0.12 : 0.32;
    group.current.rotation.y += delta * speed;
    group.current.rotation.x =
      Math.sin(state.clock.elapsedTime * 0.35) * 0.16 + 0.12;
  });

  return (
    <group ref={group}>
      <mesh>
        <icosahedronGeometry args={[1.02, 1]} />
        <meshBasicMaterial
          color="#3b82f6"
          wireframe
          transparent
          opacity={0.22}
        />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.62, 32, 32]} />
        <meshStandardMaterial
          color="#1d4ed8"
          emissive="#2563eb"
          emissiveIntensity={0.55}
          roughness={0.35}
          metalness={0.4}
          transparent
          opacity={0.55}
        />
      </mesh>
      <lineSegments geometry={linkGeometry}>
        <lineBasicMaterial color="#60a5fa" transparent opacity={0.45} />
      </lineSegments>
      <points geometry={nodeGeometry}>
        <pointsMaterial
          color="#bfdbfe"
          size={0.075}
          sizeAttenuation
          transparent
          opacity={0.95}
        />
      </points>
    </group>
  );
}

/**
 * Interactive fiber-optic node emblem: a rotating 3D constellation that
 * responds to pointer drag and touch, with a CSS fallback for reduced motion.
 */
export function FiberEmblem() {
  const [dragging, setDragging] = useState(false);

  return (
    <div
      data-ocid="landing.emblem"
      aria-hidden="true"
      onPointerDown={() => setDragging(true)}
      onPointerUp={() => setDragging(false)}
      onPointerLeave={() => setDragging(false)}
      onPointerCancel={() => setDragging(false)}
      className="relative mx-auto grid size-56 touch-none place-items-center select-none sm:size-64"
    >
      <span className="absolute inset-0 animate-pulse-ring rounded-full border border-accent/35" />
      <span className="absolute inset-6 rounded-full border border-accent/20" />
      <span className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_50%_45%,oklch(0.62_0.2_258/0.35),transparent_68%)]" />
      <Canvas
        camera={{ position: [0, 0, 3.1], fov: 45 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
        className="relative"
      >
        <ambientLight intensity={0.9} />
        <pointLight position={[2.4, 2.6, 3]} intensity={22} color="#93c5fd" />
        <pointLight
          position={[-2.6, -1.8, -2]}
          intensity={12}
          color="#22d3ee"
        />
        <Constellation dragging={dragging} />
      </Canvas>
    </div>
  );
}
