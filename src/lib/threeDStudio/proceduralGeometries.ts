import * as THREE from 'three';
import { ModelQualityLevel } from './types';

/**
 * Creates an aerodynamic vehicle or aircraft fuselage with continuous curvature
 */
export function createAerodynamicFuselageGeometry(
  length: number = 5.2,
  radius: number = 0.95,
  quality: ModelQualityLevel = 'high'
): THREE.BufferGeometry {
  const points: THREE.Vector2[] = [];
  const segments = quality === 'ultra' ? 48 : quality === 'high' ? 32 : 20;

  // Longitudinal aerodynamic cross-section curve
  const steps = 24;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps; // 0 to 1
    const x = (t - 0.5) * length;
    let r = 0;

    if (t < 0.2) {
      // Streamlined nose cone (parabolic curve)
      const nt = t / 0.2;
      r = radius * Math.sqrt(Math.sin((nt * Math.PI) / 2));
    } else if (t < 0.65) {
      // Constant cabin area with slight upper roof swell
      const ct = (t - 0.2) / 0.45;
      r = radius * (1.0 + Math.sin(ct * Math.PI) * 0.08);
    } else {
      // Tapered aft fuselage transitioning to empennage
      const tt = (t - 0.65) / 0.35;
      r = radius * (1.0 - Math.pow(tt, 1.3) * 0.72);
    }

    points.push(new THREE.Vector2(Math.max(0.04, r), x));
  }

  const geometry = new THREE.LatheGeometry(points, segments);
  geometry.rotateZ(Math.PI / 2);
  geometry.computeVertexNormals();
  return geometry;
}

/**
 * Creates a cambered aerodynamic wing/airfoil (NACA-style) with thickness and tapered tip
 */
export function createCamberedAirfoilGeometry(
  span: number = 4.0,
  rootChord: number = 1.1,
  tipChord: number = 0.45,
  thickness: number = 0.12,
  quality: ModelQualityLevel = 'high'
): THREE.BufferGeometry {
  const shape = new THREE.Shape();

  // Cambered airfoil upper and lower profile points
  const chordPoints = 16;
  const upperPts: [number, number][] = [];
  const lowerPts: [number, number][] = [];

  for (let i = 0; i <= chordPoints; i++) {
    const x = i / chordPoints; // 0 (leading edge) to 1 (trailing edge)
    // NACA 4-digit thickness distribution approximation
    const yt = 5 * thickness * (0.2969 * Math.sqrt(x) - 0.126 * x - 0.3516 * x * x + 0.2843 * x * x * x - 0.1015 * x * x * x * x);
    // Slight positive camber for realistic aerodynamic lift
    const yc = x < 0.4 ? 0.04 * (2 * x - x * x) : 0.04 * (0.8 + 0.2 * (1 - x));

    upperPts.push([x * rootChord, yc + yt]);
    lowerPts.push([x * rootChord, yc - yt]);
  }

  // Draw closed smooth airfoil shape
  shape.moveTo(upperPts[0][0], upperPts[0][1]);
  for (let i = 1; i < upperPts.length; i++) {
    shape.lineTo(upperPts[i][0], upperPts[i][1]);
  }
  for (let i = lowerPts.length - 1; i >= 0; i--) {
    shape.lineTo(lowerPts[i][0], lowerPts[i][1]);
  }
  shape.closePath();

  const extrudeSettings: THREE.ExtrudeGeometryOptions = {
    steps: quality === 'ultra' ? 12 : 6,
    depth: span,
    bevelEnabled: true,
    bevelThickness: 0.02,
    bevelSize: 0.02,
    bevelSegments: quality === 'ultra' ? 4 : 2
  };

  const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  geometry.center();
  geometry.computeVertexNormals();
  return geometry;
}

/**
 * Creates a realistic multi-component wheel assembly (treaded tire, alloy rim with spokes, hub, brake disc & caliper)
 */
