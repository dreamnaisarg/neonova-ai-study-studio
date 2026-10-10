import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

export interface RealisticDeskSceneProps {
  className?: string;
  isCompact?: boolean;
}

/**
 * RealisticDeskScene
 * 
 * A realistic, human-designed 3D educational still-life composition:
 * - A clean matte study desk surface (warm light-gray / off-white)
 * - An open hardbound academic textbook with realistic page curvature, paper texture, and ribbon bookmark
 * - A modern closed notebook with subtle textured band
 * - A realistic hexagonal wooden pencil with brass ferrule, pink eraser, and graphite point
 * - A slim modern tablet / digital study pad with a soft educational graph display
 * - A small ceramic mug with pencils / ruler
 * - Realistic PBR materials (matte paper, natural painted wood, anodized aluminum, glossy ceramic)
 * - Soft studio lighting: natural key light with gentle contact shadows, warm fill light, no neon or glowing effects.
 */
export default function RealisticDeskScene({
  className = '',
  isCompact = false
}: RealisticDeskSceneProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const groupRef = useRef<THREE.Group | null>(null);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || (isCompact ? 300 : 420);
    const height = container.clientHeight || (isCompact ? 220 : 360);

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Camera: Natural isometric studio angle
    const camera = new THREE.PerspectiveCamera(34, width / height, 0.1, 100);
    camera.position.set(2.8, 3.8, 5.6);
    camera.lookAt(0, -0.1, 0);
    cameraRef.current = camera;

    // 3. Renderer with soft physical tone mapping
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Soft Studio Lighting (Natural, physical illumination)
    // Ambient light: Soft daylight bounce
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    // Key Light: Overhead window light from upper-left
    const keyLight = new THREE.DirectionalLight(0xfffbf5, 1.3);
    keyLight.position.set(-3.5, 6.0, 4.0);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 15;
    keyLight.shadow.camera.left = -4;
    keyLight.shadow.camera.right = 4;
    keyLight.shadow.camera.top = 4;
    keyLight.shadow.camera.bottom = -4;
    keyLight.shadow.bias = -0.001;
    scene.add(keyLight);

    // Fill Light: Soft neutral bounce from front-right
    const fillLight = new THREE.DirectionalLight(0xf1f5f9, 0.6);
    fillLight.position.set(4.0, 3.0, 2.0);
    scene.add(fillLight);

    // Rim Light: Very faint specular highlight
    const rimLight = new THREE.DirectionalLight(0xffffff, 0.35);
    rimLight.position.set(-1.0, 2.0, -4.0);
    scene.add(rimLight);

    // 5. Root Object Group
    const rootGroup = new THREE.Group();
    scene.add(rootGroup);
    groupRef.current = rootGroup;

    // ----------------------------------------------------
    // BUILD REALISTIC STUDY DESK OBJECTS
    // ----------------------------------------------------

    // A. Desk Table Surface (Matte warm white/light-gray)
    const deskGeo = new THREE.PlaneGeometry(12, 12);
    const deskMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.95,
      metalness: 0.0
    });
    const deskMesh = new THREE.Mesh(deskGeo, deskMat);
    deskMesh.rotation.x = -Math.PI / 2;
    deskMesh.position.y = -0.6;
    deskMesh.receiveShadow = true;
    rootGroup.add(deskMesh);

    // B. Open Hardbound Textbook (Center-left)
    const bookGroup = new THREE.Group();
    bookGroup.position.set(-0.35, -0.56, 0.1);
    bookGroup.rotation.y = -0.15;
    rootGroup.add(bookGroup);

    // Hardcover bottom binding (Navy / Slate blue)
    const coverGeo = new THREE.BoxGeometry(2.8, 0.05, 1.9);
    const coverMat = new THREE.MeshStandardMaterial({
      color: 0x1e3a8a, // Navy
      roughness: 0.5,
      metalness: 0.05
    });
    const coverMesh = new THREE.Mesh(coverGeo, coverMat);
    coverMesh.position.y = 0.025;
    coverMesh.castShadow = true;
    coverMesh.receiveShadow = true;
    bookGroup.add(coverMesh);

    // Left Page (Matte off-white paper with slight bevel/curve)
    const paperMat = new THREE.MeshStandardMaterial({
      color: 0xfdfbf7,
      roughness: 0.9,
      metalness: 0.0
    });
    const leftPageGeo = new THREE.BoxGeometry(1.32, 0.05, 1.82);
    const leftPage = new THREE.Mesh(leftPageGeo, paperMat);
    leftPage.position.set(-0.68, 0.07, 0);
    leftPage.rotation.z = -0.02;
    leftPage.castShadow = true;
    leftPage.receiveShadow = true;
    bookGroup.add(leftPage);

    // Right Page
    const rightPageGeo = new THREE.BoxGeometry(1.32, 0.05, 1.82);
    const rightPage = new THREE.Mesh(rightPageGeo, paperMat);
    rightPage.position.set(0.68, 0.07, 0);
    rightPage.rotation.z = 0.02;
    rightPage.castShadow = true;
    rightPage.receiveShadow = true;
    bookGroup.add(rightPage);

    // Ribbon Bookmark (Clean navy/blue silk marker)
    const ribbonGeo = new THREE.BoxGeometry(0.08, 0.015, 1.2);
    const ribbonMat = new THREE.MeshStandardMaterial({
      color: 0x2563eb,
      roughness: 0.4
    });
    const ribbon = new THREE.Mesh(ribbonGeo, ribbonMat);
    ribbon.position.set(0.12, 0.1, 0.4);
    ribbon.rotation.y = 0.1;
    bookGroup.add(ribbon);

    // C. Closed Companion Notebook (Stacked under or angled to the right)
    const noteGroup = new THREE.Group();
    noteGroup.position.set(1.4, -0.56, -0.3);
    noteGroup.rotation.y = 0.35;
    rootGroup.add(noteGroup);

    // Leatherette / Cardboard Cover (Professional charcoal/slate)
    const noteCoverGeo = new THREE.BoxGeometry(1.4, 0.08, 2.0);
    const noteCoverMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.6,
      metalness: 0.05
    });
    const noteCover = new THREE.Mesh(noteCoverGeo, noteCoverMat);
    noteCover.castShadow = true;
    noteCover.receiveShadow = true;
    noteGroup.add(noteCover);

    // Elastic closure band
    const bandGeo = new THREE.BoxGeometry(1.42, 0.085, 0.08);
    const bandMat = new THREE.MeshStandardMaterial({ color: 0x2563eb, roughness: 0.5 });
    const bandMesh = new THREE.Mesh(bandGeo, bandMat);
    bandMesh.position.set(0, 0, 0.65);
    noteGroup.add(bandMesh);

    // D. Modern Thin Study Tablet (Placed behind open book)
    const tabletGroup = new THREE.Group();
    tabletGroup.position.set(-0.2, -0.56, -1.35);
    tabletGroup.rotation.y = 0.05;
    rootGroup.add(tabletGroup);

    // Aluminum body
    const tabBodyGeo = new THREE.BoxGeometry(2.3, 0.04, 1.5);
    const tabBodyMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.35,
      metalness: 0.7
    });
    const tabBody = new THREE.Mesh(tabBodyGeo, tabBodyMat);
    tabBody.castShadow = true;
    tabBody.receiveShadow = true;
    tabletGroup.add(tabBody);

    // Screen (Clean soft light educational interface preview)
    const screenGeo = new THREE.BoxGeometry(2.18, 0.045, 1.38);
    const screenMat = new THREE.MeshStandardMaterial({
      color: 0xf1f5f9,
      roughness: 0.15,
      metalness: 0.1
    });
    const screenMesh = new THREE.Mesh(screenGeo, screenMat);
    screenMesh.position.y = 0.005;
    tabletGroup.add(screenMesh);

    // E. Realistic Wooden Pencil (Resting on table near notebook)
    const pencilGroup = new THREE.Group();
    pencilGroup.position.set(0.65, -0.54, 0.85);
    pencilGroup.rotation.y = -0.45;
    rootGroup.add(pencilGroup);

    // Pencil Hexagonal Shaft (Classic yellow/amber painted wood)
    const shaftGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.6, 6);
    shaftGeo.rotateX(Math.PI / 2);
    const shaftMat = new THREE.MeshStandardMaterial({
      color: 0xd97706, // Amber wood finish
      roughness: 0.35,
      metalness: 0.05
    });
    const shaftMesh = new THREE.Mesh(shaftGeo, shaftMat);
    shaftMesh.castShadow = true;
    pencilGroup.add(shaftMesh);

    // Sharpened Natural Wood Cone
    const woodConeGeo = new THREE.ConeGeometry(0.04, 0.18, 6);
    woodConeGeo.rotateX(-Math.PI / 2);
    const woodMat = new THREE.MeshStandardMaterial({
      color: 0xfde68a,
      roughness: 0.8
    });
    const woodCone = new THREE.Mesh(woodConeGeo, woodMat);
    woodCone.position.z = 0.89;
    woodCone.castShadow = true;
    pencilGroup.add(woodCone);

    // Graphite Point
    const leadGeo = new THREE.ConeGeometry(0.015, 0.06, 6);
    leadGeo.rotateX(-Math.PI / 2);
    const leadMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.4,
      metalness: 0.6
    });
    const leadMesh = new THREE.Mesh(leadGeo, leadMat);
    leadMesh.position.z = 1.01;
    pencilGroup.add(leadMesh);

    // Metallic Brass Ferrule
    const ferruleGeo = new THREE.CylinderGeometry(0.042, 0.042, 0.12, 16);
    ferruleGeo.rotateX(Math.PI / 2);
    const ferruleMat = new THREE.MeshStandardMaterial({
      color: 0xcbd5e1,
      metalness: 0.85,
      roughness: 0.2
    });
    const ferruleMesh = new THREE.Mesh(ferruleGeo, ferruleMat);
    ferruleMesh.position.z = -0.86;
    pencilGroup.add(ferruleMesh);

    // Pink Rubber Eraser
    const eraserGeo = new THREE.CylinderGeometry(0.038, 0.038, 0.12, 16);
    eraserGeo.rotateX(Math.PI / 2);
    const eraserMat = new THREE.MeshStandardMaterial({
      color: 0xf472b6,
      roughness: 0.75
    });
    const eraserMesh = new THREE.Mesh(eraserGeo, eraserMat);
    eraserMesh.position.z = -0.98;
    pencilGroup.add(eraserMesh);

    // F. Small Ceramic Pen Cup with Ruler (Upper-right desk corner)
    const cupGroup = new THREE.Group();
    cupGroup.position.set(1.5, -0.25, -1.2);
    rootGroup.add(cupGroup);

    // Ceramic Tumbler
    const cupGeo = new THREE.CylinderGeometry(0.32, 0.28, 0.7, 24);
    const cupMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.2,
      metalness: 0.05
    });
    const cupMesh = new THREE.Mesh(cupGeo, cupMat);
    cupMesh.castShadow = true;
    cupMesh.receiveShadow = true;
    cupGroup.add(cupMesh);

    // Wooden drafting ruler standing in cup
    const rulerGeo = new THREE.BoxGeometry(0.08, 1.2, 0.22);
    const rulerMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      roughness: 0.6
    });
    const rulerMesh = new THREE.Mesh(rulerGeo, rulerMat);
    rulerMesh.position.set(0.05, 0.45, 0);
    rulerMesh.rotation.z = -0.15;
    rulerMesh.castShadow = true;
    cupGroup.add(rulerMesh);

    // 6. Very subtle, gentle idle camera motion (barely perceptible studio presence)
    let time = 0;
    const animate = () => {
      time += 0.005;
      
      // Extremely subtle, breathing studio camera motion (no cartoon rotation)
      if (cameraRef.current) {
        cameraRef.current.position.x = 2.8 + Math.sin(time) * 0.06;
        cameraRef.current.position.y = 3.8 + Math.cos(time * 0.8) * 0.04;
        cameraRef.current.lookAt(0, -0.1, 0);
      }

      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);

    const handleResize = () => {
      if (!container || !rendererRef.current || !cameraRef.current) return;
      const w = container.clientWidth || (isCompact ? 300 : 420);
      const h = container.clientHeight || (isCompact ? 220 : 360);
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (rendererRef.current) rendererRef.current.dispose();
      container.innerHTML = '';
    };
  }, [isCompact]);

  return (
    <div 
      ref={mountRef} 
      className={`relative w-full flex items-center justify-center select-none overflow-hidden ${className}`}
      aria-label="Realistic 3D Educational Study Scene"
    />
  );
}
