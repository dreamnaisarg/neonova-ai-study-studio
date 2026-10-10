import * as THREE from 'three';

/**
 * Creates anatomically shaped ventricular myocardium with apex taper
 */
export function createVentricularMyocardiumGeometry(
  radiusX: number = 1.3,
  radiusY: number = 1.7,
  radiusZ: number = 1.1,
  isLeftVentricle: boolean = true
): THREE.BufferGeometry {
  const seg = 36;
  const geometry = new THREE.SphereGeometry(1, seg, seg);
  const pos = geometry.attributes.position;
  const v = new THREE.Vector3();

  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    // Apex tapering towards inferior cardiac point
    const yNorm = (v.y + 1) / 2; // 0 at bottom apex, 1 at top base
    const apexTaper = 0.35 + 0.65 * yNorm;
    
    v.x *= radiusX * apexTaper;
    v.y *= radiusY;
    v.z *= radiusZ * apexTaper;

    // Slight anatomical anterior curvature of apex
    if (v.y < -0.2) {
      v.z += (Math.abs(v.y) - 0.2) * 0.35;
    }

    // Left ventricle is thicker and more conical; right ventricle wraps crescent-like
    if (!isLeftVentricle) {
      v.x -= Math.sin(v.y * 2) * 0.15;
    }

    pos.setXYZ(i, v.x, v.y, v.z);
  }

  geometry.computeVertexNormals();
  return geometry;
}

/**
 * Creates the aortic arch with ascending trunk, arch, and 3 brachiocephalic branches
 */
export function createAorticArchGroup(material: THREE.Material): THREE.Group {
  const group = new THREE.Group();

  // 1. Main Aortic Arch Tube
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.0, -0.6, 0.1),  // Aortic root at aortic valve
    new THREE.Vector3(0.15, 0.4, 0.12), // Ascending aorta
    new THREE.Vector3(0.0, 1.1, 0.0),   // Peak of aortic arch
    new THREE.Vector3(-0.45, 0.9, -0.3),// Arch turn posterior-left
    new THREE.Vector3(-0.55, -0.8, -0.45)// Descending thoracic aorta
  ]);

  const mainTubeGeo = new THREE.TubeGeometry(curve, 48, 0.32, 24, false);
  const mainTube = new THREE.Mesh(mainTubeGeo, material);
  group.add(mainTube);

  // 2. Three Great Branching Arterial Trunks
  const branchConfigs = [
    { start: new THREE.Vector3(0.05, 1.05, 0.05), end: new THREE.Vector3(0.25, 1.6, 0.08), radius: 0.14 }, // Brachiocephalic
    { start: new THREE.Vector3(-0.15, 1.08, -0.05), end: new THREE.Vector3(-0.05, 1.65, -0.05), radius: 0.11 }, // Left Common Carotid
    { start: new THREE.Vector3(-0.32, 1.0, -0.18), end: new THREE.Vector3(-0.25, 1.55, -0.18), radius: 0.10 }  // Left Subclavian
  ];

  branchConfigs.forEach(b => {
    const branchCurve = new THREE.CatmullRomCurve3([b.start, b.end]);
    const branchGeo = new THREE.TubeGeometry(branchCurve, 16, b.radius, 16, false);
    const branchMesh = new THREE.Mesh(branchGeo, material);
    group.add(branchMesh);
  });

  return group;
}

/**
 * Creates the pulmonary trunk splitting into left and right pulmonary arteries
 */
export function createPulmonaryTrunkGroup(material: THREE.Material): THREE.Group {
  const group = new THREE.Group();

  // Ascending Pulmonary Trunk
  const mainCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.25, -0.4, 0.4),
    new THREE.Vector3(-0.15, 0.4, 0.35),
    new THREE.Vector3(0.0, 0.75, 0.15) // Bifurcation point under aortic arch
  ]);
  const mainGeo = new THREE.TubeGeometry(mainCurve, 24, 0.28, 20, false);
  group.add(new THREE.Mesh(mainGeo, material));

  // Right Pulmonary Artery (courses rightward under aortic arch)
  const rightCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.0, 0.75, 0.15),
    new THREE.Vector3(0.65, 0.7, -0.1),
    new THREE.Vector3(1.1, 0.65, -0.3)
  ]);
  const rightGeo = new THREE.TubeGeometry(rightCurve, 16, 0.2, 16, false);
  group.add(new THREE.Mesh(rightGeo, material));

  // Left Pulmonary Artery (courses to left lung)
  const leftCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.0, 0.75, 0.15),
    new THREE.Vector3(-0.65, 0.75, -0.05),
    new THREE.Vector3(-1.0, 0.7, -0.25)
  ]);
  const leftGeo = new THREE.TubeGeometry(leftCurve, 16, 0.19, 16, false);
  group.add(new THREE.Mesh(leftGeo, material));

  return group;
}

