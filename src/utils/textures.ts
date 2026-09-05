import * as THREE from 'three';

export function createWoodFloorTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  // Base warm dark wood
  ctx.fillStyle = '#261a15';
  ctx.fillRect(0, 0, 1024, 1024);

  // Planks
  const plankHeight = 64;
  const plankWidth = 256;

  for (let y = 0; y < 1024; y += plankHeight) {
    const rowOffset = (Math.floor(y / plankHeight) % 2) * (plankWidth / 2);
    for (let x = -plankWidth; x < 1024 + plankWidth; x += plankWidth) {
      const px = x + rowOffset;
      // Slight tone variation per plank
      const toneVariance = (Math.sin(x * 12.3 + y * 7.1) + 1) * 0.5;
      const r = Math.floor(38 + toneVariance * 16);
      const g = Math.floor(25 + toneVariance * 12);
      const b = Math.floor(20 + toneVariance * 10);
      ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
      ctx.fillRect(px + 1, y + 1, plankWidth - 2, plankHeight - 2);

      // Plank grain lines
      ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
      for (let gIdx = 0; gIdx < 6; gIdx++) {
        const gy = y + 8 + gIdx * 9;
        ctx.fillRect(px + 2, gy, plankWidth - 4, 1);
      }
      
      // Plank bevel / seam shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
      ctx.fillRect(px, y, plankWidth, 2);
      ctx.fillRect(px, y, 2, plankHeight);
      
      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.fillRect(px + 1, y + plankHeight - 2, plankWidth - 2, 1);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(3, 2.5);
  return texture;
}

export function createRugTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Deep plum/charcoal base
  ctx.fillStyle = '#2b2332';
  ctx.fillRect(0, 0, 512, 512);

  // Woven micro-pattern
  ctx.fillStyle = '#342b3d';
  for (let y = 0; y < 512; y += 4) {
    for (let x = 0; x < 512; x += 4) {
      if ((x + y) % 8 === 0) {
        ctx.fillRect(x, y, 2, 2);
      }
    }
  }

  // Soft border border
  ctx.strokeStyle = '#43374e';
  ctx.lineWidth = 14;
  ctx.strokeRect(10, 10, 492, 492);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 1);
  return texture;
}

export function createSlatWallTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Dark acoustic felt backing
  ctx.fillStyle = '#110e11';
  ctx.fillRect(0, 0, 512, 512);

  // Vertical slats
  const slatWidth = 14;
  const gap = 10;
  const total = slatWidth + gap;

  for (let x = 0; x < 512; x += total) {
    // Slat face
    ctx.fillStyle = '#231b20';
    ctx.fillRect(x, 0, slatWidth, 512);

    // Slat left highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.fillRect(x, 0, 1.5, 512);

    // Slat right shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(x + slatWidth - 2, 0, 2, 512);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 1);
  return texture;
}
