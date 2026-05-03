import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, MeshDistortMaterial, Float, Environment, Stars } from '@react-three/drei';

const AnimatedShape = () => {
    const meshRef = useRef();

    // Rotate the shape smoothly over time
    useFrame(({ clock }) => {
        if (meshRef.current) {
            meshRef.current.rotation.x = clock.getElapsedTime() * 0.1;
            meshRef.current.rotation.y = clock.getElapsedTime() * 0.15;
        }
    });

    return (
        <Float speed={2} rotationIntensity={1.5} floatIntensity={2}>
            <Sphere ref={meshRef} args={[1, 100, 200]} scale={1.6}>
                <MeshDistortMaterial
                    color="#4f46e5"
                    attach="material"
                    distort={0.5}
                    speed={2}
                    roughness={0.2}
                    metalness={0.8}
                    clearcoat={1}
                    clearcoatRoughness={0.1}
                />
            </Sphere>
            {/* A secondary background shape for depth */}
            <Sphere args={[1, 100, 200]} scale={1.2} position={[-2, -1, -2]}>
                <MeshDistortMaterial
                    color="#10b981"
                    attach="material"
                    distort={0.6}
                    speed={1.5}
                    roughness={0.3}
                    metalness={0.5}
                    opacity={0.6}
                    transparent
                />
            </Sphere>
        </Float>
    );
};

const Hero3D = () => {
    return (
        <div className="absolute inset-0 w-full h-full -z-10 overflow-hidden pointer-events-none">
            <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
                <ambientLight intensity={0.7} />
                <directionalLight position={[10, 10, 5]} intensity={1.5} />
                <directionalLight position={[-10, -10, -5]} intensity={0.5} color="#4f46e5" />
                <Environment preset="city" />
                
                {/* Subtle stars background for depth */}
                <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />
                
                <AnimatedShape />
                
                <OrbitControls 
                    enableZoom={false} 
                    enablePan={false} 
                    enableRotate={false} 
                />
            </Canvas>
        </div>
    );
};

export default Hero3D;