/**
 * Creates convoluted cerebral hemisphere with undulating gyri and sulci
 */
export function createCerebralLobeGeometry(
  scaleX: number = 1.4,
  scaleY: number = 1.1,
  scaleZ: number = 1.8,
  isLeftHemisphere: boolean = true
): THREE.BufferGeometry {
  const seg = 48;
  const geometry = new THREE.SphereGeometry(1, seg, seg);
  const pos = geometry.attributes.position;
  const v = new THREE.Vector3();

  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);

    // Flatten medial interhemispheric fissure surface
    const medialSide = isLeftHemisphere ? (v.x < 0) : (v.x > 0);
    if (medialSide) {
      v.x *= 0.35;
    }

    // Physiological gyrus folding harmonics
    const gyriNoise = 
      Math.sin(v.x * 9) * Math.cos(v.y * 11) * 0.05 + 
      Math.cos(v.z * 8) * Math.sin(v.y * 7) * 0.04;

    const r = 1.0 + gyriNoise;
    v.x *= scaleX * r;
    v.y *= scaleY * r;
    v.z *= scaleZ * r;

    // Temporal lobe downward anterior curve
    if (v.z > 0.1 && v.y < 0) {
      v.y -= 0.18 * (1 - Math.abs(v.x));
    }

    pos.setXYZ(i, v.x, v.y, v.z);
  }

  geometry.computeVertexNormals();
  return geometry;
}

/**
 * Creates trachea airway with prominent cartilaginous C-rings and carina bifurcation
 */
export function createTracheaRingsGroup(
  cartilageMat: THREE.Material,
  mucosaMat: THREE.Material
): THREE.Group {
  const group = new THREE.Group();

  // Internal smooth mucosal tube
  const innerTubeGeo = new THREE.CylinderGeometry(0.3, 0.3, 3.2, 24);
  const innerTube = new THREE.Mesh(innerTubeGeo, mucosaMat);
  group.add(innerTube);

  // 14 prominent anterior cartilaginous C-rings (deficient posteriorly for esophagus)
  const ringCount = 14;
  const step = 2.8 / ringCount;
  for (let r = 0; r < ringCount; r++) {
    const y = -1.3 + r * step;
    const ringGeo = new THREE.TorusGeometry(0.34, 0.045, 12, 28, Math.PI * 1.5);
    ringGeo.rotateX(Math.PI / 2);
    ringGeo.rotateZ(Math.PI * 0.25);
    const ringMesh = new THREE.Mesh(ringGeo, cartilageMat);
    ringMesh.position.y = y;
    group.add(ringMesh);
  }

  // Carina and left/right primary bronchi
  const rightBronchusCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, -1.6, 0),
    new THREE.Vector3(0.5, -2.1, -0.1),
    new THREE.Vector3(1.1, -2.5, -0.2)
  ]);
  const rightBronchusGeo = new THREE.TubeGeometry(rightBronchusCurve, 16, 0.22, 16, false);
  group.add(new THREE.Mesh(rightBronchusGeo, cartilageMat));

  const leftBronchusCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, -1.6, 0),
    new THREE.Vector3(-0.6, -2.0, -0.15),
    new THREE.Vector3(-1.3, -2.4, -0.25)
  ]);
  const leftBronchusGeo = new THREE.TubeGeometry(leftBronchusCurve, 16, 0.2, 16, false);
  group.add(new THREE.Mesh(leftBronchusGeo, cartilageMat));

  return group;
}

/**
 * Creates anatomical lung lobe with concave diaphragmatic base and cardiac notch
 */
