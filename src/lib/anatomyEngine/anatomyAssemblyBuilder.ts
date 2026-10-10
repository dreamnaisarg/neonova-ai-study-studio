import * as THREE from 'three';
import { 
  AnatomicalModelDefinition, 
  AnatomicalStructureDefinition, 
  AnatomicalSystem,
  MedicalViewerTheme
} from './types';
import { createAnatomicalMaterial } from './anatomyMaterials';
import {
  createVentricularMyocardiumGeometry,
  createAorticArchGroup,
  createPulmonaryTrunkGroup,
  createCerebralLobeGeometry,
  createTracheaRingsGroup,
  createLungLobeGeometry,
  createHumanEyeGroup,
  createRenalKidneyGeometry,
  createNeuronGroup,
  createDNADoubleHelixGroup
} from './anatomyGeometries';

export interface BuiltAnatomyResult {
  rootGroup: THREE.Group;
  structuresMap: Map<string, THREE.Object3D>;
  initialPositions: Map<string, THREE.Vector3>;
  explodedVectors: Map<string, THREE.Vector3>;
  labelAnchors: Map<string, THREE.Vector3>;
  simulationParts: {
    object: THREE.Object3D;
    role: string;
    initialScale: THREE.Vector3;
    initialPos: THREE.Vector3;
  }[];
}

/**
 * Builds the complete scientifically accurate 3D medical assembly
 */
