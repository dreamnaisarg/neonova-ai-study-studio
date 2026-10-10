import * as THREE from 'three';
import { AnatomicalMaterialType, MedicalViewerTheme } from './types';

// Procedural biological textures cache
const textureCache = new Map<string, THREE.CanvasTexture>();

function getBiologicalTexture(type: string): THREE.CanvasTexture | null {
  if (typeof document === 'undefined') return null;
  if (textureCache.has(type)) return textureCache.get(type)!;

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  if (type === 'myocardium_striations') {
    // Striated cardiac muscle fibers with micro-capillary perfusion
    ctx.fillStyle = '#8b1e1e';
    ctx.fillRect(0, 0, 512, 512);

    for (let y = 0; y < 512; y += 3) {
      const v = Math.floor(115 + Math.random() * 45);
      ctx.fillStyle = `rgba(${v + 35}, ${v - 35}, ${v - 35}, 0.55)`;
      ctx.fillRect(0, y, 512, 1.5);
    }
    // Branching intercalated disc seams
    ctx.strokeStyle = '#5a1212';
    ctx.lineWidth = 1.2;
    for (let i = 0; i < 40; i++) {
      let x = Math.random() * 512;
      let y = Math.random() * 512;
      ctx.beginPath();
      ctx.moveTo(x, y);
      for (let s = 0; s < 4; s++) {
        x += (Math.random() - 0.5) * 35;
        y += (Math.random() - 0.5) * 35;
        ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
  } else if (type === 'bone_porosity') {
    // Cortical bone osteon micro-porosity and Haversian canals
    ctx.fillStyle = '#e8e2d4';
    ctx.fillRect(0, 0, 512, 512);

    const img = ctx.getImageData(0, 0, 512, 512);
    for (let i = 0; i < img.data.length; i += 4) {
      const n = (Math.random() - 0.5) * 22;
      img.data[i] = Math.max(0, Math.min(255, img.data[i] + n));
      img.data[i + 1] = Math.max(0, Math.min(255, img.data[i + 1] + n));
      img.data[i + 2] = Math.max(0, Math.min(255, img.data[i + 2] + n));
    }
    ctx.putImageData(img, 0, 0);

    // Micro osteon pits
    ctx.fillStyle = '#b0a896';
    for (let i = 0; i < 150; i++) {
      ctx.beginPath();
      ctx.arc(Math.random() * 512, Math.random() * 512, 1.5 + Math.random(), 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (type === 'pulmonary_alveoli') {
    // Spongy lung parenchyma with alveolar septa network
    ctx.fillStyle = '#b36b6b';
    ctx.fillRect(0, 0, 512, 512);

    ctx.strokeStyle = '#854242';
    ctx.lineWidth = 1.0;
    for (let i = 0; i < 90; i++) {
      ctx.beginPath();
      ctx.arc(Math.random() * 512, Math.random() * 512, 4 + Math.random() * 8, 0, Math.PI * 2);
      ctx.stroke();
    }
  } else if (type === 'brain_gyri_folds') {
    // Cerebral cortical sulcal micro-crevices
    ctx.fillStyle = '#c79c9c';
    ctx.fillRect(0, 0, 512, 512);

    for (let i = 0; i < 60; i++) {
      ctx.strokeStyle = '#8c5a5a';
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      let x = Math.random() * 512;
      let y = Math.random() * 512;
      ctx.moveTo(x, y);
      ctx.bezierCurveTo(x + 40, y - 20, x + 80, y + 40, x + 120, y);
      ctx.stroke();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 2);
  textureCache.set(type, texture);
  return texture;
}

/**
 * Creates scientifically accurate Three.js medical PBR materials
 */
export function createAnatomicalMaterial(
  type: AnatomicalMaterialType,
  baseColor: number,
  options?: {
    isXRay?: boolean;
    isSelected?: boolean;
    isIsolated?: boolean;
    opacity?: number;
    theme?: MedicalViewerTheme;
  }
): THREE.Material {
  const isXRay = options?.isXRay || false;
  const isSelected = options?.isSelected || false;

  // 1. Highlighted Selection State
  if (isSelected) {
    return new THREE.MeshPhysicalMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.65,
      roughness: 0.25,
      metalness: 0.15,
      clearcoat: 0.8,
      clearcoatRoughness: 0.1,
      transparent: false,
      opacity: 1.0
    });
  }

  // 2. X-Ray Educational Silhouette State (Semi-transparent medical frosted shell)
  if (isXRay) {
    return new THREE.MeshPhysicalMaterial({
      color: 0x93c5fd,
      roughness: 0.1,
      metalness: 0.05,
      transmission: 0.86,
      transparent: true,
      opacity: 0.22,
      ior: 1.45,
      depthWrite: false
    });
  }

  // 3. Anatomically Appropriate Realistic Medical Tissues
  switch (type) {
    case 'myocardium': {
      const tex = getBiologicalTexture('myocardium_striations');
      return new THREE.MeshStandardMaterial({
        color: baseColor || 0xdc2626,
        roughness: 0.52,
        metalness: 0.04,
        bumpMap: tex || undefined,
        bumpScale: 0.025,
        roughnessMap: tex || undefined
      });
    }

    case 'oxygenated_artery':
      return new THREE.MeshPhysicalMaterial({
        color: baseColor || 0xef4444,
        roughness: 0.26,
        metalness: 0.1,
        clearcoat: 0.45,
        clearcoatRoughness: 0.15
      });

    case 'deoxygenated_vein':
      return new THREE.MeshPhysicalMaterial({
        color: baseColor || 0x2563eb,
        roughness: 0.32,
        metalness: 0.08,
        clearcoat: 0.35,
        clearcoatRoughness: 0.2
      });

    case 'valvular_cartilage':
    case 'articular_cartilage':
      return new THREE.MeshPhysicalMaterial({
        color: baseColor || 0xfef08a,
        roughness: 0.22,
        metalness: 0.02,
        transmission: 0.35,
        transparent: true,
        opacity: 0.88,
        clearcoat: 0.5
      });

    case 'cortical_bone': {
      const tex = getBiologicalTexture('bone_porosity');
      return new THREE.MeshStandardMaterial({
        color: baseColor || 0xfef3c7,
        roughness: 0.74,
        metalness: 0.02,
        bumpMap: tex || undefined,
        bumpScale: 0.02
      });
    }

    case 'brain_cerebrum': {
      const tex = getBiologicalTexture('brain_gyri_folds');
      return new THREE.MeshStandardMaterial({
        color: baseColor || 0xfca5a5,
        roughness: 0.46,
        metalness: 0.04,
        bumpMap: tex || undefined,
        bumpScale: 0.035
      });
    }

    case 'brain_cerebellum':
      return new THREE.MeshStandardMaterial({
        color: baseColor || 0xf87171,
        roughness: 0.52,
        metalness: 0.04
      });

    case 'brainstem':
      return new THREE.MeshStandardMaterial({
        color: baseColor || 0xfecdd3,
        roughness: 0.4,
        metalness: 0.05
      });

    case 'lung_parenchyma': {
      const tex = getBiologicalTexture('pulmonary_alveoli');
      return new THREE.MeshStandardMaterial({
        color: baseColor || 0xf87171,
        roughness: 0.65,
        metalness: 0.02,
        bumpMap: tex || undefined,
        bumpScale: 0.03
      });
    }

    case 'trachea_cartilage':
      return new THREE.MeshPhysicalMaterial({
        color: baseColor || 0xe2e8f0,
        roughness: 0.25,
        metalness: 0.05,
        clearcoat: 0.4
      });

    case 'cornea_lens':
      return new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        roughness: 0.02,
        metalness: 0.0,
        transmission: 0.96,
        transparent: true,
        opacity: 0.9,
        ior: 1.406,
        clearcoat: 1.0
      });

    case 'sclera_retina':
      return new THREE.MeshStandardMaterial({
        color: baseColor || 0xf8fafc,
        roughness: 0.28,
        metalness: 0.04
      });

    case 'renal_cortex':
      return new THREE.MeshStandardMaterial({
        color: baseColor || 0xb91c1c,
        roughness: 0.48,
        metalness: 0.04
      });

    case 'renal_pyramid':
      return new THREE.MeshStandardMaterial({
        color: baseColor || 0x7f1d1d,
        roughness: 0.55,
        metalness: 0.02
      });

    case 'myelin_sheath':
      return new THREE.MeshStandardMaterial({
        color: baseColor || 0xfef08a,
        roughness: 0.38,
        metalness: 0.05
      });

    case 'axon_soma':
      return new THREE.MeshStandardMaterial({
        color: baseColor || 0x38bdf8,
        roughness: 0.42,
        metalness: 0.06
      });

    case 'dna_sugar_phosphate':
      return new THREE.MeshPhysicalMaterial({
        color: baseColor || 0x0284c7,
        roughness: 0.25,
        metalness: 0.2,
        clearcoat: 0.6
      });

    case 'dna_base_pair':
      return new THREE.MeshPhysicalMaterial({
        color: baseColor,
        roughness: 0.28,
        metalness: 0.1,
        clearcoat: 0.4
      });

    case 'liver_tissue':
    case 'digestive_smooth_muscle':
    default:
      return new THREE.MeshStandardMaterial({
        color: baseColor || 0xdc2626,
        roughness: 0.5,
        metalness: 0.04
      });
  }
}
