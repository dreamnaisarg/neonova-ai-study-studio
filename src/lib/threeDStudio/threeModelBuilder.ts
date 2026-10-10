import * as THREE from 'three';
import { 
  EducationalStructuralPlan, 
  ModelComponentDefinition, 
  ModelQualityLevel, 
  PBRMaterialType,
  ComponentMovement
} from './types';
import { getProceduralTexture } from './proceduralTextures';
import {
  createAerodynamicFuselageGeometry,
  createCamberedAirfoilGeometry,
  createRealisticWheelGroup,
  createBeveledChassisGeometry,
  createOrganicChamberGeometry,
  createFlutedColumnGeometry
} from './proceduralGeometries';
import { validateModelRealism } from './modelRealismValidator';

export interface BuiltModelResult {
  rootGroup: THREE.Group;
  partsMap: Map<string, THREE.Object3D>;
  initialPositions: Map<string, THREE.Vector3>;
  explodeVectors: Map<string, THREE.Vector3>;
  animatedParts: { object: THREE.Object3D; movement: ComponentMovement }[];
  validationReport: ReturnType<typeof validateModelRealism>;
}

/**
 * Creates a physically based Three.js material adhering to real optical principles
 */
export function createPBRMaterial(
  type: PBRMaterialType,
  color: number,
  roughness: number = 0.3,
  metalness: number = 0.5,
  quality: ModelQualityLevel = 'high',
  options?: {
    clearcoat?: number;
    transmission?: number;
    opacity?: number;
    texturePattern?: any;
  }
): THREE.Material {
  const isUltra = quality === 'ultra';
  const texture = options?.texturePattern ? getProceduralTexture(options.texturePattern) : null;

  switch (type) {
    case 'painted_metal':
      return new THREE.MeshPhysicalMaterial({
        color,
        roughness: Math.max(0.08, roughness),
        metalness: Math.min(0.45, metalness),
        clearcoat: options?.clearcoat ?? (isUltra ? 0.9 : 0.6),
        clearcoatRoughness: 0.1,
        roughnessMap: texture || undefined,
        bumpMap: texture || undefined,
        bumpScale: 0.02
      });

    case 'bare_metal':
    case 'brushed_metal':
      return new THREE.MeshStandardMaterial({
        color,
        roughness: roughness,
        metalness: Math.max(0.85, metalness),
        roughnessMap: texture || undefined,
        bumpMap: texture || undefined,
        bumpScale: 0.03
      });

    case 'polished_metal':
      return new THREE.MeshPhysicalMaterial({
        color,
        roughness: 0.06,
        metalness: 0.98,
        clearcoat: 1.0,
        clearcoatRoughness: 0.02
      });

    case 'glass':
      return new THREE.MeshPhysicalMaterial({
        color,
        roughness: 0.04,
        metalness: 0.05,
        transmission: options?.transmission ?? (isUltra ? 0.94 : 0.85),
        transparent: true,
        opacity: options?.opacity ?? 0.65,
        ior: 1.52,
        clearcoat: 1.0,
        clearcoatRoughness: 0.02
      });

    case 'transparent_plastic':
      return new THREE.MeshPhysicalMaterial({
        color,
        roughness: 0.12,
        metalness: 0.02,
        transmission: 0.78,
        transparent: true,
        opacity: 0.75,
        ior: 1.46
      });

    case 'rubber':
      return new THREE.MeshStandardMaterial({
        color: 0x18181b,
        roughness: 0.92,
        metalness: 0.02,
        roughnessMap: texture || undefined,
        bumpMap: texture || undefined,
        bumpScale: 0.05
      });

    case 'carbon_fiber':
      return new THREE.MeshPhysicalMaterial({
        color: 0x18181b,
        roughness: 0.32,
        metalness: 0.45,
        clearcoat: 0.85,
        clearcoatRoughness: 0.12,
        bumpMap: texture || undefined,
        bumpScale: 0.04
      });

    case 'ceramic':
      return new THREE.MeshPhysicalMaterial({
        color,
        roughness: 0.15,
        metalness: 0.04,
        clearcoat: 0.95,
        clearcoatRoughness: 0.05
      });

    case 'organic':
    case 'skin':
      return new THREE.MeshStandardMaterial({
        color,
        roughness: isUltra ? 0.52 : 0.45,
        metalness: 0.04,
        roughnessMap: texture || undefined,
        bumpMap: texture || undefined,
        bumpScale: 0.025
      });

    case 'wood':
      return new THREE.MeshStandardMaterial({
        color,
        roughness: 0.74,
        metalness: 0.0,
        bumpMap: texture || undefined,
        bumpScale: 0.04
      });

    case 'concrete':
    case 'stone':
      return new THREE.MeshStandardMaterial({
        color,
        roughness: 0.94,
        metalness: 0.02,
        bumpMap: texture || undefined,
        bumpScale: 0.06
      });

    case 'plastic':
    default:
      return new THREE.MeshPhysicalMaterial({
        color,
        roughness: Math.max(0.25, roughness),
        metalness: 0.08,
        clearcoat: 0.3,
        clearcoatRoughness: 0.2
      });
  }
}

