"use client";

import * as THREE from "three";

import { useMobile } from "@/hooks/use-mobile";
import { Canvas, useFrame } from "@react-three/fiber";
import { useRef, useEffect, useState, useMemo } from "react";

function ParticleField({
  count,
  theme,
  scrollY,
}: {
  count: number;
  theme: string;
  scrollY: number;
}) {
  const points = useRef<THREE.Points>(null);

  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -(e.clientY / window.innerHeight) * 2 + 1,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useFrame((state, delta) => {
    if (points.current) {
      points.current.rotation.y += delta * 0.03;

      points.current.rotation.x = THREE.MathUtils.lerp(
        points.current.rotation.x,
        mousePosition.y * 0.05,
        0.03
      );

      points.current.rotation.z = THREE.MathUtils.lerp(
        points.current.rotation.z,
        mousePosition.x * -0.05,
        0.03
      );

      points.current.position.y = THREE.MathUtils.lerp(
        points.current.position.y,
        scrollY * -0.1,
        0.05
      );
    }
  });

  const particles = Array.from({ length: count }, () => ({
    position: [
      (Math.random() - 0.5) * 10,
      (Math.random() - 0.5) * 1.5,
      (Math.random() - 0.5) * 3,
    ],
    size: Math.random() * 0.03 + 0.01,
  }));

  const positionArray = useMemo(() => {
    return new Float32Array(particles.flatMap((p) => p.position));
  }, [particles]);

  const particleColor = theme === "dark" ? "#7c3aed" : "#4f46e5";

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particles.length}
          array={new Float32Array(particles.flatMap((p) => p.position))}
          itemSize={3}
          args={[positionArray, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.03}
        sizeAttenuation
        transparent
        opacity={0.6}
        color={particleColor}
      />
    </points>
  );
}

export default function HeaderBackground({ scrollY = 0 }) {
  const isMobile = useMobile();

  const particleCount = isMobile ? 50 : 100;

  return (
    <div className="absolute inset-0 z-0 opacity-70">
      <Canvas
        dpr={[1, 2]}
        camera={{ position: [0, 0, 5], fov: 50 }}
        style={{ pointerEvents: "none" }}
      >
        <ParticleField count={particleCount} theme={"dark"} scrollY={scrollY} />
      </Canvas>
    </div>
  );
}