export function createLungLobeGeometry(
  width: number = 1.6,
  height: number = 2.8,
  depth: number = 1.8,
  isLeftLung: boolean = false
): THREE.BufferGeometry {
  const seg = 36;
  const geometry = new THREE.SphereGeometry(1, seg, seg);
  const pos = geometry.attributes.position;
  const v = new THREE.Vector3();

  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);

    // Superior apex narrowing
    const apexFactor = 0.5 + 0.5 * (1 - v.y);
    v.x *= width * apexFactor;
    v.y *= height * 0.5;
    v.z *= depth * apexFactor;

    // Concave inferior diaphragmatic base
    if (v.y < -0.8) {
      v.y += Math.sin((v.x / width) * Math.PI) * 0.25;
    }

    // Medial surface indentation (Cardiac impression notch on left lung)
    if (isLeftLung && v.x > -0.2 && v.y < 0.2 && v.y > -0.6 && v.z > -0.2) {
      v.x -= 0.35; // Distinct anatomical cardiac notch
    }

    pos.setXYZ(i, v.x, v.y, v.z);
  }

  geometry.computeVertexNormals();
  return geometry;
}

/**
 * Creates human eye globe with cornea dome, lens, iris, and optic nerve stump
 */
export function createHumanEyeGroup(
  scleraMat: THREE.Material,
  corneaMat: THREE.Material,
  irisMat: THREE.Material,
  lensMat: THREE.Material,
  nerveMat: THREE.Material
): THREE.Group {
  const group = new THREE.Group();

  // 1. Sclera White Globe
  const scleraGeo = new THREE.SphereGeometry(1.2, 36, 36);
  const scleraMesh = new THREE.Mesh(scleraGeo, scleraMat);
  group.add(scleraMesh);

  // 2. Anterior Clear Cornea Dome
  const corneaGeo = new THREE.SphereGeometry(0.72, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.45);
  corneaGeo.rotateX(Math.PI / 2);
  const corneaMesh = new THREE.Mesh(corneaGeo, corneaMat);
  corneaMesh.position.z = 1.05;
  group.add(corneaMesh);

  // 3. Colored Iris Ring & Pupil
  const irisGeo = new THREE.RingGeometry(0.22, 0.65, 32);
  const irisMesh = new THREE.Mesh(irisGeo, irisMat);
  irisMesh.position.z = 0.98;
  group.add(irisMesh);

  // 4. Biconvex Crystalline Lens
  const lensGeo = new THREE.SphereGeometry(0.48, 24, 24);
  lensGeo.scale(1.0, 1.0, 0.45);
  const lensMesh = new THREE.Mesh(lensGeo, lensMat);
  lensMesh.position.z = 0.82;
  group.add(lensMesh);

  // 5. Posterior Optic Nerve Trunk
  const nerveGeo = new THREE.CylinderGeometry(0.18, 0.22, 1.2, 16);
  nerveGeo.rotateX(Math.PI / 2);
  const nerveMesh = new THREE.Mesh(nerveGeo, nerveMat);
  nerveMesh.position.set(-0.2, 0, -1.6);
  group.add(nerveMesh);

  return group;
}

/**
 * Creates renal kidney bean form with concave hilum and renal pelvis
 */
export function createRenalKidneyGeometry(
  length: number = 2.4,
  width: number = 1.5,
  thickness: number = 1.0
): THREE.BufferGeometry {
  const seg = 36;
  const geometry = new THREE.SphereGeometry(1, seg, seg);
  const pos = geometry.attributes.position;
  const v = new THREE.Vector3();

  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);

    v.x *= width * 0.5;
    v.y *= length * 0.5;
    v.z *= thickness * 0.5;

    // Concave medial renal hilum notch
    if (v.x < 0.2 && Math.abs(v.y) < 0.6) {
      v.x += 0.35 * Math.cos((v.y / 0.6) * (Math.PI / 2));
    }

    pos.setXYZ(i, v.x, v.y, v.z);
  }

  geometry.computeVertexNormals();
  return geometry;
}

/**
 * Creates multipolar neuron with soma, radiating dendrites, myelinated axon, and terminals
 */