/**
 * Builds a single ModelComponentDefinition into Three.js objects
 */
function buildComponentMesh(
  comp: ModelComponentDefinition,
  quality: ModelQualityLevel,
  isPrimary: boolean = false
): THREE.Object3D {
  const material = createPBRMaterial(
    comp.materialType,
    comp.color,
    comp.roughness,
    comp.metalness,
    quality,
    {
      clearcoat: comp.clearcoat,
      transmission: comp.transmission,
      opacity: comp.opacity,
      texturePattern: comp.texturePattern
    }
  );

  let object: THREE.Object3D;

  switch (comp.shapeType) {
    case 'compound_hull': {
      const len = (comp.params?.length as number) || 4.8;
      const rad = (comp.params?.radius as number) || 0.95;
      const geo = createAerodynamicFuselageGeometry(len, rad, quality);
      object = new THREE.Mesh(geo, material);
      break;
    }

    case 'extruded_aerofoil': {
      const span = (comp.params?.span as number) || 3.8;
      const geo = createCamberedAirfoilGeometry(span, 1.1, 0.45, 0.12, quality);
      object = new THREE.Mesh(geo, material);
      break;
    }

    case 'wheel_assembly': {
      const rimMat = createPBRMaterial('polished_metal', 0x94a3b8, 0.12, 0.95, quality);
      const discMat = createPBRMaterial('bare_metal', 0xcbd5e1, 0.28, 0.88, quality, { texturePattern: 'anisotropic_brushed' });
      const calMat = createPBRMaterial('painted_metal', 0xef4444, 0.2, 0.3, quality);
      object = createRealisticWheelGroup(0.45, 0.26, 0.27, quality, {
        tire: material,
        rim: rimMat,
        disc: discMat,
        caliper: calMat
      });
      break;
    }

    case 'beveled_chassis': {
      const w = comp.scale[0] || 2.4;
      const h = comp.scale[1] || 0.6;
      const d = comp.scale[2] || 1.2;
      const geo = createBeveledChassisGeometry(w, h, d, 0.08, quality);
      object = new THREE.Mesh(geo, material);
      break;
    }

    case 'organic_chamber': {
      const rx = comp.scale[0] || 1.2;
      const ry = comp.scale[1] || 1.4;
      const rz = comp.scale[2] || 0.9;
      const geo = createOrganicChamberGeometry(rx, ry, rz, 0.3, quality);
      object = new THREE.Mesh(geo, material);
      break;
    }

    case 'fluted_column': {
      const geo = createFlutedColumnGeometry(4.0, 0.45, 16, quality);
      object = new THREE.Mesh(geo, material);
      break;
    }

    case 'curved_canopy': {
      const seg = quality === 'ultra' ? 36 : 24;
      const geo = new THREE.SphereGeometry(1, seg, seg, 0, Math.PI);
      geo.rotateX(-Math.PI / 2);
      geo.scale(comp.scale[0], comp.scale[1], comp.scale[2]);
      geo.computeVertexNormals();
      object = new THREE.Mesh(geo, material);
      break;
    }

    case 'articulated_rotor': {
      const group = new THREE.Group();
      const mastGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.8, 16);
      const mastMesh = new THREE.Mesh(mastGeo, material);
      group.add(mastMesh);

      const hubGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.16, 24);
      const hubMesh = new THREE.Mesh(hubGeo, material);
      hubMesh.position.y = 0.25;
      group.add(hubMesh);

      // 4 blades
      const bladeMat = createPBRMaterial('carbon_fiber', 0x18181b, 0.35, 0.45, quality, { texturePattern: 'carbon_twill' });
      for (let b = 0; b < 4; b++) {
        const bladeGeo = new THREE.BoxGeometry(3.6, 0.04, 0.28);
        const blade = new THREE.Mesh(bladeGeo, bladeMat);
        const ang = (b * Math.PI) / 2;
        blade.position.set(Math.cos(ang) * 1.8, 0.28, Math.sin(ang) * 1.8);
        blade.rotation.y = -ang;
        group.add(blade);
      }
      object = group;
      break;
    }

    case 'strut_tube': {
      const seg = quality === 'ultra' ? 24 : 16;
      const geo = new THREE.CylinderGeometry(0.06, 0.06, comp.scale[0] || 2.0, seg);
      geo.rotateZ(Math.PI / 2);
      object = new THREE.Mesh(geo, material);
      break;
    }

    default: {
      // Default to smooth rounded box with bevel
      const geo = createBeveledChassisGeometry(comp.scale[0] || 1, comp.scale[1] || 1, comp.scale[2] || 1, 0.05, quality);
      object = new THREE.Mesh(geo, material);
      break;
    }
  }

  object.position.set(comp.position[0], comp.position[1], comp.position[2]);
  object.rotation.set(comp.rotation[0], comp.rotation[1], comp.rotation[2]);
  if (comp.shapeType !== 'beveled_chassis' && comp.shapeType !== 'compound_hull') {
    object.scale.set(comp.scale[0], comp.scale[1], comp.scale[2]);
  }

  object.castShadow = true;
  object.receiveShadow = true;
  object.userData = {
    partId: comp.id,
    name: comp.name,
    subsystem: comp.subsystem,
    functionDesc: comp.functionDesc,
    simpleExplanation: comp.simpleExplanation,
    technicalDetails: comp.technicalDetails,
    isPrimary
  };

  return object;
}

