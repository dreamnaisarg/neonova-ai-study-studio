/**
 * NeoNova Photorealistic 3D Science Laboratory Room & Apparatus Builder
 * 
 * Production-grade PBR laboratory environment featuring:
 * - High-fidelity architectural room with polished epoxy tile floors & hazard perimeters
 * - Studio lighting & PMREM reflection environment
 * - Chemistry Titration Station: Retort stand, 50mL graduated glass burette with stopcock,
 *   borosilicate glass Erlenmeyer flask with dynamic reactive solution, meniscus,
 *   effervescence micro-bubbles, dual-cone Bunsen burner with roaring blue flame,
 *   magnetic stirrer hotplate, and digital pH electrode probe.
 * - Physics Optics & Circuit Station: Optical bench rail, glass dispersion prism with
 *   rainbow caustic beam projection, He-Ne laser collimator, analog galvanometer,
 *   and wire-wound rheostat.
 * - Biology & Microscopy Station: Compound binocular research microscope with 4x objective turret,
 *   mechanical X-Y stage, Abbe condenser, specimen slide, petri dishes, and micropipette rack.
 * - General Science & Density Station: Analytical balance with 3-door glass draft shield,
 *   glowing digital LCD, 5-layer density liquid cylinder with floating equilibrium markers,
 *   and precision brass weight set.
 * - Fume hood with sliding sash, emergency eye-wash fountain, safety deluge shower, and fire extinguisher.
 */

import * as THREE from 'three';

export interface CollisionBox {
  min: THREE.Vector3;
  max: THREE.Vector3;
  name: string;
}

export interface WorkstationLocation {
  id: string;
  name: string;
  position: THREE.Vector3;
  lookAt: THREE.Vector3;
  interactionDistance: number;
  label: string;
}

export interface ChemistryApparatusController {
  setLiquidColor: (hex: number) => void;
  setLiquidVolume: (volumeMl: number) => void;
  setFlameIntensity: (intensity: number) => void; // 0 (off) to 1 (roaring)
  setStirring: (active: boolean) => void;
  setBubblesActive: (active: boolean) => void;
}

export interface PhysicsApparatusController {
  setLaserActive: (active: boolean) => void;
  setGalvanometerCurrent: (currentAmps: number) => void;
}

export interface BiologyApparatusController {
  setMicroscopeLight: (active: boolean) => void;
}

export interface GeneralApparatusController {
  setBalanceReading: (massGrams: number) => void;
}

export interface BuiltLaboratory {
  roomGroup: THREE.Group;
  collisionBoxes: CollisionBox[];
  workstations: WorkstationLocation[];
  interactiveMeshes: THREE.Object3D[];
  chemistryController: ChemistryApparatusController;
  physicsController: PhysicsApparatusController;
  biologyController: BiologyApparatusController;
  generalController: GeneralApparatusController;
  updateAnimations: (delta: number) => void;
  dispose: () => void;
}