export function createNeuronGroup(
  somaMat: THREE.Material,
  myelinMat: THREE.Material,
  axonMat: THREE.Material
): THREE.Group {
  const group = new THREE.Group();

  // 1. Star-like Soma with Nucleus
  const somaGeo = new THREE.SphereGeometry(0.65, 24, 24);
  const somaMesh = new THREE.Mesh(somaGeo, somaMat);
  group.add(somaMesh);

  // 2. Radiating Dendrite Branches
  for (let d = 0; d < 7; d++) {
    const ang = (d * Math.PI * 2) / 7;
    const dendriteCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(Math.cos(ang) * 0.5, Math.sin(ang) * 0.5, 0),
      new THREE.Vector3(Math.cos(ang) * 1.1 + (Math.random() - 0.5) * 0.3, Math.sin(ang) * 1.1 + (Math.random() - 0.5) * 0.3, (Math.random() - 0.5) * 0.3),
      new THREE.Vector3(Math.cos(ang) * 1.8, Math.sin(ang) * 1.8, (Math.random() - 0.5) * 0.5)
    ]);
    const dendriteGeo = new THREE.TubeGeometry(dendriteCurve, 12, 0.06, 8, false);
    group.add(new THREE.Mesh(dendriteGeo, somaMat));
  }

  // 3. Long Axon with Segmented Myelin Sheaths and Nodes of Ranvier
  const axonCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, -0.6, 0),
    new THREE.Vector3(0, -2.0, 0.1),
    new THREE.Vector3(0, -3.8, -0.1),
    new THREE.Vector3(0, -5.2, 0)
  ]);
  const axonGeo = new THREE.TubeGeometry(axonCurve, 32, 0.05, 8, false);
  group.add(new THREE.Mesh(axonGeo, axonMat));

  // 4 Myelin Sheath Cylinders with gaps (Nodes of Ranvier)
  for (let m = 0; m < 4; m++) {
    const yCenter = -1.2 - m * 1.1;
    const sheathGeo = new THREE.CylinderGeometry(0.14, 0.14, 0.85, 16);
    const sheathMesh = new THREE.Mesh(sheathGeo, myelinMat);
    sheathMesh.position.set(0, yCenter, 0);
    group.add(sheathMesh);
  }

  return group;
}

/**
 * Creates B-DNA antiparallel double helix with major/minor grooves and base pairs
 */
export function createDNADoubleHelixGroup(
  backboneMat: THREE.Material,
  adenineMat: THREE.Material,
  thymineMat: THREE.Material,
  guanineMat: THREE.Material,
  cytosineMat: THREE.Material
): THREE.Group {
  const group = new THREE.Group();

  const totalTurns = 2.5;
  const height = 6.0;
  const radius = 0.95;
  const steps = 40;

  const strand1Pts: THREE.Vector3[] = [];
  const strand2Pts: THREE.Vector3[] = [];

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const y = -height / 2 + t * height;
    const theta = t * totalTurns * Math.PI * 2;

    const p1 = new THREE.Vector3(Math.cos(theta) * radius, y, Math.sin(theta) * radius);
    const p2 = new THREE.Vector3(Math.cos(theta + Math.PI) * radius, y, Math.sin(theta + Math.PI) * radius);

    strand1Pts.push(p1);
    strand2Pts.push(p2);

    // Complementary Base Pair Rung across the center
    if (i % 2 === 0) {
      const isAT = (i / 2) % 2 === 0;
      const rungCurve = new THREE.CatmullRomCurve3([p1, p2]);
      const rungGeo = new THREE.TubeGeometry(rungCurve, 8, 0.065, 8, false);
      const rungMesh = new THREE.Mesh(rungGeo, isAT ? adenineMat : guanineMat);
      group.add(rungMesh);
    }
  }

  // Strand 1 Backbone
  const strand1Curve = new THREE.CatmullRomCurve3(strand1Pts);
  const strand1Geo = new THREE.TubeGeometry(strand1Curve, 64, 0.12, 12, false);
  group.add(new THREE.Mesh(strand1Geo, backboneMat));

  // Strand 2 Backbone
  const strand2Curve = new THREE.CatmullRomCurve3(strand2Pts);
  const strand2Geo = new THREE.TubeGeometry(strand2Curve, 64, 0.12, 12, false);
  group.add(new THREE.Mesh(strand2Geo, backboneMat));

  return group;
}