/**
 * Builds the complete hierarchical 3D model assembly according to the structural plan
 */
export function buildThreeDAssembly(
  plan: EducationalStructuralPlan,
  quality: ModelQualityLevel = 'high'
): BuiltModelResult {
  const rootGroup = new THREE.Group();
  rootGroup.name = plan.id;

  const partsMap = new Map<string, THREE.Object3D>();
  const initialPositions = new Map<string, THREE.Vector3>();
  const explodeVectors = new Map<string, THREE.Vector3>();
  const animatedParts: { object: THREE.Object3D; movement: ComponentMovement }[] = [];

  // 1. Build Primary Geometry Components
  plan.primaryComponents.forEach((comp) => {
    const mesh = buildComponentMesh(comp, quality, true);
    rootGroup.add(mesh);
    partsMap.set(comp.id, mesh);
    initialPositions.set(comp.id, mesh.position.clone());
    explodeVectors.set(comp.id, new THREE.Vector3(...comp.explodeVector));

    if (comp.movement) {
      animatedParts.push({ object: mesh, movement: comp.movement });
    }
  });

  // 2. Build Secondary Geometry Components
  plan.secondaryComponents.forEach((comp) => {
    const mesh = buildComponentMesh(comp, quality, false);
    rootGroup.add(mesh);
    partsMap.set(comp.id, mesh);
    initialPositions.set(comp.id, mesh.position.clone());
    explodeVectors.set(comp.id, new THREE.Vector3(...comp.explodeVector));

    if (comp.movement) {
      animatedParts.push({ object: mesh, movement: comp.movement });
    }
  });

  // 3. Build Micro Details (Fasteners, Rivets, Pitot Probes, Vents)
  if (plan.microDetails && plan.microDetails.length > 0 && quality !== 'standard') {
    const microGroup = new THREE.Group();
    microGroup.name = 'micro_details_layer';

    const steelMat = createPBRMaterial('bare_metal', 0x94a3b8, 0.25, 0.9, quality);

    plan.microDetails.forEach((detail) => {
      if (detail.type === 'pitot_tube') {
        const tubeGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.35, 8);
        tubeGeo.rotateZ(Math.PI / 2);
        const tubeMesh = new THREE.Mesh(tubeGeo, steelMat);
        tubeMesh.position.set(...detail.position);
        microGroup.add(tubeMesh);
      } else if (detail.type === 'antenna_mast') {
        const mastGeo = new THREE.ConeGeometry(0.02, 0.45, 8);
        const mastMesh = new THREE.Mesh(mastGeo, steelMat);
        mastMesh.position.set(...detail.position);
        microGroup.add(mastMesh);
      } else if (detail.type === 'rivet_strip') {
        const count = detail.count || 12;
        const rivetGeo = new THREE.SphereGeometry(0.02, 6, 6);
        for (let r = 0; r < count; r++) {
          const ang = (r * Math.PI * 2) / count;
          const rivet = new THREE.Mesh(rivetGeo, steelMat);
          rivet.position.set(
            detail.position[0],
            detail.position[1] + Math.sin(ang) * 0.95,
            detail.position[2] + Math.cos(ang) * 0.95
          );
          microGroup.add(rivet);
        }
      }
    });

    rootGroup.add(microGroup);
  }

  // 4. Automated Realism Validation Check (Section 21)
  const validationReport = validateModelRealism(plan, rootGroup, quality);

  return {
    rootGroup,
    partsMap,
    initialPositions,
    explodeVectors,
    animatedParts,
    validationReport
  };
}