export function buildAnatomicalAssembly(
  model: AnatomicalModelDefinition,
  options: {
    selectedStructureId: string | null;
    isolatedStructureId: string | null;
    isXRayMode: boolean;
    activeSystemFilter: AnatomicalSystem | 'all';
    crossSectionSlice: number; // 0 (no cut) to 1 (full cross section)
    crossSectionAxis: 'x' | 'y' | 'z';
    theme: MedicalViewerTheme;
  }
): BuiltAnatomyResult {
  const rootGroup = new THREE.Group();
  rootGroup.name = model.id;

  const structuresMap = new Map<string, THREE.Object3D>();
  const initialPositions = new Map<string, THREE.Vector3>();
  const explodedVectors = new Map<string, THREE.Vector3>();
  const labelAnchors = new Map<string, THREE.Vector3>();
  const simulationParts: BuiltAnatomyResult['simulationParts'] = [];

  // Setup local clipping plane for cross-section anatomical slicing if enabled
  let localClippingPlanes: THREE.Plane[] | undefined = undefined;
  if (options.crossSectionSlice > 0.02) {
    let normal = new THREE.Vector3(1, 0, 0);
    if (options.crossSectionAxis === 'y') normal = new THREE.Vector3(0, 1, 0);
    else if (options.crossSectionAxis === 'z') normal = new THREE.Vector3(0, 0, 1);
    
    // Constant offset scaled by bounding range (-2 to +2)
    const constant = (0.5 - options.crossSectionSlice) * 4.0;
    localClippingPlanes = [new THREE.Plane(normal, constant)];
  }

  model.structures.forEach((struct) => {
    // Check system layer filter
    if (options.activeSystemFilter !== 'all' && struct.system !== options.activeSystemFilter) {
      return;
    }

    // Check isolation
    if (options.isolatedStructureId && struct.id !== options.isolatedStructureId) {
      return;
    }

    const isSelected = options.selectedStructureId === struct.id;
    const isXRay = options.isXRayMode && !isSelected;

    const material = createAnatomicalMaterial(struct.materialType, struct.color, {
      isSelected,
      isXRay,
      theme: options.theme
    });

    if (localClippingPlanes && material instanceof THREE.Material) {
      material.clippingPlanes = localClippingPlanes;
      material.clipShadows = true;
    }

    let object: THREE.Object3D;

    // Build specific anatomical geometry
    switch (struct.geometryType) {
      case 'ventricle_chamber': {
        const isLeft = struct.id.includes('left');
        const geo = createVentricularMyocardiumGeometry(struct.scale[0], struct.scale[1], struct.scale[2], isLeft);
        object = new THREE.Mesh(geo, material);
        break;
      }

      case 'atrium_chamber': {
        const geo = new THREE.SphereGeometry(struct.scale[0], 28, 28);
        geo.scale(1.1, 0.9, 1.0);
        object = new THREE.Mesh(geo, material);
        break;
      }

      case 'aortic_arch': {
        object = createAorticArchGroup(material);
        break;
      }

      case 'pulmonary_trunk': {
        object = createPulmonaryTrunkGroup(material);
        break;
      }

      case 'cardiac_valve': {
        const geo = new THREE.TorusGeometry(struct.scale[0] * 0.55, 0.08, 12, 32);
        geo.rotateX(Math.PI / 2);
        object = new THREE.Mesh(geo, material);
        break;
      }

      case 'cerebral_lobe': {
        const isLeft = struct.id.includes('left') || struct.position[0] < 0;
        const geo = createCerebralLobeGeometry(struct.scale[0], struct.scale[1], struct.scale[2], isLeft);
        object = new THREE.Mesh(geo, material);
        break;
      }

      case 'cerebellum_folia': {
        const geo = new THREE.SphereGeometry(1, 32, 24);
        geo.scale(struct.scale[0], struct.scale[1] * 0.65, struct.scale[2] * 0.85);
        object = new THREE.Mesh(geo, material);
        break;
      }

      case 'brainstem_pons': {
        const geo = new THREE.CylinderGeometry(struct.scale[0] * 0.5, struct.scale[0] * 0.35, struct.scale[1] * 2, 20);
        object = new THREE.Mesh(geo, material);
        break;
      }

      case 'trachea_rings': {
        const mucosaMat = createAnatomicalMaterial('digestive_smooth_muscle', 0xfca5a5);
        object = createTracheaRingsGroup(material, mucosaMat);
        break;
      }

      case 'lung_lobe': {
        const isLeft = struct.id.includes('left');
        const geo = createLungLobeGeometry(struct.scale[0] * 1.5, struct.scale[1] * 2.6, struct.scale[2] * 1.7, isLeft);
        object = new THREE.Mesh(geo, material);
        break;
      }

      case 'cornea_dome': {
        const scleraMat = createAnatomicalMaterial('sclera_retina', 0xf8fafc);
        const irisMat = createAnatomicalMaterial('oxygenated_artery', 0x0284c7);
        const lensMat = createAnatomicalMaterial('cornea_lens', 0xffffff);
        const nerveMat = createAnatomicalMaterial('myelin_sheath', 0xfef08a);
        object = createHumanEyeGroup(scleraMat, material, irisMat, lensMat, nerveMat);
        break;
      }

      case 'kidney_bean': {
        const geo = createRenalKidneyGeometry(struct.scale[1] * 2.4, struct.scale[0] * 1.5, struct.scale[2] * 1.0);
        object = new THREE.Mesh(geo, material);
        break;
      }

      case 'neuron_soma': {
        const myelinMat = createAnatomicalMaterial('myelin_sheath', 0xfef08a);
        const axonMat = createAnatomicalMaterial('axon_soma', 0x38bdf8);
        object = createNeuronGroup(material, myelinMat, axonMat);
        break;
      }

      case 'dna_helix_ribbon': {
        const adenineMat = createAnatomicalMaterial('dna_base_pair', 0xef4444);  // Red
        const thymineMat = createAnatomicalMaterial('dna_base_pair', 0x3b82f6);  // Blue
        const guanineMat = createAnatomicalMaterial('dna_base_pair', 0x10b981);  // Green
        const cytosineMat = createAnatomicalMaterial('dna_base_pair', 0xf59e0b); // Yellow
        object = createDNADoubleHelixGroup(material, adenineMat, thymineMat, guanineMat, cytosineMat);
        break;
      }

      default: {
        const geo = new THREE.SphereGeometry(1, 24, 24);
        geo.scale(struct.scale[0], struct.scale[1], struct.scale[2]);
        object = new THREE.Mesh(geo, material);
        break;
      }
    }

    object.position.set(...struct.position);
    object.rotation.set(...struct.rotation);
    object.castShadow = true;
    object.receiveShadow = true;

    object.userData = {
      structureId: struct.id,
      name: struct.name,
      latinName: struct.latinName,
      system: struct.system,
      isInternal: struct.isInternal
    };

    rootGroup.add(object);
    structuresMap.set(struct.id, object);
    initialPositions.set(struct.id, object.position.clone());
    explodedVectors.set(struct.id, new THREE.Vector3(...struct.explodedVector));

    // Global 3D Label Anchor point
    const anchor = new THREE.Vector3(...struct.labelCoords);
    labelAnchors.set(struct.id, anchor);

    // Track for physiological biological simulation
    if (struct.simulationRole) {
      simulationParts.push({
        object,
        role: struct.simulationRole,
        initialScale: object.scale.clone(),
        initialPos: object.position.clone()
      });
    }
  });

  return {
    rootGroup,
    structuresMap,
    initialPositions,
    explodedVectors,
    labelAnchors,
    simulationParts
  };
}