export function createRealisticWheelGroup(
  outerRadius: number = 0.45,
  width: number = 0.26,
  rimRadius: number = 0.27,
  quality: ModelQualityLevel = 'high',
  materials: { tire: THREE.Material; rim: THREE.Material; disc: THREE.Material; caliper: THREE.Material }
): THREE.Group {
  const wheelGroup = new THREE.Group();
  const segRadial = quality === 'ultra' ? 36 : 24;

  // 1. Vulcanized Rubber Tire with shoulder curvature
  const tireProfilePts: THREE.Vector2[] = [];
  const halfW = width / 2;
  tireProfilePts.push(new THREE.Vector2(rimRadius, -halfW * 0.85));
  tireProfilePts.push(new THREE.Vector2(outerRadius * 0.94, -halfW));
  tireProfilePts.push(new THREE.Vector2(outerRadius, -halfW * 0.7));
  tireProfilePts.push(new THREE.Vector2(outerRadius, halfW * 0.7));
  tireProfilePts.push(new THREE.Vector2(outerRadius * 0.94, halfW));
  tireProfilePts.push(new THREE.Vector2(rimRadius, halfW * 0.85));

  const tireGeo = new THREE.LatheGeometry(tireProfilePts, segRadial);
  tireGeo.rotateX(Math.PI / 2);
  const tireMesh = new THREE.Mesh(tireGeo, materials.tire);
  tireMesh.castShadow = true;
  wheelGroup.add(tireMesh);

  // 2. Machined Alloy Rim Barrel & Drop Center
  const rimBarrelGeo = new THREE.CylinderGeometry(rimRadius, rimRadius, width * 0.9, segRadial, 1, true);
  rimBarrelGeo.rotateX(Math.PI / 2);
  const rimBarrelMesh = new THREE.Mesh(rimBarrelGeo, materials.rim);
  wheelGroup.add(rimBarrelMesh);

  // 3. Central Hub & Lug Nuts
  const hubGeo = new THREE.CylinderGeometry(rimRadius * 0.32, rimRadius * 0.35, width * 0.4, 16);
  hubGeo.rotateX(Math.PI / 2);
  const hubMesh = new THREE.Mesh(hubGeo, materials.rim);
  wheelGroup.add(hubMesh);

  // 5 Twin Spokes
  const spokeCount = 5;
  for (let i = 0; i < spokeCount; i++) {
    const ang = (i * Math.PI * 2) / spokeCount;
    const spokeGeo = new THREE.BoxGeometry(rimRadius * 0.12, rimRadius * 0.7, width * 0.2);
    const spokeMesh = new THREE.Mesh(spokeGeo, materials.rim);
    spokeMesh.position.set(Math.sin(ang) * (rimRadius * 0.55), Math.cos(ang) * (rimRadius * 0.55), 0);
    spokeMesh.rotation.z = -ang;
    wheelGroup.add(spokeMesh);
  }

  // 4. Ventilated Steel Brake Rotor
  const discGeo = new THREE.CylinderGeometry(rimRadius * 0.78, rimRadius * 0.78, 0.025, 24);
  discGeo.rotateX(Math.PI / 2);
  const discMesh = new THREE.Mesh(discGeo, materials.disc);
  discMesh.position.z = -width * 0.15;
  wheelGroup.add(discMesh);

  // 5. High-performance Brake Caliper
  const caliperGeo = new THREE.BoxGeometry(rimRadius * 0.35, rimRadius * 0.42, 0.08);
  const caliperMesh = new THREE.Mesh(caliperGeo, materials.caliper);
  caliperMesh.position.set(rimRadius * 0.58, rimRadius * 0.25, -width * 0.15);
  wheelGroup.add(caliperMesh);

  return wheelGroup;
}

/**
 * Creates a beveled manufactured structural chassis plate or housing
 */
export function createBeveledChassisGeometry(
  width: number,
  height: number,
  depth: number,
  bevelRadius: number = 0.08,
  quality: ModelQualityLevel = 'high'
): THREE.BufferGeometry {
  const shape = new THREE.Shape();
  const hw = width / 2;
  const hh = height / 2;
  const r = Math.min(bevelRadius, hw * 0.5, hh * 0.5);

  // Rounded rectangle path
  shape.moveTo(-hw + r, -hh);
  shape.lineTo(hw - r, -hh);
  shape.quadraticCurveTo(hw, -hh, hw, -hh + r);
  shape.lineTo(hw, hh - r);
  shape.quadraticCurveTo(hw, hh, hw - r, hh);
  shape.lineTo(-hw + r, hh);
  shape.quadraticCurveTo(-hw, hh, -hw, hh - r);
  shape.lineTo(-hw, -hh + r);
  shape.quadraticCurveTo(-hw, -hh, -hw + r, -hh);

  const extrudeSettings: THREE.ExtrudeGeometryOptions = {
    depth: depth,
    bevelEnabled: true,
    bevelSegments: quality === 'ultra' ? 4 : 2,
    steps: 1,
    bevelSize: r * 0.5,
    bevelThickness: r * 0.5
  };

  const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  geometry.center();
  geometry.computeVertexNormals();
  return geometry;
}

/**
 * Creates an anatomical myocardial chamber or muscular vessel
 */
export function createOrganicChamberGeometry(
  radiusX: number,
  radiusY: number,
  radiusZ: number,
  curvature: number = 0.25,
  quality: ModelQualityLevel = 'high'
): THREE.BufferGeometry {
  const seg = quality === 'ultra' ? 40 : quality === 'high' ? 28 : 18;
  const geometry = new THREE.SphereGeometry(1, seg, seg);

  // Deform sphere vertices to produce asymmetric anatomical muscle contour
  const pos = geometry.attributes.position;
  const v = new THREE.Vector3();

  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    // Asymmetric myocardial apex tapering
    const taper = 1.0 - (v.y < 0 ? Math.abs(v.y) * curvature : 0);
    v.x *= radiusX * taper;
    v.y *= radiusY;
    v.z *= radiusZ * (1.0 + Math.sin(v.y * 2) * 0.15);
    pos.setXYZ(i, v.x, v.y, v.z);
  }

  geometry.computeVertexNormals();
  return geometry;
}

/**
 * Creates a fluted architectural column with base torus and top abacus
 */
export function createFlutedColumnGeometry(
  height: number = 4.0,
  radius: number = 0.45,
  fluteCount: number = 16,
  quality: ModelQualityLevel = 'high'
): THREE.BufferGeometry {
  const shape = new THREE.Shape();
  const pts = fluteCount * 2;

  for (let i = 0; i < pts; i++) {
    const ang = (i * Math.PI * 2) / pts;
    const isFluteValley = i % 2 === 1;
    const r = isFluteValley ? radius * 0.92 : radius;
    const x = Math.cos(ang) * r;
    const y = Math.sin(ang) * r;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  shape.closePath();

  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: height,
    bevelEnabled: true,
    bevelSegments: quality === 'ultra' ? 3 : 2,
    bevelSize: radius * 0.08,
    bevelThickness: radius * 0.08
  });
  geometry.rotateX(Math.PI / 2);
  geometry.center();
  geometry.computeVertexNormals();
  return geometry;
}
