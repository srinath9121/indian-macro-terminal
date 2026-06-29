import { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * ParticleBackground — Three.js BufferGeometry point cloud
 * 400 particles slowly rotating. position:fixed, z-index:0, pointer-events:none.
 * On mobile (maxTouchPoints>0) shows a CSS gradient fallback instead.
 */
const isMobile = () => typeof navigator !== 'undefined' && navigator.maxTouchPoints > 0;

export default function ParticleBackground() {
  const mountRef = useRef(null);

  useEffect(() => {
    if (isMobile()) return; // CSS gradient fallback on mobile — no GPU overhead

    const mount = mountRef.current;
    if (!mount) return;

    // Scene
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, mount.clientWidth / mount.clientHeight, 0.1, 1000);
    camera.position.z = 20;

    const renderer = new THREE.WebGLRenderer({
      antialias: false,
      alpha: true,
      powerPreference: 'low-power',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    // Particle geometry — 400 points in a 20×20×5 box
    const particleCount = 400;
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3]     = (Math.random() - 0.5) * 20; // x
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20; // y
      positions[i * 3 + 2] = (Math.random() - 0.5) * 5 - 8; // z (behind content)
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const mat = new THREE.PointsMaterial({
      color: 0x2563eb,
      size: 0.06,
      opacity: 0.45,
      transparent: true,
      sizeAttenuation: true,
    });

    const points = new THREE.Points(geo, mat);
    scene.add(points);

    // Animation loop — rotate the whole Points object, do NOT animate individual particles
    let animId;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      points.rotation.y += 0.0002;  // ~0.75 rpm equivalent
      renderer.render(scene, camera);
    };
    animate();

    // Resize handler
    const onResize = () => {
      if (!mount) return;
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };
    window.addEventListener('resize', onResize);

    // Cleanup on unmount — dispose everything
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      geo.dispose();
      mat.dispose();
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  if (isMobile()) {
    // CSS gradient fallback — no GPU needed on mobile
    return (
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse at 20% 50%, rgba(37,99,235,0.08) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(6,182,212,0.06) 0%, transparent 50%)',
      }} />
    );
  }

  return (
    <div
      ref={mountRef}
      style={{
        position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
        width: '100vw', height: '100vh',
      }}
    />
  );
}
