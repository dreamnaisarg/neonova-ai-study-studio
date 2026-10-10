import * as THREE from 'three';
import { TexturePatternType } from './types';

// Cache generated procedural textures to conserve GPU memory
const textureCache = new Map<string, THREE.CanvasTexture>();

/**
 * Generate a procedural PBR bump/roughness texture canvas based on real material behavior
 */
export function getProceduralTexture(type: TexturePatternType): THREE.CanvasTexture | null {
  if (type === 'smooth') return null;
  if (textureCache.has(type)) {
    return textureCache.get(type)!;
  }

  if (typeof document === 'undefined') return null;

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  switch (type) {
    case 'anisotropic_brushed': {
      // Horizontal micro-scratches from directional lathe/milling
      ctx.fillStyle = '#808080';
      ctx.fillRect(0, 0, 512, 512);

      for (let y = 0; y < 512; y += 2) {
        const val = Math.floor(110 + Math.random() * 40);
        ctx.fillStyle = `rgb(${val}, ${val}, ${val})`;
        ctx.fillRect(0, y, 512, 1);
      }
      // Add subtle cross-chatter
      for (let i = 0; i < 200; i++) {
        const x = Math.random() * 512;
        const len = 20 + Math.random() * 80;
        const y = Math.random() * 512;
        const v = Math.floor(100 + Math.random() * 60);
        ctx.fillStyle = `rgb(${v}, ${v}, ${v})`;
        ctx.fillRect(x, y, len, 1);
      }
      break;
    }

    case 'panel_seams_rivets': {
      // Manufactured aircraft/chassis skin panels with flush counter-sunk rivets
      ctx.fillStyle = '#808080';
      ctx.fillRect(0, 0, 512, 512);

      // Panel gaps (dark groove line with light highlight border)
      ctx.strokeStyle = '#404040';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(128, 0); ctx.lineTo(128, 512);
      ctx.moveTo(384, 0); ctx.lineTo(384, 512);
      ctx.moveTo(0, 256); ctx.lineTo(512, 256);
      ctx.stroke();

      // Highlight edge on one side of seam
      ctx.strokeStyle = '#a0a0a0';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(130, 0); ctx.lineTo(130, 512);
      ctx.moveTo(386, 0); ctx.lineTo(386, 512);
      ctx.moveTo(0, 258); ctx.lineTo(512, 258);
      ctx.stroke();

      // Rows of precision rivets along structural stringers
      const drawRivetLine = (startX: number, endX: number, y: number, step: number) => {
        for (let x = startX; x <= endX; x += step) {
          ctx.fillStyle = '#505050';
          ctx.beginPath();
          ctx.arc(x, y, 3, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#c0c0c0';
          ctx.beginPath();
          ctx.arc(x - 0.7, y - 0.7, 1.2, 0, Math.PI * 2);
          ctx.fill();
        }
      };

      drawRivetLine(10, 500, 16, 24);
      drawRivetLine(10, 500, 240, 24);
      drawRivetLine(10, 500, 272, 24);
      drawRivetLine(10, 500, 496, 24);
      break;
    }

    case 'tire_tread': {
      // Directional automotive/landing gear tire tread grooves
      ctx.fillStyle = '#202020';
      ctx.fillRect(0, 0, 512, 512);

      // Deep water-evacuation channels
      ctx.fillStyle = '#050505';
      ctx.fillRect(80, 0, 30, 512);
      ctx.fillRect(241, 0, 30, 512);
      ctx.fillRect(402, 0, 30, 512);

      // Angled lateral sipes
      ctx.strokeStyle = '#050505';
      ctx.lineWidth = 6;
      for (let y = 0; y < 512; y += 32) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(80, y + 16);
        ctx.moveTo(110, y + 16);
        ctx.lineTo(241, y + 32);
        ctx.moveTo(271, y + 32);
        ctx.lineTo(402, y + 16);
        ctx.moveTo(432, y + 16);
        ctx.lineTo(512, y);
        ctx.stroke();
      }
      break;
    }

    case 'carbon_twill': {
      // 2x2 Aerospace twill weave carbon fiber pattern
      ctx.fillStyle = '#1c1c1c';
      ctx.fillRect(0, 0, 512, 512);

      const size = 16;
      for (let x = 0; x < 512; x += size * 2) {
        for (let y = 0; y < 512; y += size * 2) {
          ctx.fillStyle = '#2c2c2c';
          ctx.fillRect(x, y, size, size);
          ctx.fillRect(x + size, y + size, size, size);
          ctx.fillStyle = '#101010';
          ctx.fillRect(x + size, y, size, size);
          ctx.fillRect(x, y + size, size, size);
        }
      }
      break;
    }

    case 'cellular_myocardium': {
      // Organic muscle fibers and micro-vasculature
      ctx.fillStyle = '#7a2020';
      ctx.fillRect(0, 0, 512, 512);

      // Cellular striated streaks
      for (let y = 0; y < 512; y += 4) {
        const v = Math.floor(100 + Math.random() * 50);
        ctx.fillStyle = `rgba(${v + 30}, ${v - 40}, ${v - 40}, 0.6)`;
        ctx.fillRect(0, y, 512, 2);
      }
      // Micro-capillary branches
      ctx.strokeStyle = '#4a0808';
      ctx.lineWidth = 1.5;
      for (let i = 0; i < 30; i++) {
        let cx = Math.random() * 512;
        let cy = Math.random() * 512;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        for (let s = 0; s < 5; s++) {
          cx += (Math.random() - 0.5) * 40;
          cy += (Math.random() - 0.5) * 40;
          ctx.lineTo(cx, cy);
        }
        ctx.stroke();
      }
      break;
    }

    case 'concrete_grit': {
      // Matte concrete / stone aggregate grain
      ctx.fillStyle = '#808080';
      ctx.fillRect(0, 0, 512, 512);

      const imgData = ctx.getImageData(0, 0, 512, 512);
      const data = imgData.data;
      for (let i = 0; i < data.length; i += 4) {
        const noise = (Math.random() - 0.5) * 35;
        const val = Math.max(0, Math.min(255, 128 + noise));
        data[i] = val;
        data[i + 1] = val;
        data[i + 2] = val;
      }
      ctx.putImageData(imgData, 0, 0);
      break;
    }

    case 'wood_grain': {
      // Natural timber grain with annual growth rings
      ctx.fillStyle = '#9c6644';
      ctx.fillRect(0, 0, 512, 512);

      for (let y = 0; y < 512; y += 1) {
        const freq = Math.sin(y * 0.04) * 20 + Math.sin(y * 0.12) * 10;
        const col = Math.floor(140 + freq);
        ctx.fillStyle = `rgb(${col + 20}, ${Math.floor(col * 0.65)}, ${Math.floor(col * 0.4)})`;
        ctx.fillRect(0, y, 512, 1);
      }
      break;
    }

    default:
      return null;
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 2);
  textureCache.set(type, texture);
  return texture;
}
