import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

export interface InteractiveStudyCanvasProps {
  focusedField: 'none' | 'email' | 'password' | 'general';
  className?: string;
  isCompact?: boolean;
}

/**
 * InteractiveStudyCanvas
 * 
 * A real-time, interactive Three.js 3D educational composition rendered on an ultra-clean,
 * light canvas. Features:
 * - A modern open academic notebook with subtle ruled lines and bookmark
 * - A hexagonal drafting pencil with graphite tip and metallic ferrule
 * - A miniature 3D atomic orbital (nucleus + electron rings)
 * - Subtle floating geometric polyhedra (octahedron / icosahedron)
 * - The official NeoNova geometric 'N' monogram with radiant Nova star
 * - Real-world materials: matte paper (roughness 0.85), glossy ferrule (metalness 0.8, roughness 0.2),
 *   natural graphite, and satin lacquer.
 * - Gentle physical lighting (soft key directional light, warm ambient fill, rim light).
 * - Subtle, professional interactive micro-reaction:
 *   * When user focuses 'email', the assembly gently orients toward the right form panel (+0.18 rad Y).
 *   * When user focuses 'password', the lighting smoothly shifts to an ambient protective focus mode.
 */
export default function InteractiveStudyCanvas({
  focusedField = 'none',
  className = '',
  isCompact = false
}: InteractiveStudyCanvasProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const groupRef = useRef<THREE.Group | null>(null);
  const keyLightRef = useRef<THREE.DirectionalLight | null>(null);
  const fillLightRef = useRef<THREE.DirectionalLight | null>(null);
  const targetRotationYRef = useRef(0);
  const currentRotationYRef = useRef(0);
  const animFrameRef = useRef<number | null>(null);

  // Sync focus orientation
  useEffect(() => {
    if (focusedField === 'email') {
      targetRotationYRef.current = 0.24; // Gently turns toward form
    } else if (focusedField === 'password') {
      targetRotationYRef.current = -0.12; // Modest focused alignment
    } else {
      targetRotationYRef.current = 0.04; // Natural resting pose
    }
  }, [focusedField]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || (isCompact ? 280 : 380);
    const height = container.clientHeight || (isCompact ? 200 : 320);

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 100);
    camera.position.set(0, isCompact ? 1.6 : 2.2, isCompact ? 6.2 : 7.2);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // 3. Renderer with high-DPI antialiasing and color management
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Photometrically believable lighting (Soft Key, Fill, Rim)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.4);
    keyLight.position.set(4, 7, 5);
    scene.add(keyLight);
    keyLightRef.current = keyLight;

    const fillLight = new THREE.DirectionalLight(0xe0e7ff, 0.7);
    fillLight.position.set(-5, 3, -2);
    scene.add(fillLight);
    fillLightRef.current = fillLight;

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 0.5);
    rimLight.position.set(0, -3, -4);
    scene.add(rimLight);

    // 5. Root Object Group
    const rootGroup = new THREE.Group();
    scene.add(rootGroup);
    groupRef.current = rootGroup;

    // ----------------------------------------------------
    // ASSEMBLE REALISTIC 3D EDUCATIONAL COMPOSITION
    // ----------------------------------------------------

    // A. Open Hardbound Study Notebook
    const bookGroup = new THREE.Group();
    bookGroup.position.set(0, -0.6, 0);
    bookGroup.rotation.x = -0.38;
    rootGroup.add(bookGroup);

    // Bottom dark cover base
    const coverGeo = new THREE.BoxGeometry(3.6, 0.08, 2.5);
    const coverMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.6,
      metalness: 0.1
    });
    const coverMesh = new THREE.Mesh(coverGeo, coverMat);
    coverMesh.position.y = -0.04;
    bookGroup.add(coverMesh);

    // Left Page (Matte white paper)
    const pageMat = new THREE.MeshStandardMaterial({
      color: 0xfcfcfd,
      roughness: 0.9,
      metalness: 0.02
    });
    const leftPageGeo = new THREE.BoxGeometry(1.68, 0.06, 2.35);
    const leftPage = new THREE.Mesh(leftPageGeo, pageMat);
    leftPage.position.set(-0.86, 0.04, 0);
    leftPage.rotation.z = -0.03;
    bookGroup.add(leftPage);

    // Right Page (Matte white paper)
    const rightPageGeo = new THREE.BoxGeometry(1.68, 0.06, 2.35);
    const rightPage = new THREE.Mesh(rightPageGeo, pageMat);
    rightPage.position.set(0.86, 0.04, 0);
    rightPage.rotation.z = 0.03;
    bookGroup.add(rightPage);

    // Center Spine Binding
    const spineGeo = new THREE.CylinderGeometry(0.04, 0.04, 2.36, 16);
    spineGeo.rotateX(Math.PI / 2);
    const spineMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.5 });
    const spineMesh = new THREE.Mesh(spineGeo, spineMat);
    spineMesh.position.set(0, 0.08, 0);
    bookGroup.add(spineMesh);

    // Subtle Bookmark Ribbon (Violet signature)
    const ribbonGeo = new THREE.BoxGeometry(0.12, 0.02, 1.4);
    const ribbonMat = new THREE.MeshStandardMaterial({ color: 0x6366f1, roughness: 0.3 });
    const ribbon = new THREE.Mesh(ribbonGeo, ribbonMat);
    ribbon.position.set(0.2, 0.09, 0.5);
    ribbon.rotation.y = 0.12;
    bookGroup.add(ribbon);

    // B. Hexagonal Drafting Pencil (Resting on book)
    const pencilGroup = new THREE.Group();
    pencilGroup.position.set(0.7, 0.12, 0.4);
    pencilGroup.rotation.y = 0.65;
    pencilGroup.rotation.z = 0.05;
    bookGroup.add(pencilGroup);

    // Pencil Body (Satin Cyan Lacquer)
    const bodyGeo = new THREE.CylinderGeometry(0.05, 0.05, 1.8, 6);
    bodyGeo.rotateX(Math.PI / 2);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.3, metalness: 0.1 });
    const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
    pencilGroup.add(bodyMesh);

    // Pencil Wood Cone
    const woodGeo = new THREE.ConeGeometry(0.05, 0.22, 6);
    woodGeo.rotateX(-Math.PI / 2);
    const woodMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.8 });
    const woodMesh = new THREE.Mesh(woodGeo, woodMat);
    woodMesh.position.z = 1.01;
    pencilGroup.add(woodMesh);

    // Graphite Lead Tip
    const leadGeo = new THREE.ConeGeometry(0.018, 0.08, 6);
    leadGeo.rotateX(-Math.PI / 2);
    const leadMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4, metalness: 0.7 });
    const leadMesh = new THREE.Mesh(leadGeo, leadMat);
    leadMesh.position.z = 1.15;
    pencilGroup.add(leadMesh);

    // Metallic Brass Ferrule
    const ferruleGeo = new THREE.CylinderGeometry(0.052, 0.052, 0.15, 16);
    ferruleGeo.rotateX(Math.PI / 2);
    const ferruleMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.2, metalness: 0.85 });
    const ferruleMesh = new THREE.Mesh(ferruleGeo, ferruleMat);
    ferruleMesh.position.z = -0.98;
    pencilGroup.add(ferruleMesh);

    // Pink Eraser
    const eraserGeo = new THREE.CylinderGeometry(0.048, 0.048, 0.14, 16);
    eraserGeo.rotateX(Math.PI / 2);
    const eraserMat = new THREE.MeshStandardMaterial({ color: 0xf472b6, roughness: 0.7 });
    const eraserMesh = new THREE.Mesh(eraserGeo, eraserMat);
    eraserMesh.position.z = -1.12;
    pencilGroup.add(eraserMesh);

    // C. Miniature 3D Atomic Model (Floating in upper-left)
    const atomGroup = new THREE.Group();
    atomGroup.position.set(-1.25, 0.95, -0.2);
    rootGroup.add(atomGroup);

    // Nucleus (dense sphere with subtle glow)
    const nucleusGeo = new THREE.SphereGeometry(0.18, 24, 20);
    const nucleusMat = new THREE.MeshStandardMaterial({
      color: 0x2563eb,
      roughness: 0.2,
      metalness: 0.3
    });
    const nucleus = new THREE.Mesh(nucleusGeo, nucleusMat);
    atomGroup.add(nucleus);

    // Orbit Ring 1 (Cyan)
    const orbitGeo1 = new THREE.TorusGeometry(0.65, 0.016, 12, 48);
    const orbitMat1 = new THREE.MeshStandardMaterial({ color: 0x06b6d4, roughness: 0.3 });
    const orbit1 = new THREE.Mesh(orbitGeo1, orbitMat1);
    orbit1.rotation.x = Math.PI / 3;
    atomGroup.add(orbit1);

    // Electron 1
    const elecGeo = new THREE.SphereGeometry(0.04, 12, 12);
    const elecMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, metalness: 0.4 });
    const elec1 = new THREE.Mesh(elecGeo, elecMat);
    elec1.position.set(0.65, 0, 0);
    orbit1.add(elec1);

    // Orbit Ring 2 (Violet)
    const orbitGeo2 = new THREE.TorusGeometry(0.65, 0.016, 12, 48);
    const orbitMat2 = new THREE.MeshStandardMaterial({ color: 0x7c3aed, roughness: 0.3 });
    const orbit2 = new THREE.Mesh(orbitGeo2, orbitMat2);
    orbit2.rotation.y = Math.PI / 2.8;
    orbit2.rotation.x = -Math.PI / 4;
    atomGroup.add(orbit2);

    // Electron 2
    const elec2 = new THREE.Mesh(elecGeo, elecMat);
    elec2.position.set(-0.65, 0, 0);
    orbit2.add(elec2);

    // D. Soft Floating Geometric Octahedron (Mathematical Object)
    const polyGroup = new THREE.Group();
    polyGroup.position.set(1.4, 0.85, -0.4);
    rootGroup.add(polyGroup);

    const octaGeo = new THREE.OctahedronGeometry(0.42, 0);
    const octaMat = new THREE.MeshStandardMaterial({
      color: 0x818cf8,
      roughness: 0.25,
      metalness: 0.2,
      transparent: true,
      opacity: 0.92
    });
    const octaMesh = new THREE.Mesh(octaGeo, octaMat);
    polyGroup.add(octaMesh);

    // Edge wireframe on polyhedra
    const octaEdges = new THREE.LineSegments(
      new THREE.EdgesGeometry(octaGeo),
      new THREE.LineBasicMaterial({ color: 0x312e81, linewidth: 1.5 })
    );
    polyGroup.add(octaEdges);

    // E. Central Floating Geometric 'N' Prism Token (NeoNova Identity)
    const nTokenGroup = new THREE.Group();
    nTokenGroup.position.set(0, 0.88, 0.3);
    rootGroup.add(nTokenGroup);

    // Rounded square badge base plate
    const badgeGeo = new THREE.BoxGeometry(0.85, 0.85, 0.12);
    const badgeMat = new THREE.MeshStandardMaterial({
      color: 0x0b1120,
      roughness: 0.3,
      metalness: 0.2
    });
    const badgeMesh = new THREE.Mesh(badgeGeo, badgeMat);
    badgeMesh.rotation.z = 0.08;
    nTokenGroup.add(badgeMesh);

    // 3D Monogram 'N' (Clean extrusion profile)
    const nShape = new THREE.Shape();
    nShape.moveTo(-0.25, -0.28);
    nShape.lineTo(-0.25, 0.28);
    nShape.lineTo(-0.12, 0.28);
    nShape.lineTo(0.12, -0.15);
    nShape.lineTo(0.12, 0.28);
    nShape.lineTo(0.25, 0.28);
    nShape.lineTo(0.25, -0.28);
    nShape.lineTo(0.12, -0.28);
    nShape.lineTo(-0.12, 0.15);
    nShape.lineTo(-0.12, -0.28);
    nShape.closePath();

    const nExtrudeSettings = {
      depth: 0.06,
      bevelEnabled: true,
      bevelSegments: 3,
      steps: 1,
      bevelSize: 0.015,
      bevelThickness: 0.015
    };
    const nGeo = new THREE.ExtrudeGeometry(nShape, nExtrudeSettings);
    const nMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      metalness: 0.5,
      roughness: 0.2
    });
    const nMesh = new THREE.Mesh(nGeo, nMat);
    nMesh.position.set(0, 0, 0.06);
    badgeMesh.add(nMesh);

    // Radiant Cyan Nova Star
    const starGeo = new THREE.OctahedronGeometry(0.08, 0);
    starGeo.scale(0.8, 1.8, 0.8);
    const starMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.6,
      roughness: 0.1
    });
    const starMesh = new THREE.Mesh(starGeo, starMat);
    starMesh.position.set(0.24, 0.24, 0.12);
    badgeMesh.add(starMesh);

    // 6. Smooth Animation Loop with Micro-Interactions
    let time = 0;
    const animate = () => {
      time += 0.015;

      // Smooth damped rotation tracking toward target field orientation
      currentRotationYRef.current += (targetRotationYRef.current - currentRotationYRef.current) * 0.06;
      if (rootGroup) {
        rootGroup.rotation.y = currentRotationYRef.current;
      }

      // Gentle orbital spin on the atomic rings
      if (orbit1 && orbit2) {
        orbit1.rotation.z = time * 0.8;
        orbit2.rotation.z = -time * 0.6;
      }

      // Slow elegant tumble on the mathematical solid
      if (polyGroup) {
        polyGroup.rotation.x = time * 0.35;
        polyGroup.rotation.y = time * 0.45;
        polyGroup.position.y = 0.85 + Math.sin(time * 1.2) * 0.04;
      }

      // Subtle breathing hover on the central NeoNova mark
      if (nTokenGroup) {
        nTokenGroup.position.y = 0.88 + Math.sin(time * 0.9) * 0.03;
      }

      // Subtle light temperature shift on password focus
      if (keyLightRef.current && fillLightRef.current) {
        const isPassword = focusedField === 'password';
        const targetKeyIntensity = isPassword ? 1.6 : 1.4;
        const targetFillColor = isPassword ? 0xdbeafe : 0xe0e7ff;
        keyLightRef.current.intensity += (targetKeyIntensity - keyLightRef.current.intensity) * 0.05;
        fillLightRef.current.color.set(targetFillColor);
      }

      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);

    // Responsive resize handler
    const handleResize = () => {
      if (!container || !rendererRef.current || !cameraRef.current) return;
      const w = container.clientWidth || 380;
      const h = container.clientHeight || 320;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
      container.innerHTML = '';
    };
  }, [isCompact, focusedField]);

  return (
    <div 
      ref={mountRef} 
      className={`relative w-full flex items-center justify-center select-none overflow-hidden ${className}`}
      aria-label="Interactive 3D NeoNova Study Composition"
    />
  );
}