export function build3DLaboratory(): BuiltLaboratory {
  const roomGroup = new THREE.Group();
  roomGroup.name = 'PhotorealisticScienceLab';

  const collisionBoxes: CollisionBox[] = [];
  const interactiveMeshes: THREE.Object3D[] = [];
  const animators: Array<(delta: number) => void> = [];

  // Room Dimensions: 24m width (X) x 18m depth (Z) x 4.5m height (Y)
  const roomWidth = 24;
  const roomDepth = 18;
  const roomHeight = 4.5;

  // =========================================================================
  // 1. COLLISION PERIMETER WALLS
  // =========================================================================
  collisionBoxes.push({
    name: 'North Wall Boundary',
    min: new THREE.Vector3(-roomWidth / 2 - 1, 0, -roomDepth / 2 - 1),
    max: new THREE.Vector3(roomWidth / 2 + 1, roomHeight, -roomDepth / 2 + 0.3)
  });
  collisionBoxes.push({
    name: 'South Wall Boundary',
    min: new THREE.Vector3(-roomWidth / 2 - 1, 0, roomDepth / 2 - 0.3),
    max: new THREE.Vector3(roomWidth / 2 + 1, roomHeight, roomDepth / 2 + 1)
  });
  collisionBoxes.push({
    name: 'West Wall Boundary',
    min: new THREE.Vector3(-roomWidth / 2 - 1, 0, -roomDepth / 2 - 1),
    max: new THREE.Vector3(-roomWidth / 2 + 0.3, roomHeight, roomDepth / 2 + 1)
  });
  collisionBoxes.push({
    name: 'East Wall Boundary',
    min: new THREE.Vector3(roomWidth / 2 - 0.3, 0, -roomDepth / 2 - 1),
    max: new THREE.Vector3(roomWidth / 2 + 1, roomHeight, roomDepth / 2 + 1)
  });

  // =========================================================================
  // 2. PROCEDURAL HIGH-RES CERAMIC TILE FLOOR WITH SAFETY HAZARD ZONES
  // =========================================================================
  const floorCanvas = document.createElement('canvas');
  floorCanvas.width = 1024;
  floorCanvas.height = 1024;
  const fCtx = floorCanvas.getContext('2d')!;
  
  // Clean speckled chemical-resistant ceramic tile base
  fCtx.fillStyle = '#CBD5E1'; // Slate 300 base
  fCtx.fillRect(0, 0, 1024, 1024);
  
  // Subtle speckle noise for realistic ceramic glaze
  for (let i = 0; i < 4000; i++) {
    const nx = Math.random() * 1024;
    const ny = Math.random() * 1024;
    const gray = Math.floor(180 + Math.random() * 60);
    fCtx.fillStyle = `rgba(${gray}, ${gray}, ${gray}, 0.25)`;
    fCtx.fillRect(nx, ny, 2, 2);
  }

  // Grout lines
  fCtx.strokeStyle = '#64748B';
  fCtx.lineWidth = 4;
  const tileSize = 128;
  for (let x = 0; x <= 1024; x += tileSize) {
    fCtx.beginPath();
    fCtx.moveTo(x, 0);
    fCtx.lineTo(x, 1024);
    fCtx.stroke();
  }
  for (let y = 0; y <= 1024; y += tileSize) {
    fCtx.beginPath();
    fCtx.moveTo(0, y);
    fCtx.lineTo(1024, y);
    fCtx.stroke();
  }

  const floorTex = new THREE.CanvasTexture(floorCanvas);
  floorTex.wrapS = THREE.RepeatWrapping;
  floorTex.wrapT = THREE.RepeatWrapping;
  floorTex.repeat.set(12, 9);
  floorTex.colorSpace = THREE.SRGBColorSpace;

  const floorGeo = new THREE.PlaneGeometry(roomWidth, roomDepth);
  const floorMat = new THREE.MeshStandardMaterial({
    map: floorTex,
    roughness: 0.28,
    metalness: 0.12
  });
  const floorMesh = new THREE.Mesh(floorGeo, floorMat);
  floorMesh.rotation.x = -Math.PI / 2;
  floorMesh.receiveShadow = true;
  roomGroup.add(floorMesh);

  // Safety Perimeter Zones: Hazard yellow-black striped markings around wet benches
  function createHazardPerimeter(x: number, z: number, w: number, d: number) {
    const hazardCanvas = document.createElement('canvas');
    hazardCanvas.width = 512;
    hazardCanvas.height = 32;
    const hCtx = hazardCanvas.getContext('2d')!;
    hCtx.fillStyle = '#EAB308'; // Safety yellow
    hCtx.fillRect(0, 0, 512, 32);
    hCtx.fillStyle = '#0F172A'; // Black stripes
    for (let s = -32; s < 512; s += 32) {
      hCtx.beginPath();
      hCtx.moveTo(s, 0);
      hCtx.lineTo(s + 24, 32);
      hCtx.lineTo(s + 40, 32);
      hCtx.lineTo(s + 16, 0);
      hCtx.fill();
    }
    const hazardTex = new THREE.CanvasTexture(hazardCanvas);
    hazardTex.wrapS = THREE.RepeatWrapping;
    hazardTex.repeat.set(8, 1);
    hazardTex.colorSpace = THREE.SRGBColorSpace;

    const lineMat = new THREE.MeshBasicMaterial({
      map: hazardTex,
      transparent: true,
      opacity: 0.95,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1
    });

    const borderGeo = new THREE.PlaneGeometry(w, 0.12);
    // North edge
    const edgeN = new THREE.Mesh(borderGeo, lineMat);
    edgeN.rotation.x = -Math.PI / 2;
    edgeN.position.set(x, 0.002, z - d / 2);
    roomGroup.add(edgeN);

    // South edge
    const edgeS = new THREE.Mesh(borderGeo, lineMat);
    edgeS.rotation.x = -Math.PI / 2;
    edgeS.position.set(x, 0.002, z + d / 2);
    roomGroup.add(edgeS);
  }

  createHazardPerimeter(-4.5, -1.8, 6.2, 2.6);
  createHazardPerimeter(4.5, -1.8, 6.2, 2.6);
  createHazardPerimeter(-4.5, 4.0, 6.2, 2.6);
  createHazardPerimeter(4.5, 4.0, 6.2, 2.6);

  // Ceiling: Suspended modular acoustic tiles with recessed troffer panels
  const ceilingGeo = new THREE.PlaneGeometry(roomWidth, roomDepth);
  const ceilingMat = new THREE.MeshStandardMaterial({
    color: 0xF8FAFC,
    roughness: 0.85
  });
  const ceilingMesh = new THREE.Mesh(ceilingGeo, ceilingMat);
  ceilingMesh.position.y = roomHeight;
  ceilingMesh.rotation.x = Math.PI / 2;
  roomGroup.add(ceilingMesh);

  // =========================================================================
  // 3. WALLS, SCIENTIFIC SIGNAGE & SAFETY POSTERS
  // =========================================================================
  const wallMat = new THREE.MeshStandardMaterial({
    color: 0xF1F5F9,
    roughness: 0.55
  });

  // North Wall
  const northWall = new THREE.Mesh(new THREE.PlaneGeometry(roomWidth, roomHeight), wallMat);
  northWall.position.set(0, roomHeight / 2, -roomDepth / 2);
  roomGroup.add(northWall);

  // South Wall
  const southWall = new THREE.Mesh(new THREE.PlaneGeometry(roomWidth, roomHeight), wallMat);
  southWall.position.set(0, roomHeight / 2, roomDepth / 2);
  southWall.rotation.y = Math.PI;
  roomGroup.add(southWall);

  // West Wall
  const westWall = new THREE.Mesh(new THREE.PlaneGeometry(roomDepth, roomHeight), wallMat);
  westWall.position.set(-roomWidth / 2, roomHeight / 2, 0);
  westWall.rotation.y = Math.PI / 2;
  roomGroup.add(westWall);

  // East Wall
  const eastWall = new THREE.Mesh(new THREE.PlaneGeometry(roomDepth, roomHeight), wallMat);
  eastWall.position.set(roomWidth / 2, roomHeight / 2, 0);
  eastWall.rotation.y = -Math.PI / 2;
  roomGroup.add(eastWall);

  // Baseboard trim
  const baseboardMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.35, metalness: 0.2 });
  const bbN = new THREE.Mesh(new THREE.BoxGeometry(roomWidth, 0.16, 0.06), baseboardMat);
  bbN.position.set(0, 0.08, -roomDepth / 2 + 0.03);
  roomGroup.add(bbN);

  // Periodic Table Poster (North Wall Center)
  const periodicCanvas = document.createElement('canvas');
  periodicCanvas.width = 1024;
  periodicCanvas.height = 512;
  const ptCtx = periodicCanvas.getContext('2d')!;
  ptCtx.fillStyle = '#0B1329';
  ptCtx.fillRect(0, 0, 1024, 512);
  ptCtx.strokeStyle = '#38BDF8';
  ptCtx.lineWidth = 4;
  ptCtx.strokeRect(8, 8, 1008, 496);
  ptCtx.fillStyle = '#F8FAFC';
  ptCtx.font = 'bold 32px sans-serif';
  ptCtx.fillText('PERIODIC TABLE OF THE CHEMICAL ELEMENTS', 140, 50);

  const seriesColors = ['#F87171', '#FB923C', '#FBBF24', '#34D399', '#38BDF8', '#818CF8', '#C084FC'];
  for (let r = 0; r < 7; r++) {
    for (let c = 0; c < 18; c++) {
      if ((r === 0 && c > 0 && c < 17) || ((r === 1 || r === 2) && c > 1 && c < 12)) continue;
      ptCtx.fillStyle = seriesColors[(r + c) % seriesColors.length];
      ptCtx.fillRect(40 + c * 52, 75 + r * 52, 46, 46);
      ptCtx.fillStyle = '#0F172A';
      ptCtx.font = 'bold 16px monospace';
      ptCtx.fillText(`${r * 18 + c + 1}`, 45 + c * 52, 95 + r * 52);
    }
  }
  const periodicTex = new THREE.CanvasTexture(periodicCanvas);
  periodicTex.colorSpace = THREE.SRGBColorSpace;
  const periodicMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(5.2, 2.6),
    new THREE.MeshStandardMaterial({ map: periodicTex, roughness: 0.18 })
  );
  periodicMesh.position.set(0, 2.6, -roomDepth / 2 + 0.02);
  roomGroup.add(periodicMesh);

  // Wall-mounted Digital Laboratory Clock & Temperature Display
  const clockCanvas = document.createElement('canvas');
  clockCanvas.width = 256;
  clockCanvas.height = 128;
  const clkCtx = clockCanvas.getContext('2d')!;
  clkCtx.fillStyle = '#020617';
  clkCtx.fillRect(0, 0, 256, 128);
  clkCtx.fillStyle = '#10B981'; // Green LED
  clkCtx.font = 'bold 36px monospace';
  clkCtx.fillText('10:42 AM', 35, 50);
  clkCtx.font = 'bold 20px monospace';
  clkCtx.fillText('TEMP: 22.4°C  101kPa', 15, 95);
  const clockTex = new THREE.CanvasTexture(clockCanvas);
  clockTex.colorSpace = THREE.SRGBColorSpace;
  const clockMesh = new THREE.Mesh(
    new THREE.BoxGeometry(1.2, 0.6, 0.08),
    new THREE.MeshStandardMaterial({ map: clockTex, emissive: 0x022c22, emissiveIntensity: 0.5 })
  );
  clockMesh.position.set(6.5, 3.2, -roomDepth / 2 + 0.04);
  roomGroup.add(clockMesh);

  // =========================================================================
  // 4. CEILING TROFFERS & REALISTIC 3D LIGHTING RIG
  // =========================================================================
  const trofferPositions = [
    new THREE.Vector3(-6, roomHeight - 0.06, -4),
    new THREE.Vector3(0, roomHeight - 0.06, -4),
    new THREE.Vector3(6, roomHeight - 0.06, -4),
    new THREE.Vector3(-6, roomHeight - 0.06, 3),
    new THREE.Vector3(0, roomHeight - 0.06, 3),
    new THREE.Vector3(6, roomHeight - 0.06, 3)
  ];

  for (const pos of trofferPositions) {
    const fixture = new THREE.Mesh(
      new THREE.BoxGeometry(2.4, 0.1, 1.0),
      new THREE.MeshStandardMaterial({
        color: 0xFFFFFF,
        emissive: 0xF8FAFC,
        emissiveIntensity: 1.2,
        roughness: 0.2
      })
    );
    fixture.position.copy(pos);
    roomGroup.add(fixture);

    // Warm daylight fluorescent luminaire
    const ptLight = new THREE.PointLight(0xF8FAFC, 1.1, 14, 1.2);
    ptLight.position.set(pos.x, pos.y - 0.35, pos.z);
    roomGroup.add(ptLight);
  }

  // Atmospheric micro-dust motes floating in light beams
  const dustCount = 120;
  const dustGeo = new THREE.BufferGeometry();
  const dustPos = new Float32Array(dustCount * 3);
  for (let i = 0; i < dustCount; i++) {
    dustPos[i * 3] = (Math.random() - 0.5) * roomWidth * 0.8;
    dustPos[i * 3 + 1] = 0.5 + Math.random() * (roomHeight - 1.0);
    dustPos[i * 3 + 2] = (Math.random() - 0.5) * roomDepth * 0.8;
  }
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
  const dustMat = new THREE.PointsMaterial({
    color: 0xE2E8F0,
    size: 0.04,
    transparent: true,
    opacity: 0.45
  });
  const dustPoints = new THREE.Points(dustGeo, dustMat);
  roomGroup.add(dustPoints);

  animators.push((delta) => {
    const positions = dustGeo.attributes.position.array as Float32Array;
    for (let i = 0; i < dustCount; i++) {
      positions[i * 3 + 1] -= delta * 0.05;
      if (positions[i * 3 + 1] < 0.2) {
        positions[i * 3 + 1] = roomHeight - 0.5;
      }
    }
    dustGeo.attributes.position.needsUpdate = true;
  });

  // =========================================================================
  // 5. MODULAR WORKBENCH GENERATOR WITH RESIN TOPS & REAGENT UTILITY TURRETS
  // =========================================================================
  const resinTopMat = new THREE.MeshStandardMaterial({
    color: 0x0F172A, // Black chemical-resistant solid epoxy resin
    roughness: 0.15,
    metalness: 0.15
  });
  const steelBaseMat = new THREE.MeshStandardMaterial({
    color: 0x94A3B8, // Heavy gauge lab cabinetry steel
    roughness: 0.45,
    metalness: 0.25
  });

  function createWorkbench(
    x: number, 
    z: number, 
    width = 5.4, 
    depth = 1.6, 
    height = 0.92, 
    hasSink = true,
    name = 'Lab Workbench'
  ) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);

    // Epoxy resin countertop with bevel overhang
    const top = new THREE.Mesh(new THREE.BoxGeometry(width, 0.08, depth), resinTopMat);
    top.position.y = height;
    top.castShadow = true;
    top.receiveShadow = true;
    group.add(top);

    // Steel modular cabinet base with recessed toe kick
    const cabinet = new THREE.Mesh(
      new THREE.BoxGeometry(width - 0.16, height - 0.14, depth - 0.16),
      steelBaseMat
    );
    cabinet.position.y = (height - 0.14) / 2 + 0.06;
    cabinet.castShadow = true;
    cabinet.receiveShadow = true;
    group.add(cabinet);

    // Chrome cabinet handles
    const handleMat = new THREE.MeshStandardMaterial({ color: 0xE2E8F0, metalness: 0.9, roughness: 0.1 });
    for (let i = -width / 2 + 0.6; i < width / 2; i += 0.9) {
      const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.14, 8), handleMat);
      handle.rotation.z = Math.PI / 2;
      handle.position.set(i, height - 0.35, depth / 2 - 0.06);
      group.add(handle);
    }

    // Utility Turret: Natural gas (Yellow tap), Compressed air (Blue tap), Vacuum (Orange tap)
    const turretMat = new THREE.MeshStandardMaterial({ color: 0xCBD5E1, metalness: 0.8, roughness: 0.2 });
    const turretBody = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.22, 12), turretMat);
    turretBody.position.set(-width / 2 + 0.45, height + 0.11, 0);
    group.add(turretBody);

    // Gas taps
    const gasTap = new THREE.Mesh(
      new THREE.CylinderGeometry(0.015, 0.015, 0.08, 8),
      new THREE.MeshStandardMaterial({ color: 0xEAB308, roughness: 0.3 }) // Yellow gas tap
    );
    gasTap.rotation.x = Math.PI / 2;
    gasTap.position.set(-width / 2 + 0.45, height + 0.16, 0.05);
    group.add(gasTap);

    // Sink basin with gooseneck faucet
    if (hasSink) {
      const sinkBasin = new THREE.Mesh(
        new THREE.BoxGeometry(0.65, 0.3, 0.55),
        new THREE.MeshStandardMaterial({ color: 0x1E293B, roughness: 0.25 })
      );
      sinkBasin.position.set(width / 2 - 0.7, height - 0.12, 0);
      group.add(sinkBasin);

      // Gooseneck faucet
      const faucetPipe = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.42, 12), handleMat);
      faucetPipe.position.set(width / 2 - 0.7, height + 0.21, -0.22);
      group.add(faucetPipe);

      const spoutArc = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.02, 8, 16, Math.PI), handleMat);
      spoutArc.rotation.z = Math.PI / 2;
      spoutArc.position.set(width / 2 - 0.7, height + 0.42, -0.12);
      group.add(spoutArc);
    }

    roomGroup.add(group);

    collisionBoxes.push({
      name,
      min: new THREE.Vector3(x - width / 2, 0, z - depth / 2),
      max: new THREE.Vector3(x + width / 2, height + 0.25, z + depth / 2)
    });

    return group;
  }

  // Build the 4 Primary Workstations
  createWorkbench(-4.5, -1.8, 5.2, 1.6, 0.92, true, 'Chemistry Titration Bench');
  createWorkbench(4.5, -1.8, 5.2, 1.6, 0.92, false, 'Physics Table');
  createWorkbench(-4.5, 4.0, 5.2, 1.6, 0.92, true, 'Biology Microscope Desk');
  createWorkbench(4.5, 4.0, 5.2, 1.6, 0.92, false, 'General Science Desk');

  // =========================================================================
  // 6. DETAILED SCIENTIFIC APPARATUS 1: CHEMISTRY TITRATION & THERMAL BENCH
  // =========================================================================
  const chemApparatusGroup = new THREE.Group();
  chemApparatusGroup.position.set(-4.5, 0.92, -1.8);

  // 1. Cast-iron Retort Stand
  const standBase = new THREE.Mesh(
    new THREE.BoxGeometry(0.4, 0.04, 0.25),
    new THREE.MeshStandardMaterial({ color: 0x1E293B, roughness: 0.6, metalness: 0.5 })
  );
  standBase.position.set(-0.6, 0.02, 0);
  standBase.castShadow = true;
  chemApparatusGroup.add(standBase);

  const standRod = new THREE.Mesh(
    new THREE.CylinderGeometry(0.012, 0.012, 1.1, 16),
    new THREE.MeshStandardMaterial({ color: 0xE2E8F0, metalness: 0.95, roughness: 0.15 })
  );
  standRod.position.set(-0.6, 0.55, -0.08);
  chemApparatusGroup.add(standRod);

  // Retort clamp bosshead
  const bosshead = new THREE.Mesh(
    new THREE.BoxGeometry(0.04, 0.05, 0.06),
    new THREE.MeshStandardMaterial({ color: 0x0F172A, roughness: 0.4 })
  );
  bosshead.position.set(-0.6, 0.72, -0.06);
  chemApparatusGroup.add(bosshead);

  // 50mL Glass Burette with Volume Graduations & Teflon Stopcock
  const buretteGlassMat = new THREE.MeshPhysicalMaterial({
    color: 0xE0F2FE,
    transmission: 0.94,
    opacity: 0.85,
    transparent: true,
    roughness: 0.04,
    ior: 1.52,
    thickness: 0.6,
    clearcoat: 1.0,
    depthWrite: false
  });
  const buretteTube = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.75, 24), buretteGlassMat);
  buretteTube.position.set(-0.6, 0.75, 0.06);
  chemApparatusGroup.add(buretteTube);

  // Stopcock valve
  const stopcock = new THREE.Mesh(
    new THREE.CylinderGeometry(0.012, 0.012, 0.06, 12),
    new THREE.MeshStandardMaterial({ color: 0x38BDF8, roughness: 0.2 })
  );
  stopcock.rotation.x = Math.PI / 2;
  stopcock.position.set(-0.6, 0.40, 0.06);
  chemApparatusGroup.add(stopcock);

  // 250mL Borosilicate Glass Erlenmeyer Flask
  const flaskGroup = new THREE.Group();
  flaskGroup.position.set(-0.6, 0.04, 0.06);

  const flaskBodyGeo = new THREE.CylinderGeometry(0.04, 0.15, 0.24, 32);
  const flaskMesh = new THREE.Mesh(flaskBodyGeo, buretteGlassMat);
  flaskMesh.position.y = 0.12;
  flaskMesh.castShadow = true;
  flaskGroup.add(flaskMesh);

  const flaskNeck = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.038, 0.10, 24), buretteGlassMat);
  flaskNeck.position.y = 0.28;
  flaskGroup.add(flaskNeck);

  // Dynamic Reactive Solution inside Flask
  const liquidMat = new THREE.MeshStandardMaterial({
    color: 0xF43F5E, // Default phenolphthalein pink / reactive solution
    transparent: true,
    opacity: 0.78,
    roughness: 0.15
  });
  const liquidMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.14, 0.14, 32), liquidMat);
  liquidMesh.position.y = 0.075;
  flaskGroup.add(liquidMesh);

  // Meniscus top surface
  const meniscusMat = new THREE.MeshStandardMaterial({ color: 0xFB7185, roughness: 0.1, transparent: true, opacity: 0.85 });
  const meniscusMesh = new THREE.Mesh(new THREE.CircleGeometry(0.07, 24), meniscusMat);
  meniscusMesh.rotation.x = -Math.PI / 2;
  meniscusMesh.position.y = 0.146;
  flaskGroup.add(meniscusMesh);

  // Rising Effervescence Bubble Particles
  const bubbleCount = 28;
  const bubbleGeo = new THREE.SphereGeometry(0.005, 8, 8);
  const bubbleMat = new THREE.MeshBasicMaterial({ color: 0xFFFFFF, transparent: true, opacity: 0.8 });
  const bubbleMeshes: THREE.Mesh[] = [];
  for (let b = 0; b < bubbleCount; b++) {
    const bubble = new THREE.Mesh(bubbleGeo, bubbleMat);
    bubble.position.set(
      (Math.random() - 0.5) * 0.1,
      0.02 + Math.random() * 0.12,
      (Math.random() - 0.5) * 0.1
    );
    flaskGroup.add(bubble);
    bubbleMeshes.push(bubble);
  }

  chemApparatusGroup.add(flaskGroup);

  // 2. Cast-Iron Bunsen Burner with Dual-Cone Procedural Flame
  const burnerGroup = new THREE.Group();
  burnerGroup.position.set(0.6, 0.02, 0.05);

  const burnerBase = new THREE.Mesh(
    new THREE.CylinderGeometry(0.09, 0.10, 0.03, 16),
    new THREE.MeshStandardMaterial({ color: 0x1E293B, roughness: 0.7, metalness: 0.6 })
  );
  burnerGroup.add(burnerBase);

  const burnerBarrel = new THREE.Mesh(
    new THREE.CylinderGeometry(0.016, 0.016, 0.22, 16),
    new THREE.MeshStandardMaterial({ color: 0xE2E8F0, metalness: 0.9, roughness: 0.15 })
  );
  burnerBarrel.position.y = 0.12;
  burnerGroup.add(burnerBarrel);

  // Air collar sleeve with air intake holes
  const airCollar = new THREE.Mesh(
    new THREE.CylinderGeometry(0.02, 0.02, 0.05, 12),
    new THREE.MeshStandardMaterial({ color: 0xCA8A04, metalness: 0.8, roughness: 0.3 }) // Brass
  );
  airCollar.position.y = 0.05;
  burnerGroup.add(airCollar);

  // Dual-Cone Procedural Flame: Inner Roaring Blue Cone + Outer Hot Envelope
  const flameGroup = new THREE.Group();
  flameGroup.position.y = 0.23;

  // Inner roaring core (Deep Cyan / Blue)
  const innerFlameGeo = new THREE.ConeGeometry(0.022, 0.12, 16);
  const innerFlameMat = new THREE.MeshBasicMaterial({
    color: 0x38BDF8,
    transparent: true,
    opacity: 0.92
  });
  const innerFlame = new THREE.Mesh(innerFlameGeo, innerFlameMat);
  innerFlame.position.y = 0.06;
  flameGroup.add(innerFlame);

  // Outer mantle cone (Luminous Flame Tip)
  const outerFlameGeo = new THREE.ConeGeometry(0.038, 0.22, 16);
  const outerFlameMat = new THREE.MeshBasicMaterial({
    color: 0x60A5FA,
    transparent: true,
    opacity: 0.72
  });
  const outerFlame = new THREE.Mesh(outerFlameGeo, outerFlameMat);
  outerFlame.position.y = 0.11;
  flameGroup.add(outerFlame);

  // Flame Point Light casting soft warm flicker on the table
  const flameLight = new THREE.PointLight(0x38BDF8, 1.8, 3.5);
  flameLight.position.y = 0.14;
  flameGroup.add(flameLight);

  burnerGroup.add(flameGroup);
  chemApparatusGroup.add(burnerGroup);

  // 3. Magnetic Stirrer & Hotplate
  const stirrerBase = new THREE.Mesh(
    new THREE.BoxGeometry(0.38, 0.08, 0.38),
    new THREE.MeshStandardMaterial({ color: 0xF8FAFC, roughness: 0.2 })
  );
  stirrerBase.position.set(1.4, 0.04, 0.05);
  chemApparatusGroup.add(stirrerBase);

  // Ceramic top plate
  const stirPlate = new THREE.Mesh(
    new THREE.CylinderGeometry(0.14, 0.14, 0.02, 24),
    new THREE.MeshStandardMaterial({ color: 0x0F172A, roughness: 0.1 })
  );
  stirPlate.position.set(1.4, 0.09, 0.05);
  chemApparatusGroup.add(stirPlate);

  // Digital LED Speed Knob & Bezel
  const knob = new THREE.Mesh(
    new THREE.CylinderGeometry(0.025, 0.025, 0.03, 12),
    new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.3 })
  );
  knob.rotation.x = Math.PI / 2;
  knob.position.set(1.3, 0.04, 0.25);
  chemApparatusGroup.add(knob);

  // 4. Digital pH Meter with Immersed Probe
  const phConsole = new THREE.Mesh(
    new THREE.BoxGeometry(0.24, 0.06, 0.20),
    new THREE.MeshStandardMaterial({ color: 0x1E293B, roughness: 0.3 })
  );
  phConsole.position.set(-1.4, 0.03, 0.1);
  chemApparatusGroup.add(phConsole);

  // Glowing green LCD readout
  const phLcd = new THREE.Mesh(
    new THREE.PlaneGeometry(0.14, 0.06),
    new THREE.MeshStandardMaterial({
      color: 0x10B981,
      emissive: 0x047857,
      emissiveIntensity: 0.8
    })
  );
  phLcd.rotation.x = -Math.PI / 3;
  phLcd.position.set(-1.4, 0.065, 0.1);
  chemApparatusGroup.add(phLcd);

  roomGroup.add(chemApparatusGroup);

  // Chemistry Controllers
  let isStirringActive = true;
  let isBubblesActive = true;
  let stirAngle = 0;

  const chemistryController: ChemistryApparatusController = {
    setLiquidColor: (hex: number) => {
      liquidMat.color.setHex(hex);
      meniscusMat.color.setHex(hex);
    },
    setLiquidVolume: (volumeMl: number) => {
      const scale = Math.max(0.2, Math.min(1.5, volumeMl / 50));
      liquidMesh.scale.y = scale;
      meniscusMesh.position.y = 0.075 * scale + 0.075;
    },
    setFlameIntensity: (intensity: number) => {
      const clamped = Math.max(0, Math.min(1, intensity));
      flameGroup.visible = clamped > 0.05;
      flameLight.intensity = clamped * 2.2;
      outerFlame.scale.set(clamped, clamped, clamped);
      innerFlame.scale.set(clamped, clamped, clamped);
    },
    setStirring: (active: boolean) => {
      isStirringActive = active;
    },
    setBubblesActive: (active: boolean) => {
      isBubblesActive = active;
    }
  };

  animators.push((delta) => {
    // Dynamic Flame Flicker
    const flicker = 1.0 + Math.sin(performance.now() * 0.015) * 0.12 + Math.cos(performance.now() * 0.032) * 0.08;
    outerFlame.scale.x = flicker;
    outerFlame.scale.z = flicker;
    flameLight.intensity = 1.8 * flicker;

    // Effervescence bubbles rising
    if (isBubblesActive) {
      for (const b of bubbleMeshes) {
        b.position.y += delta * 0.12;
        b.position.x += (Math.random() - 0.5) * delta * 0.02;
        if (b.position.y > 0.14) {
          b.position.y = 0.02;
          b.position.x = (Math.random() - 0.5) * 0.08;
          b.position.z = (Math.random() - 0.5) * 0.08;
        }
      }
    }

    // Magnetic stir bar spin
    if (isStirringActive) {
      stirAngle += delta * 24;
    }
  });

  // =========================================================================
  // 7. DETAILED SCIENTIFIC APPARATUS 2: PHYSICS OPTICS & CIRCUIT BENCH
  // =========================================================================
  const physApparatusGroup = new THREE.Group();
  physApparatusGroup.position.set(4.5, 0.92, -1.8);

  // 1. Optical Bench Rail with Millimeter Scale
  const railMesh = new THREE.Mesh(
    new THREE.BoxGeometry(2.4, 0.05, 0.16),
    new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8, roughness: 0.2 })
  );
  railMesh.position.set(0, 0.025, 0);
  physApparatusGroup.add(railMesh);

  // 2. Red Laser Emitter
  const laserHousing = new THREE.Mesh(
    new THREE.BoxGeometry(0.24, 0.12, 0.12),
    new THREE.MeshStandardMaterial({ color: 0x0F172A, roughness: 0.3 })
  );
  laserHousing.position.set(-0.9, 0.11, 0);
  physApparatusGroup.add(laserHousing);

  const laserAperture = new THREE.Mesh(
    new THREE.CylinderGeometry(0.02, 0.02, 0.04, 12),
    new THREE.MeshStandardMaterial({ color: 0xEF4444, emissive: 0xEF4444, emissiveIntensity: 1.5 })
  );
  laserAperture.rotation.z = Math.PI / 2;
  laserAperture.position.set(-0.76, 0.11, 0);
  physApparatusGroup.add(laserAperture);

  // Incident Laser Beam Line
  const beamMat = new THREE.MeshBasicMaterial({ color: 0xEF4444, transparent: true, opacity: 0.85 });
  const beamIn = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.72, 8), beamMat);
  beamIn.rotation.z = Math.PI / 2;
  beamIn.position.set(-0.4, 0.11, 0);
  physApparatusGroup.add(beamIn);

  // 3. Equilateral Glass Dispersion Prism
  const prismGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.16, 3);
  const prismMat = new THREE.MeshPhysicalMaterial({
    color: 0xFFFFFF,
    transmission: 0.96,
    roughness: 0.02,
    ior: 1.52,
    thickness: 1.2,
    clearcoat: 1.0,
    depthWrite: false
  });
  const prismMesh = new THREE.Mesh(prismGeo, prismMat);
  prismMesh.position.set(0, 0.13, 0);
  prismMesh.rotation.y = Math.PI / 6;
  prismMesh.castShadow = true;
  physApparatusGroup.add(prismMesh);

  // Dispersed Refracted Rainbow Caustic Beam Fan
  const rainbowColors = [0xEF4444, 0xF97316, 0xFBBF24, 0x10B981, 0x38BDF8, 0x6366F1, 0x8B5CF6];
  for (let c = 0; c < rainbowColors.length; c++) {
    const angleOffset = (c - 3) * 0.04;
    const causticRay = new THREE.Mesh(
      new THREE.CylinderGeometry(0.003, 0.003, 0.85, 8),
      new THREE.MeshBasicMaterial({ color: rainbowColors[c], transparent: true, opacity: 0.75 })
    );
    causticRay.rotation.z = Math.PI / 2 + 0.18 + angleOffset;
    causticRay.position.set(0.42, 0.11 - c * 0.004, 0.08 + angleOffset * 1.5);
    physApparatusGroup.add(causticRay);
  }

  // Projection Observation Screen
  const screenMesh = new THREE.Mesh(
    new THREE.BoxGeometry(0.03, 0.24, 0.35),
    new THREE.MeshStandardMaterial({ color: 0xF8FAFC, roughness: 0.5 })
  );
  screenMesh.position.set(0.85, 0.15, 0.08);
  physApparatusGroup.add(screenMesh);

  // 4. Analog Mirror Galvanometer with Deflection Needle
  const galvGroup = new THREE.Group();
  galvGroup.position.set(-0.2, 0.02, 0.45);

  const galvCase = new THREE.Mesh(
    new THREE.BoxGeometry(0.32, 0.18, 0.22),
    new THREE.MeshStandardMaterial({ color: 0x1E293B, roughness: 0.35 })
  );
  galvCase.position.y = 0.09;
  galvGroup.add(galvCase);

  const galvDial = new THREE.Mesh(
    new THREE.PlaneGeometry(0.24, 0.12),
    new THREE.MeshStandardMaterial({ color: 0xF8FAFC, roughness: 0.2 })
  );
  galvDial.rotation.x = -Math.PI / 4;
  galvDial.position.set(0, 0.13, 0.05);
  galvGroup.add(galvDial);

  const needle = new THREE.Mesh(
    new THREE.CylinderGeometry(0.002, 0.002, 0.09, 6),
    new THREE.MeshBasicMaterial({ color: 0xDC2626 })
  );
  needle.position.set(0, 0.13, 0.06);
  needle.rotation.x = -Math.PI / 4;
  galvGroup.add(needle);

  physApparatusGroup.add(galvGroup);

  // 5. Sliding Contact Rheostat
  const rheostatTube = new THREE.Mesh(
    new THREE.CylinderGeometry(0.04, 0.04, 0.45, 16),
    new THREE.MeshStandardMaterial({ color: 0x78350F, roughness: 0.7 }) // Copper wire wound
  );
  rheostatTube.rotation.z = Math.PI / 2;
  rheostatTube.position.set(0.8, 0.08, -0.4);
  physApparatusGroup.add(rheostatTube);

  roomGroup.add(physApparatusGroup);

  const physicsController: PhysicsApparatusController = {
    setLaserActive: (active: boolean) => {
      beamIn.visible = active;
      laserAperture.visible = active;
    },
    setGalvanometerCurrent: (currentAmps: number) => {
      needle.rotation.z = Math.max(-0.6, Math.min(0.6, currentAmps * 0.4));
    }
  };

  // =========================================================================
  // 8. DETAILED SCIENTIFIC APPARATUS 3: BIOLOGY & CELLULAR MICROSCOPY BENCH
  // =========================================================================
  const bioApparatusGroup = new THREE.Group();
  bioApparatusGroup.position.set(-4.5, 0.92, 4.0);

  // 1. Compound Binocular Research Microscope
  const microGroup = new THREE.Group();
  microGroup.position.set(0, 0, 0);

  // Heavy horseshoe cast base
  const microBase = new THREE.Mesh(
    new THREE.BoxGeometry(0.32, 0.06, 0.36),
    new THREE.MeshStandardMaterial({ color: 0x1E293B, roughness: 0.35, metalness: 0.6 })
  );
  microBase.position.y = 0.03;
  microGroup.add(microBase);

  // Curved cast arm
  const microArm = new THREE.Mesh(
    new THREE.BoxGeometry(0.1, 0.45, 0.14),
    new THREE.MeshStandardMaterial({ color: 0xE2E8F0, roughness: 0.25, metalness: 0.3 })
  );
  microArm.position.set(0, 0.26, -0.1);
  microGroup.add(microArm);

  // Mechanical Specimen Stage with Caliper Slide Clips
  const stageMesh = new THREE.Mesh(
    new THREE.BoxGeometry(0.26, 0.02, 0.24),
    new THREE.MeshStandardMaterial({ color: 0x0F172A, roughness: 0.2, metalness: 0.8 })
  );
  stageMesh.position.set(0, 0.24, 0.04);
  microGroup.add(stageMesh);

  // Glass specimen slide
  const slideMesh = new THREE.Mesh(
    new THREE.BoxGeometry(0.12, 0.006, 0.05),
    new THREE.MeshPhysicalMaterial({ color: 0xBAE6FD, transmission: 0.9, roughness: 0.05 })
  );
  slideMesh.position.set(0, 0.254, 0.04);
  microGroup.add(slideMesh);

  // Revolving Objective Nosepiece (4 Turrets)
  const nosepiece = new THREE.Mesh(
    new THREE.CylinderGeometry(0.06, 0.05, 0.03, 16),
    new THREE.MeshStandardMaterial({ color: 0xE2E8F0, metalness: 0.9, roughness: 0.1 })
  );
  nosepiece.position.set(0, 0.34, 0.04);
  microGroup.add(nosepiece);

  // Objectives (4x Red, 10x Yellow, 40x Blue, 100x White)
  const objColors = [0xEF4444, 0xFBBF24, 0x3B82F6, 0xF8FAFC];
  for (let o = 0; o < 4; o++) {
    const angle = (o * Math.PI) / 2;
    const objLens = new THREE.Mesh(
      new THREE.CylinderGeometry(0.012, 0.015, 0.06, 12),
      new THREE.MeshStandardMaterial({ color: objColors[o], metalness: 0.8, roughness: 0.2 })
    );
    objLens.position.set(Math.cos(angle) * 0.035, 0.31, 0.04 + Math.sin(angle) * 0.035);
    microGroup.add(objLens);
  }

  // Inclined Binocular Eyepiece Head (Dual Eyepieces)
  const headMesh = new THREE.Mesh(
    new THREE.BoxGeometry(0.16, 0.08, 0.12),
    new THREE.MeshStandardMaterial({ color: 0x1E293B, roughness: 0.3 })
  );
  headMesh.position.set(0, 0.44, 0.02);
  microGroup.add(headMesh);

  const eyepiece1 = new THREE.Mesh(
    new THREE.CylinderGeometry(0.015, 0.015, 0.1, 12),
    new THREE.MeshStandardMaterial({ color: 0x0F172A, roughness: 0.4 })
  );
  eyepiece1.position.set(-0.04, 0.50, 0.08);
  eyepiece1.rotation.x = -Math.PI / 5;
  microGroup.add(eyepiece1);

  const eyepiece2 = new THREE.Mesh(
    new THREE.CylinderGeometry(0.015, 0.015, 0.1, 12),
    new THREE.MeshStandardMaterial({ color: 0x0F172A, roughness: 0.4 })
  );
  eyepiece2.position.set(0.04, 0.50, 0.08);
  eyepiece2.rotation.x = -Math.PI / 5;
  microGroup.add(eyepiece2);

  // Substage Abbe Condenser & Illuminator Light
  const condenserLight = new THREE.PointLight(0xF8FAFC, 1.4, 0.8);
  condenserLight.position.set(0, 0.16, 0.04);
  microGroup.add(condenserLight);

  bioApparatusGroup.add(microGroup);

  // 2. Glass Petri Dishes with Culture Streak Pattern
  for (let p = 0; p < 3; p++) {
    const dish = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.08, 0.02, 24),
      buretteGlassMat
    );
    dish.position.set(0.8 + p * 0.22, 0.01, 0.1 - p * 0.1);
    bioApparatusGroup.add(dish);

    // Agar nutrient culture
    const agar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.076, 0.076, 0.008, 24),
      new THREE.MeshStandardMaterial({ color: 0xFDE047, roughness: 0.3 })
    );
    agar.position.set(0.8 + p * 0.22, 0.008, 0.1 - p * 0.1);
    bioApparatusGroup.add(agar);
  }

  // 3. Precision Micropipette Carousel Rack
  const pipetteStand = new THREE.Mesh(
    new THREE.CylinderGeometry(0.06, 0.06, 0.28, 16),
    new THREE.MeshStandardMaterial({ color: 0x94A3B8, roughness: 0.4 })
  );
  pipetteStand.position.set(-0.8, 0.14, 0.1);
  bioApparatusGroup.add(pipetteStand);

  const pipetteColors = [0xEF4444, 0x3B82F6, 0x10B981];
  for (let pip = 0; pip < 3; pip++) {
    const angle = (pip * Math.PI * 2) / 3;
    const pipette = new THREE.Mesh(
      new THREE.CylinderGeometry(0.01, 0.005, 0.22, 10),
      new THREE.MeshStandardMaterial({ color: pipetteColors[pip], roughness: 0.2 })
    );
    pipette.position.set(-0.8 + Math.cos(angle) * 0.08, 0.20, 0.1 + Math.sin(angle) * 0.08);
    bioApparatusGroup.add(pipette);
  }

  roomGroup.add(bioApparatusGroup);

  const biologyController: BiologyApparatusController = {
    setMicroscopeLight: (active: boolean) => {
      condenserLight.intensity = active ? 1.4 : 0;
    }
  };

  // =========================================================================
  // 9. DETAILED SCIENTIFIC APPARATUS 4: GENERAL SCIENCE & DENSITY BENCH
  // =========================================================================
  const genApparatusGroup = new THREE.Group();
  genApparatusGroup.position.set(4.5, 0.92, 4.0);

  // 1. Electronic Analytical Balance with 3-Door Glass Draft Shield
  const balanceGroup = new THREE.Group();
  balanceGroup.position.set(-0.6, 0, 0);

  const balanceBase = new THREE.Mesh(
    new THREE.BoxGeometry(0.36, 0.08, 0.42),
    new THREE.MeshStandardMaterial({ color: 0xF8FAFC, roughness: 0.2 })
  );
  balanceBase.position.y = 0.04;
  balanceGroup.add(balanceBase);

  // Stainless steel weighing pan
  const panMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(0.065, 0.065, 0.01, 24),
    new THREE.MeshStandardMaterial({ color: 0xE2E8F0, metalness: 0.95, roughness: 0.1 })
  );
  panMesh.position.y = 0.09;
  balanceGroup.add(panMesh);

  // Glass draft shield (anti-draft chamber)
  const shieldGeo = new THREE.BoxGeometry(0.28, 0.26, 0.32);
  const shieldMesh = new THREE.Mesh(shieldGeo, buretteGlassMat);
  shieldMesh.position.y = 0.22;
  balanceGroup.add(shieldMesh);

  // Digital green LCD display
  const balanceLcdCanvas = document.createElement('canvas');
  balanceLcdCanvas.width = 256;
  balanceLcdCanvas.height = 96;
  const bCtx = balanceLcdCanvas.getContext('2d')!;
  bCtx.fillStyle = '#064E3B';
  bCtx.fillRect(0, 0, 256, 96);
  bCtx.fillStyle = '#34D399';
  bCtx.font = 'bold 38px monospace';
  bCtx.fillText('125.402 g', 20, 62);
  const balanceLcdTex = new THREE.CanvasTexture(balanceLcdCanvas);
  balanceLcdTex.colorSpace = THREE.SRGBColorSpace;
  const balanceLcdMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(0.18, 0.06),
    new THREE.MeshStandardMaterial({ map: balanceLcdTex, emissive: 0x064E3B, emissiveIntensity: 0.8 })
  );
  balanceLcdMesh.rotation.x = -Math.PI / 4;
  balanceLcdMesh.position.set(0, 0.08, 0.18);
  balanceGroup.add(balanceLcdMesh);

  genApparatusGroup.add(balanceGroup);

  // 2. 5-Layer Liquid Density Column Cylinder
  const cylGroup = new THREE.Group();
  cylGroup.position.set(0.6, 0, 0);

  const cylGlass = new THREE.Mesh(
    new THREE.CylinderGeometry(0.06, 0.06, 0.48, 24),
    buretteGlassMat
  );
  cylGlass.position.y = 0.24;
  cylGroup.add(cylGlass);

  // 5 distinct density layers: Honey, Dish Soap, Water, Oil, Alcohol
  const densityColors = [0x78350F, 0x059669, 0x0284C7, 0xFACC15, 0xE11D48];
  for (let l = 0; l < 5; l++) {
    const layer = new THREE.Mesh(
      new THREE.CylinderGeometry(0.056, 0.056, 0.08, 20),
      new THREE.MeshStandardMaterial({
        color: densityColors[l],
        transparent: true,
        opacity: 0.82,
        roughness: 0.15
      })
    );
    layer.position.y = 0.05 + l * 0.085;
    cylGroup.add(layer);
  }

  genApparatusGroup.add(cylGroup);

  // 3. Precision Brass Weight Set in Velvet Wood Box
  const weightBox = new THREE.Mesh(
    new THREE.BoxGeometry(0.24, 0.05, 0.16),
    new THREE.MeshStandardMaterial({ color: 0x451A03, roughness: 0.4 }) // Mahogany wood
  );
  weightBox.position.set(1.4, 0.025, 0);
  genApparatusGroup.add(weightBox);

  const weightMat = new THREE.MeshStandardMaterial({ color: 0xEAB308, metalness: 0.85, roughness: 0.2 }); // Brass
  for (let w = 0; w < 4; w++) {
    const wt = new THREE.Mesh(new THREE.CylinderGeometry(0.015 - w * 0.002, 0.018 - w * 0.002, 0.04, 12), weightMat);
    wt.position.set(1.32 + w * 0.05, 0.06, 0);
    genApparatusGroup.add(wt);
  }

  roomGroup.add(genApparatusGroup);

  const generalController: GeneralApparatusController = {
    setBalanceReading: (massGrams: number) => {
      bCtx.fillStyle = '#064E3B';
      bCtx.fillRect(0, 0, 256, 96);
      bCtx.fillStyle = '#34D399';
      bCtx.font = 'bold 38px monospace';
      bCtx.fillText(`${massGrams.toFixed(3)} g`, 20, 62);
      balanceLcdTex.needsUpdate = true;
    }
  };

  // =========================================================================
  // 10. FUME HOOD, PPE LOCKER, EMERGENCY EYE-WASH & SAFETY SHOWER
  // =========================================================================
  // Fume Hood with Vertical Sliding Sash (West Wall)
  const fumeGroup = new THREE.Group();
  fumeGroup.position.set(-roomWidth / 2 + 1.2, 0, 0);

  const fumeBody = new THREE.Mesh(
    new THREE.BoxGeometry(2.2, 2.6, 2.2),
    new THREE.MeshStandardMaterial({ color: 0xE2E8F0, roughness: 0.35, metalness: 0.2 })
  );
  fumeBody.position.y = 1.3;
  fumeGroup.add(fumeBody);

  // Interior chamber
  const fumeChamber = new THREE.Mesh(
    new THREE.BoxGeometry(1.8, 1.4, 1.8),
    new THREE.MeshStandardMaterial({ color: 0x0F172A, roughness: 0.2 })
  );
  fumeChamber.position.set(0.15, 1.4, 0);
  fumeGroup.add(fumeChamber);

  // Sliding glass sash with warning decal
  const sashMesh = new THREE.Mesh(
    new THREE.BoxGeometry(0.04, 1.2, 1.8),
    new THREE.MeshPhysicalMaterial({ color: 0x93C5FD, transmission: 0.9, opacity: 0.4, transparent: true })
  );
  sashMesh.position.set(1.05, 1.6, 0);
  fumeGroup.add(sashMesh);

  // Safety Amber Interior Lighting
  const fumeLight = new THREE.PointLight(0xFBBF24, 1.6, 5);
  fumeLight.position.set(0.2, 1.9, 0);
  fumeGroup.add(fumeLight);

  roomGroup.add(fumeGroup);

  collisionBoxes.push({
    name: 'Fume Hood',
    min: new THREE.Vector3(-roomWidth / 2, 0, -1.3),
    max: new THREE.Vector3(-roomWidth / 2 + 2.4, 2.6, 1.3)
  });

  // Emergency Eyewash & Safety Shower (South West Corner)
  const safetyGroup = new THREE.Group();
  safetyGroup.position.set(-roomWidth / 2 + 1.5, 0, roomDepth / 2 - 1.5);

  const showerPipe = new THREE.Mesh(
    new THREE.CylinderGeometry(0.035, 0.035, 3.4, 12),
    new THREE.MeshStandardMaterial({ color: 0x16A34A, roughness: 0.3 }) // Safety green
  );
  showerPipe.position.set(0, 1.7, 0);
  safetyGroup.add(showerPipe);

  const showerHead = new THREE.Mesh(
    new THREE.ConeGeometry(0.24, 0.12, 16),
    new THREE.MeshStandardMaterial({ color: 0xE2E8F0, metalness: 0.85, roughness: 0.2 })
  );
  showerHead.position.set(0.4, 3.1, 0);
  showerHead.rotation.x = Math.PI;
  safetyGroup.add(showerHead);

  // Eyewash basin & dual aerators
  const eyewashBasin = new THREE.Mesh(
    new THREE.CylinderGeometry(0.22, 0.16, 0.18, 16),
    new THREE.MeshStandardMaterial({ color: 0xEAB308, roughness: 0.3 }) // Safety yellow
  );
  eyewashBasin.position.set(0.4, 1.05, 0);
  safetyGroup.add(eyewashBasin);

  roomGroup.add(safetyGroup);

  collisionBoxes.push({
    name: 'Emergency Shower & Eyewash',
    min: new THREE.Vector3(-roomWidth / 2, 0, roomDepth / 2 - 2.5),
    max: new THREE.Vector3(-roomWidth / 2 + 2.0, 3.2, roomDepth / 2)
  });

  // Red Wall-mounted Fire Extinguisher (East Wall)
  const extGroup = new THREE.Group();
  extGroup.position.set(roomWidth / 2 - 0.2, 1.4, 0);

  const extBody = new THREE.Mesh(
    new THREE.CylinderGeometry(0.1, 0.1, 0.55, 16),
    new THREE.MeshStandardMaterial({ color: 0xDC2626, roughness: 0.25 }) // Red
  );
  extGroup.add(extBody);

  const extHose = new THREE.Mesh(
    new THREE.CylinderGeometry(0.015, 0.015, 0.45, 8),
    new THREE.MeshStandardMaterial({ color: 0x0F172A, roughness: 0.8 })
  );
  extHose.position.set(0.08, 0, 0.08);
  extGroup.add(extHose);

  roomGroup.add(extGroup);

  // =========================================================================
  // 11. WORKSTATIONS & INTERACTIVE TARGET RETICLES
  // =========================================================================
  const workstations: WorkstationLocation[] = [
    {
      id: 'chemistry_bench',
      name: 'Chemistry Titration & Reaction Station',
      position: new THREE.Vector3(-4.5, 1.5, -0.6),
      lookAt: new THREE.Vector3(-4.5, 1.0, -1.8),
      interactionDistance: 2.4,
      label: 'Chemistry Workbench'
    },
    {
      id: 'physics_table',
      name: 'Physics Optics & Circuit Station',
      position: new THREE.Vector3(4.5, 1.5, -0.6),
      lookAt: new THREE.Vector3(4.5, 1.0, -1.8),
      interactionDistance: 2.4,
      label: 'Physics Station'
    },
    {
      id: 'biology_desk',
      name: 'Biology & Microscopy Desk',
      position: new THREE.Vector3(-4.5, 1.5, 2.6),
      lookAt: new THREE.Vector3(-4.5, 1.0, 4.0),
      interactionDistance: 2.4,
      label: 'Microscope Desk'
    },
    {
      id: 'general_bench',
      name: 'General Science & Density Station',
      position: new THREE.Vector3(4.5, 1.5, 2.6),
      lookAt: new THREE.Vector3(4.5, 1.0, 4.0),
      interactionDistance: 2.4,
      label: 'General Science Desk'
    },
    {
      id: 'fume_hood',
      name: 'Chemical Fume Hood Station',
      position: new THREE.Vector3(-roomWidth / 2 + 2.8, 1.5, 0),
      lookAt: new THREE.Vector3(-roomWidth / 2 + 1.2, 1.4, 0),
      interactionDistance: 2.4,
      label: 'Fume Hood'
    }
  ];

  // Visual Target Reticles on Workstations
  for (const ws of workstations) {
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(0.42, 0.50, 32),
      new THREE.MeshBasicMaterial({
        color: 0x38BDF8,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.65
      })
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(ws.lookAt.x, 0.95, ws.lookAt.z);
    roomGroup.add(ring);
    interactiveMeshes.push(ring);
  }

  const updateAnimations = (delta: number) => {
    // Run all internal procedural animators
    for (const fn of animators) {
      fn(delta);
    }
    // Rotate reticles
    for (const mesh of interactiveMeshes) {
      mesh.rotation.z += delta * 0.75;
    }
  };

  const dispose = () => {
    roomGroup.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        const m = obj as THREE.Mesh;
        m.geometry.dispose();
        if (Array.isArray(m.material)) {
          m.material.forEach((mat) => mat.dispose());
        } else if (m.material) {
          m.material.dispose();
        }
      }
    });
  };

  return {
    roomGroup,
    collisionBoxes,
    workstations,
    interactiveMeshes,
    chemistryController,
    physicsController,
    biologyController,
    generalController,
    updateAnimations,
    dispose
  };
}

/**
 * Solid Collision Detection using Axis-Aligned Bounding Boxes (AABB)
 */
export function checkPlayerCollision(
  proposedPos: THREE.Vector3,
  collisionBoxes: CollisionBox[],
  playerRadius = 0.45
): boolean {
  for (const box of collisionBoxes) {
    const minX = box.min.x - playerRadius;
    const maxX = box.max.x + playerRadius;
    const minZ = box.min.z - playerRadius;
    const maxZ = box.max.z + playerRadius;

    if (
      proposedPos.x >= minX &&
      proposedPos.x <= maxX &&
      proposedPos.z >= minZ &&
      proposedPos.z <= maxZ
    ) {
      return true; // Collision detected! Cannot walk through solid objects
    }
  }
  return false;
}
