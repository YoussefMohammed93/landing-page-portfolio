"use client";

import * as THREE from "three";
import { useThree } from "./three-provider";
import { useAnimation } from "./animation-provider";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useRef, useEffect, useState, useMemo } from "react";
import { Canvas, useFrame, useThree as useR3FThree } from "@react-three/fiber";

function ParticleSystem({ count = 250 }) {
  const { interactionIntensity } = useThree();
  const { prefersReducedMotion } = useAnimation();
  const mesh = useRef<THREE.Points>(null);
  const { viewport, pointer } = useR3FThree();
  const primaryColor = useThemeColor("primary");
  const materialRef = useRef<THREE.PointsMaterial>(null);

  const lastColorRef = useRef<string>(primaryColor);

  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const size = Math.random() * 0.03 + 0.01;
      const x = (Math.random() - 0.5) * 10;
      const y = (Math.random() - 0.5) * 10;
      const z = (Math.random() - 0.5) * 10;
      temp.push({ x, y, z, size });
    }
    return temp;
  }, [count]);

  const [positions, sizes] = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = particles[i].x;
      positions[i * 3 + 1] = particles[i].y;
      positions[i * 3 + 2] = particles[i].z;
      sizes[i] = particles[i].size;
    }

    return [positions, sizes];
  }, [particles, count]);

  useEffect(() => {
    if (
      materialRef.current &&
      primaryColor &&
      primaryColor !== lastColorRef.current
    ) {
      try {
        const threeColor = new THREE.Color(primaryColor);
        materialRef.current.color.copy(threeColor);
        lastColorRef.current = primaryColor;
      } catch {}
    }
  }, [primaryColor]);

  useFrame((state) => {
    if (!mesh.current || prefersReducedMotion) return;

    mesh.current.rotation.x =
      state.clock.getElapsedTime() * 0.05 * interactionIntensity;
    mesh.current.rotation.y =
      state.clock.getElapsedTime() * 0.03 * interactionIntensity;

    const mouseX = (pointer.x * viewport.width) / 2;
    const mouseY = (pointer.y * viewport.height) / 2;

    mesh.current.rotation.x += mouseY * 0.001 * interactionIntensity;
    mesh.current.rotation.y += mouseX * 0.001 * interactionIntensity;

    if (
      materialRef.current &&
      primaryColor &&
      primaryColor !== lastColorRef.current
    ) {
      try {
        const threeColor = new THREE.Color(primaryColor);
        materialRef.current.color.copy(threeColor);
        lastColorRef.current = primaryColor;
      } catch {}
    }
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={positions.length / 3}
        />
        <bufferAttribute
          attach="attributes-size"
          args={[sizes, 1]}
          count={sizes.length}
        />
      </bufferGeometry>
      <pointsMaterial
        ref={materialRef}
        size={0.1}
        sizeAttenuation
        transparent
        color={primaryColor || "#8033cc"}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function GradientBackground() {
  const { interactionIntensity } = useThree();
  const { prefersReducedMotion } = useAnimation();
  const mesh = useRef<THREE.Mesh>(null);
  const { viewport, pointer } = useR3FThree();
  const primaryColor = useThemeColor("primary");

  const lastColorRef = useRef<string>(primaryColor);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColor1: { value: new THREE.Color("#1a1a1a") },
      uColor2: {
        value: new THREE.Color(primaryColor || "#8033cc").multiplyScalar(0.2),
      },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uIntensity: { value: interactionIntensity },
    }),
    [interactionIntensity, primaryColor]
  );

  useEffect(() => {
    if (primaryColor && primaryColor !== lastColorRef.current) {
      try {
        const threeColor = new THREE.Color(primaryColor);
        uniforms.uColor2.value.copy(threeColor);
        uniforms.uColor2.value.multiplyScalar(0.2);
        lastColorRef.current = primaryColor;
      } catch {}
    }
  }, [primaryColor, uniforms.uColor2]);

  useFrame((state) => {
    if (!mesh.current || prefersReducedMotion) return;

    uniforms.uTime.value = state.clock.getElapsedTime() * 0.1;
    uniforms.uMouse.value.x = pointer.x;
    uniforms.uMouse.value.y = pointer.y;
    uniforms.uIntensity.value = interactionIntensity;

    if (primaryColor && primaryColor !== lastColorRef.current) {
      try {
        const threeColor = new THREE.Color(primaryColor);
        uniforms.uColor2.value.copy(threeColor);
        uniforms.uColor2.value.multiplyScalar(0.2);
        lastColorRef.current = primaryColor;
      } catch {}
    }
  });

  return (
    <mesh
      ref={mesh}
      position={[0, 0, -5]}
      scale={[viewport.width, viewport.height, 1]}
    >
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={`
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          uniform float uTime;
          uniform vec3 uColor1;
          uniform vec3 uColor2;
          uniform vec2 uMouse;
          uniform float uIntensity;
          varying vec2 vUv;

          void main() {
            vec2 distortedUv = vUv;
            distortedUv.x += sin(distortedUv.y * 10.0 + uTime) * 0.1 * uIntensity;
            distortedUv.y += cos(distortedUv.x * 10.0 + uTime) * 0.1 * uIntensity;

            // Mouse interaction
            float mouseDistance = distance(vUv, uMouse * 0.5 + 0.5);
            float mouseInfluence = smoothstep(0.5, 0.0, mouseDistance) * uIntensity;

            // Gradient with distortion
            vec3 color = mix(uColor1, uColor2, distortedUv.y + mouseInfluence);

            // Add some subtle noise
            float noise = fract(sin(dot(distortedUv, vec2(12.9898, 78.233))) * 43758.5453);
            color += noise * 0.02;

            gl_FragColor = vec4(color, 0.9);
          }
        `}
        transparent
        depthWrite={false}
      />
    </mesh>
  );
}

function Scene() {
  const { interactionIntensity } = useThree();

  return (
    <>
      <GradientBackground />
      <ParticleSystem
        count={
          interactionIntensity < 0.3
            ? 200
            : interactionIntensity < 0.7
            ? 500
            : 800
        }
      />
    </>
  );
}

export function ThreeBackground() {
  const { shouldUseThree } = useThree();
  const [isClient, setIsClient] = useState(false);
  const primaryColor = useThemeColor("primary");
  const [bgStyle, setBgStyle] = useState<React.CSSProperties>({});

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (primaryColor) {
      try {
        const color1 = primaryColor + "33"; // 20% opacity
        const color2 = primaryColor + "11"; // 7% opacity

        const gradient = `radial-gradient(circle at 50% 50%, ${color1} 0%, ${color2} 40%, transparent 70%)`;
        setBgStyle({ background: gradient });
      } catch {}
    }
  }, [primaryColor]);

  if (!isClient || !shouldUseThree) return null;

  return (
    <div
      className="absolute inset-0 z-0 opacity-20 pointer-events-none"
      style={bgStyle}
    >
      <Canvas
        dpr={[1, 2]}
        camera={{ position: [0, 0, 5], fov: 50 }}
        gl={{
          antialias: false,
          alpha: true,
          powerPreference: "high-performance",
          stencil: false,
          depth: false,
        }}
      >
        <Scene />
      </Canvas>
    </div>
  );
}
