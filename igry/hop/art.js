// What "Пригоди шкарпетки" looks like: the six places (time of day, sky, light, fog, what lies below), the scenery behind
// and in front of the play (houses, the laundromat's wall, the Rhine bridge, the Roman temple, the mill), the platforms,
// the sock and the letters. Everything is built from simple shapes and small textures drawn on the spot (no picture
// files), with a fixed seed so a level always looks the same. engine.js puts it on the screen.
import * as THREE from '../../assets/three/r185/three.module.min.js';

export const ART = { der: '#2F6FD6', die: '#D6453A', das: '#2E9B4B' };

// a random sequence that is the same every time (mulberry32)
export function rng(seed) {
  let a = seed >>> 0;
  return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

/* ---------------- the times of day ---------------- */
// sky: top, middle, horizon; fog: colour and how far it reaches past the play; hemi: sky light, ground light, strength;
// key: the main light (casts the shadows) and rim: a coloured light from behind that outlines things (as in pixel-art
// games lit like films); below: what lies under the platforms; grade: the colour of the shadows and of the light,
// glow of bright things, darker corners; exposure: how bright the whole picture is.
export const THEMES = {
  laundry: {
    sky: ['#02060C', '#06101A', '#0A1824'], fog: ['#0A1822', 60], hemi: ['#5A88B0', '#0C1018', 0.32], exposure: 1.1,
    key: ['#CFEAFF', 1.1, [-3, 10, 7]], rim: ['#FF5FA8', 1.3, [7, 3, -8]],
    below: { kind: 'foam', c: '#5A8296' }, grade: { lift: '#0B2A3C', gain: '#FFF2E2', glow: 1.1, vig: 1.2 },
    motes: { c: '#DFF6FF', n: 50, kind: 'bubble' }, rain: false,
  },
  yard: {
    sky: ['#1A1238', '#6A3464', '#E8784E'], fog: ['#8A4A66', 85], hemi: ['#B08AC8', '#2A1A2A', 0.45], exposure: 1.05,
    key: ['#FFB47A', 1.7, [-9, 5, 6]], rim: ['#FF7A59', 1.4, [8, 3, -9]],
    below: { kind: 'bushes', c: '#1E2A2A', mist: '#6E4A6E' }, grade: { lift: '#2A1438', gain: '#FFE6CC', glow: 0.9, vig: 1 },
    motes: { c: '#E8FF7A', n: 46, kind: 'firefly' }, rain: false, sun: ['#FFB070', 7, 2.2], stars: 40,
  },
  street: {
    sky: ['#030208', '#0C0A1C', '#22183A'], fog: ['#1C142E', 75], hemi: ['#6A76B8', '#0C0A14', 0.42], exposure: 1.2,
    key: ['#9FB4FF', 0.9, [-4, 10, 6]], rim: ['#FF4DD2', 1.6, [8, 4, -8]],
    below: { kind: 'mist', c: '#0B0A12', mist: '#3A2E5A' }, grade: { lift: '#1A0F2E', gain: '#FFE0F0', glow: 1.35, vig: 1.15 },
    motes: null, rain: true, wet: true,
  },
  rhine: {
    sky: ['#5C76A0', '#B898AC', '#EAC6B4'], fog: ['#C8B0B4', 55], hemi: ['#C8C0DC', '#3A4650', 0.7], exposure: 1.0,
    key: ['#FFE0C0', 1.5, [-8, 4, 5]], rim: ['#FFC9A0', 1.0, [9, 2, -8]],
    below: { kind: 'water', c: '#8AA2B2' }, grade: { lift: '#3A4A66', gain: '#FFF0E6', glow: 0.7, vig: 0.8 },
    motes: { c: '#FFFFFF', n: 0, kind: 'dust' }, rain: false, sun: ['#FFF0D8', 9, 1.2], mist: true,
  },
  roman: {
    sky: ['#2E4A78', '#D88A4C', '#FFCC78'], fog: ['#D89A60', 80], hemi: ['#F0C890', '#4A3020', 0.55], exposure: 1.05,
    key: ['#FFC27A', 2.2, [-10, 4.5, 5]], rim: ['#FF9A4A', 1.2, [9, 3, -8]],
    below: { kind: 'mist', c: '#3A2A1E', mist: '#E0A060' }, grade: { lift: '#3A2410', gain: '#FFF0D8', glow: 0.9, vig: 0.95 },
    motes: { c: '#FFE3A0', n: 60, kind: 'dust' }, rain: false, sun: ['#FFE6A8', 11, 2.6], rays: true,
  },
  mill: {
    sky: ['#0C0816', '#30162A', '#A83A28'], fog: ['#4A2230', 75], hemi: ['#9A80B0', '#1E1218', 0.58], exposure: 1.15,
    key: ['#FFA060', 2.1, [-9, 3.5, 6]], rim: ['#FF5A3A', 1.6, [8, 3, -9]],
    below: { kind: 'field', c: '#1A1410', mist: '#5A2A30' }, grade: { lift: '#22101C', gain: '#FFE0D0', glow: 1.0, vig: 1.2 },
    motes: { c: '#E09A4A', n: 70, kind: 'leaf' }, rain: false, sun: ['#FF8A50', 8, 0.6], storm: true,
  },
};

/* ---------------- small textures drawn on the spot ---------------- */
const texCache = new Map();
function canvasTex(c, repeat = true) {
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.magFilter = THREE.NearestFilter;
  if (repeat) t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}
// a 32×32 picture covering 2×2 units of the world
export function tex(kind) {
  if (texCache.has(kind)) return texCache.get(kind);
  const S = 32, c = document.createElement('canvas'); c.width = c.height = S;
  const x = c.getContext('2d'), r = rng([...kind].reduce((a, ch) => a * 31 + ch.charCodeAt(0), 7));
  const px = (X, Y, w, h, col) => { x.fillStyle = col; x.fillRect(X, Y, w, h); };
  const specks = (col, n) => { for (let i = 0; i < n; i++) px((r() * S) | 0, (r() * S) | 0, 1, 1, col); };
  const shade = (hex, k) => { const n = parseInt(hex.slice(1), 16), f = (v) => Math.max(0, Math.min(255, Math.round(v * k))); return `rgb(${f(n >> 16)},${f((n >> 8) & 255)},${f(n & 255)})`; };
  if (kind === 'tiles') {
    px(0, 0, S, S, '#E3EAEE');
    for (let i = 0; i < S; i += 8) for (let j = 0; j < S; j += 8) px(i + 1, j + 1, 6, 6, shade('#E3EAEE', 0.94 + r() * 0.1));
    for (let i = 0; i < S; i += 8) { px(i, 0, 1, S, '#9DAAB4'); px(0, i, S, 1, '#9DAAB4'); }
  } else if (kind === 'brick') {
    px(0, 0, S, S, '#D9B49A');
    for (let row = 0; row < 4; row++) for (let i = row % 2 ? -8 : 0; i < S; i += 16) px(i + 1, row * 8 + 1, 15, 7, shade('#A9523A', 0.8 + r() * 0.35));
    specks('rgba(40,10,5,.35)', 50);
  } else if (kind === 'stone') {
    px(0, 0, S, S, '#5E564C');
    for (let row = 0; row < 3; row++) for (let i = row % 2 ? -6 : 0; i < S; i += 12) px(i + 1, row * 11 + 1, 11, 10, shade('#C8BBA4', 0.78 + r() * 0.3));
    specks('rgba(60,50,40,.4)', 60);
  } else if (kind === 'dirt') {
    px(0, 0, S, S, '#5A3E2A'); specks('#3F2A1C', 120); specks('#7A5A40', 50);
    for (let i = 0; i < 6; i++) px((r() * 30) | 0, (r() * 30) | 0, 2, 2, '#8A7A68');
  } else if (kind === 'concrete') {
    px(0, 0, S, S, '#6E7178'); specks('#5C5F66', 140); specks('#80838A', 70);
    px(0, 15, S, 1, '#4E5158'); px(15, 0, 1, S, '#4E5158');
  } else if (kind === 'wood') {
    px(0, 0, S, S, '#9C6A3E');
    for (let i = 0; i < S; i += 8) { px(0, i, S, 1, '#5E3C22'); for (let k = 0; k < 6; k++) px((r() * S) | 0, i + 2 + ((r() * 5) | 0), 3, 1, '#83552F'); }
  } else if (kind === 'wicker') {
    for (let i = 0; i < S; i += 4) for (let j = 0; j < S; j += 4) px(i, j, 4, 4, ((i + j) / 4) % 2 ? '#C89558' : '#9E6E38');
  } else if (kind === 'roof') {
    px(0, 0, S, S, '#5A2418');
    for (let row = 0; row < 4; row++) for (let i = row % 2 ? -4 : 0; i < S; i += 8) px(i + 1, row * 8, 7, 7, shade('#B8452E', 0.8 + r() * 0.3));
  } else if (kind === 'stripes') {
    for (let i = 0; i < S; i += 8) { px(i, 0, 4, S, '#E8E2D6'); px(i + 4, 0, 4, S, '#C4382E'); }
  } else if (kind === 'flutes') {
    for (let i = 0; i < S; i += 4) { px(i, 0, 3, S, '#EFE6D4'); px(i + 3, 0, 1, S, '#BFAF94'); }
  } else if (kind === 'hull') {
    px(0, 0, S, S, '#2C3A48'); for (let i = 0; i < S; i += 8) px(0, i, S, 1, '#22303C'); specks('#3A4A58', 40);
    for (let i = 0; i < 10; i++) px((r() * S) | 0, (r() * S) | 0, 1, 3, 'rgba(140,90,60,.6)');
  }
  const t = canvasTex(c); texCache.set(kind, t); return t;
}
// writing that lights up (neon, a shop sign, the bus's destination)
export function textTex(text, color, { font = '800 30px system-ui, sans-serif', glow = true, bg = null } = {}) {
  const c = document.createElement('canvas'), x = c.getContext('2d');
  x.font = font; const w = Math.ceil(x.measureText(text).width) + 20;
  c.width = w; c.height = 46;
  if (bg) { x.fillStyle = bg; x.fillRect(0, 0, w, 46); }
  x.font = font; x.textAlign = 'center'; x.textBaseline = 'middle';
  if (glow) { x.shadowColor = color; x.shadowBlur = 8; }
  x.fillStyle = color; x.fillText(text, w / 2, 24);
  if (glow) { x.shadowBlur = 0; x.fillStyle = 'rgba(255,255,255,.75)'; x.fillText(text, w / 2, 24); }
  const t = canvasTex(c, false); t.magFilter = THREE.LinearFilter;
  return { tex: t, aspect: w / 46 };
}

/* ---------------- shapes and materials ---------------- */
const mats = new Map();
export function M(color, o = {}) {
  const key = color + JSON.stringify(o, (k, v) => (v && v.isTexture ? v.uuid : v));
  if (!mats.has(key)) {
    const { basic, ...rest } = o;
    const m = basic ? new THREE.MeshBasicMaterial({ color, ...rest }) : new THREE.MeshStandardMaterial({ color, roughness: 0.85, metalness: 0, ...rest });
    m.userData.shared = true; mats.set(key, m);
  }
  return mats.get(key);
}
// a box whose textures repeat by size (one picture per `tile` units) instead of stretching over each face
export function boxGeo(w, h, d, tile = 2) {
  const g = new THREE.BoxGeometry(w, h, d), uv = g.attributes.uv;
  const size = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]];
  for (let f = 0; f < 6; f++) for (let k = 0; k < 4; k++) { const i = f * 4 + k; uv.setXY(i, (uv.getX(i) * size[f][0]) / tile, (uv.getY(i) * size[f][1]) / tile); }
  return g;
}
export function mesh(geo, material, { cast = true, receive = true } = {}) {
  const m = new THREE.Mesh(geo, material); m.castShadow = cast; m.receiveShadow = receive; return m;
}
export const at = (o, x, y, z) => { o.position.set(x, y, z); return o; };
const box = (w, h, d, mat, x, y, z, o) => at(mesh(boxGeo(w, h, d), mat, o), x, y, z);
const cyl = (r1, r2, h, mat, x, y, z, seg = 16, o) => at(mesh(new THREE.CylinderGeometry(r1, r2, h, seg), mat, o), x, y, z);
// light that falls through air: a cone, bright at the lamp and fading out (added on top of the picture)
export function lightCone(r, h, color, strength = 0.3) {
  const g = new THREE.CylinderGeometry(0.12, r, h, 20, 1, true), n = g.attributes.position.count, col = new Float32Array(n * 4), c = new THREE.Color(color);
  for (let i = 0; i < n; i++) { const top = g.attributes.position.getY(i) > 0; col.set([c.r, c.g, c.b, top ? strength : 0], i * 4); }
  g.setAttribute('color', new THREE.BufferAttribute(col, 4));
  const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, fog: false }));
  m.position.y = -h / 2; m.renderOrder = 5;
  const holder = new THREE.Group(); holder.add(m); return holder;
}
// a band of mist: thick at the bottom, gone at the top
export function mistBand(w, h, color, opacity) {
  const g = new THREE.PlaneGeometry(w, h, 1, 1), col = new Float32Array(16), c = new THREE.Color(color), pos = g.attributes.position;
  for (let i = 0; i < 4; i++) col.set([c.r, c.g, c.b, pos.getY(i) > 0 ? 0 : opacity], i * 4);
  g.setAttribute('color', new THREE.BufferAttribute(col, 4));
  const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ vertexColors: true, transparent: true, depthWrite: false }));
  m.renderOrder = 4; return m;
}

/* ---------------- the sock ---------------- */
export function makeSock(main = '#F2C230', stripe = '#2F5DB3', toe = '#D6453A') {
  const g = new THREE.Group(), body = new THREE.Group();
  g.add(body);
  const wool = (c) => M(c, { roughness: 0.95 });
  const leg = mesh(new THREE.CapsuleGeometry(0.25, 0.42, 6, 18), wool(main)); at(leg, 0, 0.46, 0); body.add(leg);
  const foot = mesh(new THREE.CapsuleGeometry(0.21, 0.24, 6, 16), wool(main)); foot.rotation.x = Math.PI / 2; at(foot, 0, 0.21, 0.17); body.add(foot);
  const toeCap = mesh(new THREE.SphereGeometry(0.215, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), wool(toe)); toeCap.rotation.x = Math.PI / 2; at(toeCap, 0, 0.21, 0.29); body.add(toeCap);
  const heel = mesh(new THREE.SphereGeometry(0.255, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2.4), wool(toe)); heel.rotation.x = -Math.PI / 2; at(heel, 0, 0.24, -0.02); body.add(heel);
  for (const y of [0.58, 0.7]) body.add(at(mesh(new THREE.CylinderGeometry(0.262, 0.262, 0.07, 20, 1, true), M(stripe, { roughness: 0.9, side: THREE.DoubleSide })), 0, y, 0));
  const cuff = mesh(new THREE.TorusGeometry(0.22, 0.06, 8, 20), wool(stripe)); cuff.rotation.x = Math.PI / 2; at(cuff, 0, 0.86, 0); body.add(cuff);
  const eyes = new THREE.Group(); at(eyes, 0, 0.66, 0.2); body.add(eyes);
  for (const s of [-1, 1]) {
    eyes.add(at(mesh(new THREE.SphereGeometry(0.08, 12, 8), M('#FFFFFF', { roughness: 0.4, emissive: '#FFFFFF', emissiveIntensity: 0.25 }), { cast: false }), s * 0.1, 0, 0.02));
    eyes.add(at(mesh(new THREE.SphereGeometry(0.045, 8, 6), M('#14171B', { roughness: 0.3 }), { cast: false }), s * 0.1, 0.005, 0.09));
  }
  g.userData = { body, eyes };
  return g;
}

/* ---------------- letters: a tile in the colour of the article, the letter on both sides ---------------- */
export function makeLetter(ch, color) {
  const g = new THREE.Group();
  g.add(mesh(new THREE.BoxGeometry(0.66, 0.66, 0.14), M(color, { roughness: 0.5, emissive: color, emissiveIntensity: 0.9 }), { cast: false }));
  const c = document.createElement('canvas'); c.width = c.height = 64;
  const x = c.getContext('2d'); x.fillStyle = color; x.fillRect(0, 0, 64, 64);
  x.fillStyle = '#FFFFFF'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.font = '700 44px Unbounded, "Arial Black", system-ui, sans-serif'; x.fillText(ch, 32, 35);
  const t = canvasTex(c, false);
  const face = new THREE.MeshBasicMaterial({ map: t, color: new THREE.Color(1.5, 1.5, 1.5) });
  for (const s of [1, -1]) { const f = new THREE.Mesh(new THREE.PlaneGeometry(0.56, 0.56), face); f.position.z = s * 0.072; if (s < 0) f.rotation.y = Math.PI; g.add(f); }
  return g;
}

/* ---------------- platforms ---------------- */
// Returns the platform's own shape (moves with it) and what stands still around it (posts, ropes, a shed behind)
export function platformMesh(pl, th, floorY) {
  const g = new THREE.Group(), fixed = new THREE.Group(), w = pl.t === 'cyl' ? pl.r * 2 : pl.w, d = pl.d || w;
  const down = pl.y - floorY + 2;   // from the top down into the water or the mist
  const look = pl.look, wet = th.wet ? { roughness: 0.35, metalness: 0.15 } : {};
  const front = d / 2 + 0.01;
  if (look === 'tiles' || look === 'stone' || look === 'brick' || look === 'pave' || look === 'grass') {
    const map = { tiles: 'tiles', stone: 'stone', brick: 'brick', pave: 'concrete', grass: 'dirt' }[look];
    const capC = { tiles: '#D3DCE2', stone: '#D8CDB8', brick: '#BFB2A0', pave: '#8C9098', grass: '#4E9A3A' }[look];
    const capH = look === 'grass' ? 0.32 : 0.22;
    g.add(box(w, down - capH, d, M('#FFFFFF', { map: tex(map), ...wet }), 0, -capH - (down - capH) / 2, 0));
    g.add(box(w + 0.12, capH, d + 0.12, M(capC, wet), 0, -capH / 2, 0));
    if (look === 'grass') {   // a lip of grass over the front edge and a few tufts
      g.add(box(w + 0.04, 0.14, 0.12, M('#3C7E2C'), 0, -0.36, front + 0.04, { cast: false }));
      const r = rng(Math.round(pl.x * 13));
      for (let i = 0; i < w * 1.6; i++) g.add(box(0.08, 0.14 + r() * 0.16, 0.08, M(r() > 0.5 ? '#5DB045' : '#3F8A30'), -w / 2 + 0.2 + r() * (w - 0.4), 0.08, (r() - 0.5) * d * 0.9, { cast: false }));
    }
    if (look === 'pave') {   // a kerb, a drain and puddles that shine
      g.add(box(w + 0.14, 0.1, 0.14, M('#B8BCC2', wet), 0, -0.05, front + 0.02, { cast: false }));
      g.add(box(0.7, 0.012, 0.5, M('#2A2C30', { roughness: 0.4 }), w * 0.2, 0.006, 0.6, { cast: false }));
      const r = rng(Math.round(pl.x * 7));
      for (let i = 0; i < Math.max(1, w / 3); i++) g.add(box(0.8 + r(), 0.01, 0.6 + r() * 0.6, M('#1A1C24', { roughness: 0.05, metalness: 0.6 }), -w / 2 + 0.8 + r() * (w - 1.6), 0.008, (r() - 0.5) * d * 0.6, { cast: false }));
    }
    return { g, fixed };
  }
  if (look === 'machine') {   // a washing machine on a tiled plinth: the round door looks at us, the drum turns
    const mh = 2.3;
    g.add(box(w, mh, d, M('#F2F4F6', { roughness: 0.4 }), 0, -mh / 2, 0));
    g.add(box(w + 0.06, 0.08, d + 0.06, M('#DCE3E8', { roughness: 0.4 }), 0, -0.04, 0));
    g.add(box(w * 0.92, 0.32, 0.04, M('#C9D3DA'), 0, -0.26, front, { cast: false }));
    g.add(box(0.36, 0.12, 0.03, M('#56E0FF', { emissive: '#56E0FF', emissiveIntensity: 2.2 }), w * 0.22, -0.26, front + 0.02, { cast: false }));
    const ring = mesh(new THREE.TorusGeometry(0.62, 0.08, 8, 28), M('#AEB9C2', { metalness: 0.6, roughness: 0.3 }), { cast: false });
    at(ring, 0, -1.3, front + 0.02); g.add(ring);
    const glass = mesh(new THREE.CircleGeometry(0.58, 28), M('#244A66', { roughness: 0.1, metalness: 0.3, emissive: '#1A5A80', emissiveIntensity: 0.6 }), { cast: false });
    at(glass, 0, -1.3, front + 0.005); g.add(glass);
    const drum = new THREE.Group(); at(drum, 0, -1.3, front - 0.02); g.add(drum);
    ['#F2C230', '#D6453A', '#FFFFFF'].forEach((c, i) => { const a = (i / 3) * Math.PI * 2; drum.add(at(mesh(new THREE.SphereGeometry(0.17, 8, 6), M(c), { cast: false }), Math.cos(a) * 0.3, Math.sin(a) * 0.3, 0)); });
    g.userData.spin = drum;
    g.add(box(w - 0.3, down - mh, d - 0.3, M('#FFFFFF', { map: tex('tiles'), color: '#B7C3CB' }), 0, -mh - (down - mh) / 2, 0));
    return { g, fixed };
  }
  if (look === 'column') {   // a Roman column: capital, fluted shaft, down into the mist
    const r = pl.r, t = tex('flutes').clone(); t.needsUpdate = true; t.repeat.set(3, down / 2);
    g.add(box(r * 2 + 0.24, 0.3, r * 2 + 0.24, M('#EFE5D2'), 0, -0.15, 0));
    g.add(box(r * 2 + 0.05, 0.2, r * 2 + 0.05, M('#D9CCB4'), 0, -0.4, 0));
    g.add(cyl(r * 0.8, r * 0.86, down - 0.5, M('#FFFFFF', { map: t }), 0, -0.5 - (down - 0.5) / 2, 0, 18));
    return { g, fixed };
  }
  if (look === 'spring') {
    const h = pl.h;
    g.add(cyl(pl.r, pl.r * 1.05, 0.25, M('#3B4650'), 0, -h + 0.125, 0, 16));
    const coil = new THREE.Group(); at(coil, 0, -h + 0.25, 0); g.add(coil);
    for (let i = 0; i < 4; i++) { const c = mesh(new THREE.TorusGeometry(pl.r * 0.62, 0.05, 6, 16), M('#C9D1D8', { metalness: 0.7, roughness: 0.3 })); c.rotation.x = Math.PI / 2; at(c, 0, 0.1 + i * ((h - 0.4) / 4), 0); coil.add(c); }
    const pad = cyl(pl.r, pl.r, 0.16, M('#E04B3C', { roughness: 0.6, emissive: '#E04B3C', emissiveIntensity: 0.25 }), 0, -0.08, 0, 18); g.add(pad);
    g.userData.coil = coil; g.userData.pad = pad; g.userData.coilH = h - 0.25;
    if (h > 0.6) fixed.add(box(0.3, down - h, 0.3, M('#3B4650'), pl.x, pl.y - h - (down - h) / 2, 0));   // a spring on its own stands on a pole
    return { g, fixed };
  }
  const h = pl.h;
  if (look === 'basket') {   // a wicker basket with laundry; on a trolley, or hanging from a line when it moves
    const t = tex('wicker');
    g.add(cyl(pl.r, pl.r * 0.86, h, M('#FFFFFF', { map: t }), 0, -h / 2, 0, 18));
    g.add(at(mesh(new THREE.TorusGeometry(pl.r, 0.07, 6, 20), M('#B07A40')), 0, -0.02, 0).rotateX(Math.PI / 2));
    g.add(cyl(pl.r - 0.08, pl.r - 0.08, 0.1, M('#F4F6F8'), 0, -0.1, 0, 18));
    g.add(at(mesh(new THREE.SphereGeometry(0.28, 8, 6), M('#2F6FD6')), -0.3, -0.02, 0.1), at(mesh(new THREE.SphereGeometry(0.24, 8, 6), M('#F2C230')), 0.3, -0.04, -0.1));
    if (pl.move) hanging(pl, g, fixed, 2.6);
    else {
      for (const sx of [-1, 1]) for (const sz of [-1, 1]) fixed.add(box(0.07, down - h, 0.07, M('#9AA6AD', { metalness: 0.6, roughness: 0.4 }), pl.x + sx * pl.r * 0.7, pl.y - h - (down - h) / 2, sz * pl.r * 0.7));
    }
    return { g, fixed };
  }
  if (look === 'powder') {
    g.add(box(w, h, d, M('#F08A24'), 0, -h / 2, 0));
    g.add(box(w * 0.78, h * 0.4, 0.03, M('#FFFFFF'), 0, -h * 0.5, front, { cast: false }));
    g.add(at(mesh(new THREE.CircleGeometry(h * 0.13, 16), M('#2F6FD6')), 0, -h * 0.5, front + 0.02));
    return { g, fixed };
  }
  if (look === 'shelf' || look === 'bench' || look === 'plank' || look === 'sail') {
    const thick = Math.min(h, 0.35);
    g.add(box(w, thick, d, M('#FFFFFF', { map: tex('wood'), color: look === 'sail' ? '#D8C8A8' : '#FFFFFF' }), 0, -thick / 2, 0));
    if (look === 'shelf') {   // on brackets on the wall behind, with things on it at the back
      for (const sx of [-0.35, 0.35]) fixed.add(box(0.1, 0.5, d * 0.8, M('#5E6B75', { metalness: 0.5 }), pl.x + sx * w, pl.y - 0.55, -0.1));
      const r = rng(Math.round(pl.x * 3));
      for (let i = 0; i < 3; i++) g.add(box(0.3, 0.4 + r() * 0.3, 0.3, M(['#2F6FD6', '#E04B3C', '#F2C230', '#2E9B4B'][i % 4], { roughness: 0.5 }), -w / 2 + 0.4 + i * (w - 0.8) / 2, 0.25, -d / 2 + 0.25));
    } else if (look === 'plank' && !pl.move) {   // old planks on wooden piles
      for (const sx of [-1, 1]) for (const sz of [-1, 1]) fixed.add(box(0.18, down, 0.18, M('#4A3424'), pl.x + sx * (w / 2 - 0.25), pl.y - down / 2 - 0.2, sz * (d / 2 - 0.3)));
    } else if (pl.move) hanging(pl, g, fixed, 3);
    return { g, fixed };
  }
  if (look === 'roof') {   // the roof of a garden shed that stands behind the play
    g.add(box(w + 0.3, h, d + 0.3, M('#FFFFFF', { map: tex('roof') }), 0, -h / 2, 0));
    const sh = pl.y - h - floorY + 1;
    fixed.add(box(w - 0.4, sh, 1.6, M('#FFFFFF', { map: tex('wood'), color: '#B89A80' }), pl.x, pl.y - h - sh / 2, -1.5));
    fixed.add(box(0.5, 0.4, 0.05, M('#FFD27A', { emissive: '#FFB040', emissiveIntensity: 2 }), pl.x + w * 0.2, pl.y - h - 0.7, -0.68, { cast: false }));
    return { g, fixed };
  }
  if (look === 'crate') {   // wet cardboard with tape
    g.add(box(w, h, d, M('#B98443', { roughness: 0.9 }), 0, -h / 2, 0));
    g.add(box(w * 0.22, 0.02, d + 0.04, M('#E0C89A'), 0, 0.005, 0, { cast: false }));
    g.add(box(w * 0.22, h * 0.5, 0.02, M('#E0C89A'), 0, -h * 0.25, front, { cast: false }));
    return { g, fixed };
  }
  if (look === 'bus') {   // a city bus seen from the side: windows lit inside, the line number on its front
    g.add(box(w, h, d, M('#E9ECEA', { roughness: 0.5 }), 0, -h / 2, 0));
    g.add(box(w + 0.02, 0.9, d + 0.02, M('#1C2A36', { roughness: 0.15, metalness: 0.3, emissive: '#FFE2A0', emissiveIntensity: 0.35 }), 0, -0.85, 0, { cast: false }));
    g.add(box(w + 0.03, 0.22, d + 0.03, M('#2E8B57'), 0, -1.55, 0, { cast: false }));
    g.add(box(w + 0.03, 0.12, d + 0.03, M('#C9CFCB'), 0, -0.06, 0, { cast: false }));
    const { tex: t, aspect } = textTex('SL40 Xanten', '#FFB13D', { font: '800 26px system-ui, sans-serif', bg: '#140C04' });
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(0.34 * aspect, 0.34), new THREE.MeshBasicMaterial({ map: t, color: new THREE.Color(1.8, 1.8, 1.8) }));
    sign.rotation.y = Math.PI / 2; at(sign, w / 2 + 0.02, -0.28, 0); g.add(sign);
    for (const sx of [-0.32, 0.32]) { const wh = mesh(new THREE.CylinderGeometry(0.42, 0.42, d + 0.06, 14), M('#16191C')); wh.rotation.x = Math.PI / 2; at(wh, sx * w, -h + 0.3, 0); g.add(wh); }
    g.add(box(0.06, 0.18, 0.4, M('#FFF6D8', { emissive: '#FFF0C0', emissiveIntensity: 3 }), w / 2 + 0.02, -h + 0.75, d / 2 - 0.3, { cast: false }));
    const beam = lightCone(1.6, 7, '#FFE9B0', 0.22); beam.rotation.z = Math.PI / 2; at(beam, w / 2 + 0.1, -h + 0.75, 0.2); g.add(beam);
    return { g, fixed };
  }
  if (look === 'awning') {   // a shop's awning; the shop's lit window under it, its wall behind
    g.add(box(w, h, d, M('#FFFFFF', { map: tex('stripes') }), 0, -h / 2, 0));
    g.add(box(w, 0.4, 0.06, M('#FFFFFF', { map: tex('stripes') }), 0, -h - 0.15, front, { cast: false }));
    const wallH = pl.y - floorY + 4;
    fixed.add(box(w + 3, wallH, 1.2, M('#FFFFFF', { map: tex('concrete'), color: '#9A8CA8', ...wet }), pl.x, floorY - 1 + wallH / 2, -2.4));
    fixed.add(box(w - 0.4, 2.2, 0.05, M('#FFE2A8', { emissive: '#FFC870', emissiveIntensity: 0.8 }), pl.x, pl.y - 1.6, -1.78, { cast: false }));
    return { g, fixed };
  }
  if (look === 'buoy') {   // red and white, half in the water
    g.add(cyl(pl.r, pl.r * 0.9, h, M('#EFEDE8', { roughness: 0.5 }), 0, -h / 2, 0, 18));
    g.add(cyl(pl.r * 1.01, pl.r * 0.95, h * 0.34, M('#D6453A', { roughness: 0.5 }), 0, -h * 0.55, 0, 18));
    g.add(cyl(0.05, 0.05, 0.6, M('#3B4650'), 0, 0.3, -pl.r * 0.5, 6));
    g.add(at(mesh(new THREE.SphereGeometry(0.09, 8, 6), M('#FFD040', { emissive: '#FFB020', emissiveIntensity: 2.5 }), { cast: false }), 0, 0.62, -pl.r * 0.5));
    return { g, fixed };
  }
  if (look === 'barge') {   // a Rhine barge: a dark hull, a wooden deck, a cabin with a lit window at the back
    g.add(box(w, h, d, M('#FFFFFF', { map: tex('hull') }), 0, -h / 2, 0));
    g.add(box(w + 0.04, 0.1, d + 0.04, M('#C4382E'), 0, -0.35, 0, { cast: false }));
    g.add(box(w - 0.2, 0.06, d - 0.2, M('#FFFFFF', { map: tex('wood') }), 0, 0.0, 0, { cast: false }));
    g.add(box(1, 0.9, 0.9, M('#E8E2D6'), -w / 2 + 0.7, 0.45, -d / 2 + 0.3));
    g.add(box(0.4, 0.28, 0.03, M('#FFD9A0', { emissive: '#FFB860', emissiveIntensity: 2 }), -w / 2 + 0.7, 0.55, -d / 2 + 0.77, { cast: false }));
    return { g, fixed };
  }
  if (look === 'block' || look === 'disc') {   // a carved stone (the round one is a mosaic on an arm)
    g.add(box(w, h, d, M('#FFFFFF', { map: tex('stone'), color: look === 'disc' ? '#E8C890' : '#FFFFFF' }), 0, -h / 2, 0));
    if (pl.move && !pl.orbit) hanging(pl, g, fixed, 3.4);
    return { g, fixed };
  }
  g.add(box(w, h, d, M('#C0B8A8'), 0, -h / 2, 0));
  return { g, fixed };
}
// a platform that moves on ropes: a line above it across the way it goes, and the ropes it hangs by
function hanging(pl, g, fixed, up) {
  const to = pl.move.to, w = pl.t === 'cyl' ? pl.r * 2 : pl.w, rope = M('#E8E0D0', { roughness: 1 });
  if (Math.abs(to[0]) > 0.01) {
    const len = Math.abs(to[0]) + w + 3, mid = pl.x + to[0] / 2;
    const line = mesh(new THREE.CylinderGeometry(0.03, 0.03, len, 5), rope, { cast: false }); line.rotation.z = Math.PI / 2; at(line, mid, pl.y + up, -0.4); fixed.add(line);
    for (const s of [-1, 1]) fixed.add(box(0.14, up + 6, 0.14, M('#6E7880', { metalness: 0.4 }), mid + s * len / 2, pl.y + up - (up + 6) / 2 + 0.2, -0.4));
    for (const s of [-1, 1]) g.add(box(0.03, up, 0.03, rope, s * w * 0.35, up / 2, -0.4, { cast: false }));
  } else {   // a lift: the ropes go up out of sight
    for (const s of [-1, 1]) g.add(box(0.04, 30, 0.04, rope, s * w * 0.4, 15, -0.3, { cast: false }));
  }
}

/* ---------------- what lies below ---------------- */
export function makeBelow(th, x0, x1, floorY, time) {
  const g = new THREE.Group(), b = th.below, W = x1 - x0 + 160, mid = (x0 + x1) / 2;
  if (b.kind === 'water' || b.kind === 'foam') {
    const geo = new THREE.PlaneGeometry(W, 120, Math.round(W / 2), 48);
    const m = new THREE.MeshStandardMaterial({ color: b.c, roughness: b.kind === 'foam' ? 0.7 : 0.3, metalness: b.kind === 'foam' ? 0 : 0.05, flatShading: true });
    m.onBeforeCompile = (sh) => {
      sh.uniforms.uTime = time;
      sh.vertexShader = 'uniform float uTime;\n' + sh.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>
        transformed.z += sin(position.x * 0.7 + uTime * 1.3) * 0.09 + cos(position.y * 0.9 + uTime * 0.9) * 0.08 ${b.kind === 'foam' ? '+ sin(position.x * 2.3 - uTime * 2.) * cos(position.y * 2.1) * 0.12' : ''};`);
    };
    const sea = new THREE.Mesh(geo, m); sea.rotation.x = -Math.PI / 2; sea.receiveShadow = true; at(sea, mid, floorY, -30); g.add(sea);
  } else {
    const ground = mesh(new THREE.PlaneGeometry(W, 120), M(b.c, { roughness: th.wet ? 0.2 : 0.95, metalness: th.wet ? 0.3 : 0 }), { cast: false });
    ground.rotation.x = -Math.PI / 2; at(ground, mid, floorY - 1.4, -30); g.add(ground);
    const r = rng(17);
    if (b.kind === 'bushes' || b.kind === 'field') {   // hedges or tall grass along the bottom, before and behind the play
      const n = Math.round(W / (b.kind === 'field' ? 0.5 : 1.4));
      const geo = b.kind === 'field' ? new THREE.ConeGeometry(0.12, 1.6, 4) : new THREE.IcosahedronGeometry(1, 0);
      const inst = new THREE.InstancedMesh(geo, M('#FFFFFF', { flatShading: true }), n * 2);
      const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), c = new THREE.Color();
      for (let i = 0; i < n * 2; i++) {
        const z = i < n ? 2.5 + r() * 3 : -2.5 - r() * 6, s = b.kind === 'field' ? 0.6 + r() * 0.9 : 0.5 + r() * 0.8;
        q.setFromAxisAngle(new THREE.Vector3(0, 0, 1), (r() - 0.5) * (b.kind === 'field' ? 0.5 : 2));
        m4.compose(new THREE.Vector3(x0 - 80 + r() * W, floorY - 0.6 + s * 0.3, z), q, new THREE.Vector3(s, s, s)); inst.setMatrixAt(i, m4);
        inst.setColorAt(i, c.set(b.kind === 'field' ? (r() > 0.5 ? '#5A4826' : '#3A4822') : (r() > 0.5 ? '#3E6038' : '#2E4C2E')));
      }
      inst.receiveShadow = true; g.add(inst);
    }
  }
  if (b.mist) {   // mist lies over it in layers, before and behind the play
    for (const [z, op] of [[4, 0.55], [-1.5, 0.75], [-7, 0.85], [-16, 0.9]]) { const m = mistBand(W, 5, b.mist, op); at(m, mid, floorY + 0.6, z); m.userData.drift = z * 0.03 + 0.2; g.add(m); }
  }
  return g;
}

/* ---------------- the scenery ---------------- */
// Many boxes of one kind in one draw (houses in a row, windows): a list of [x, y, z, w, h, d, colour]
function boxes(list, material, { cast = false, receive = false, geo = new THREE.BoxGeometry(1, 1, 1) } = {}) {
  const inst = new THREE.InstancedMesh(geo, material, list.length), m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), c = new THREE.Color();
  list.forEach(([x, y, z, w, h, d, col, rot = 0], i) => { q.setFromAxisAngle(new THREE.Vector3(0, 0, 1), rot); m4.compose(new THREE.Vector3(x, y, z), q, new THREE.Vector3(w, h, d)); inst.setMatrixAt(i, m4); inst.setColorAt(i, c.set(col)); });
  inst.castShadow = cast; inst.receiveShadow = receive;
  return inst;
}
const glowMat = (k = 1) => new THREE.MeshBasicMaterial({ color: new THREE.Color(k, k, k) });

// A row of buildings from x0 to x1 at depth z: heights between h0 and h1, lit windows (share `lit`) in `warm` colours
function street(list, wins, r, { x0, x1, z, y0, h0, h1, w0 = 3, w1 = 6, d = 4, cols, lit = 0.3, warm = ['#FFD28A', '#FFC060', '#9FD8FF'], gapMax = 0.6, roofs = 0, roofC = '#2A1A1A', wy = 1.2, wx = 1.1, ws = 1, shops = null, shopList = wins }) {
  for (let x = x0; x < x1;) {
    const w = w0 + r() * (w1 - w0), h = h0 + r() * (h1 - h0), cx = x + w / 2;
    list.push([cx, y0 + h / 2, z, w, h, d, cols[(r() * cols.length) | 0]]);
    if (roofs && r() < roofs) list.push([cx, y0 + h + w * 0.18, z, w * 0.72, w * 0.72, d * 0.9, roofC, Math.PI / 4]);
    if (shops) for (let sx = x + 0.9; sx < x + w - 1.2; sx += 2.2) if (r() < 0.7) shopList.push([sx + 0.8, y0 + 1.6, z + d / 2 + 0.03, 1.5, 1.6, 0.02, shops[(r() * shops.length) | 0]]);   // lit shop windows on the street
    for (let wy0 = y0 + (shops ? 4.4 : 1.2); wy0 < y0 + h - 0.8; wy0 += wy) for (let wx0 = x + 0.7; wx0 < x + w - 0.6; wx0 += wx) {
      if (r() < lit) wins.push([wx0 + 0.25, wy0, z + d / 2 + 0.02, 0.5 * ws, 0.6 * ws, 0.02, warm[(r() * warm.length) | 0]]);
    }
    x += w + r() * gapMax;
  }
}
function tree(list, r, x, y, z, s, col) {   // a poplar or a round tree: a few boxes, turned a little
  list.push([x, y + s * 0.5, z, 0.25 * s, s, 0.25 * s, '#3A2A20']);
  for (let i = 0; i < 3; i++) list.push([x + (r() - 0.5) * s * 0.5, y + s * (1 + i * 0.35), z, s * (0.9 - i * 0.2), s * 0.6, s * 0.7, col, r() * 0.6]);
}
function sign(text, color, x, y, z, height = 1.3) {
  const { tex: t, aspect } = textTex(text, color);
  const g = new THREE.Group(); at(g, x, y, z);
  const face = new THREE.Mesh(new THREE.PlaneGeometry(height * aspect, height), new THREE.MeshBasicMaterial({ map: t, transparent: true, color: new THREE.Color(2.2, 2.2, 2.2), depthWrite: false }));
  face.position.z = 0.08; g.add(face);
  g.add(at(mesh(new THREE.BoxGeometry(height * aspect * 0.92, height * 0.86, 0.1), M('#0A0A10', { roughness: 0.6 }), { cast: false }), 0, 0, 0));
  g.userData.neon = face.material; g.userData.flick = (x * 7.13) % 1;
  return g;
}
function lampPost(x, y, z, color, floorY, kind) {
  const g = new THREE.Group(), pole = M('#2A2E36', { metalness: 0.5, roughness: 0.5 });
  if (kind === 'tube') {   // a fluorescent tube on the ceiling
    g.add(box(2.4, 0.16, 0.3, M(color, { emissive: color, emissiveIntensity: 3.2 }), x, y, z, { cast: false }));
    const cone = lightCone(2.6, y - floorY + 1, color, 0.16); cone.scale.set(1.6, 1, 0.6); at(cone, x, y, z); g.add(cone);
    return g;
  }
  g.add(box(0.16, y - floorY + 1.2, 0.16, pole, x, (y + floorY - 1.2) / 2, z));
  g.add(box(1.1, 0.1, 0.1, pole, x + 0.5, y + 0.1, z));
  g.add(box(0.5, 0.14, 0.34, M(color, { emissive: color, emissiveIntensity: 3.5 }), x + 0.9, y, z, { cast: false }));
  const cone = lightCone(2.2, 7, color, 0.2); at(cone, x + 0.9, y - 0.05, z); g.add(cone);
  return g;
}

// The scenery of a level: far layers behind (they move slower: the depth), the things beside the play and a few dark
// shapes in front (they move faster). Returns the group and what moves by itself (cars, clouds, mist, signs).
export function makeScenery(L, th, x0, x1, floorY) {
  const g = new THREE.Group(), r = rng(L.id.length * 131 + L.platforms.length), live = { neon: [], drift: [], cars: [], spin: [], sway: [], blink: [], glitter: null };
  const far = [], mid = [], near = [], wins = [], farWins = [], shopWins = [], dark = [], fore = [];
  const X0 = x0 - 45, X1 = x1 + 45;
  const add = (...o) => { g.add(...o); return o[0]; };

  if (L.theme === 'laundry') {
    // the laundromat: a tiled back wall with big windows onto the street, a ledge with washing machines along it,
    // tubes on the ceiling
    const wall = M('#FFFFFF', { map: tex('tiles'), color: '#5E7484' }), top = floorY + 17, wins0 = [];
    for (let x = X0 + 8; x < X1; x += 22) wins0.push(x);
    let from = X0;
    for (const x of wins0) {
      add(box(x - 4.65 - from, top - floorY + 1, 1, wall, (from + x - 4.65) / 2, (top + floorY - 1) / 2, -6.2, { cast: false }));
      add(box(9.3, 3.15 - floorY + 1, 1, wall, x, (3.15 + floorY - 1) / 2, -6.2, { cast: false }), box(9.3, top - 7.65, 1, wall, x, (top + 7.65) / 2, -6.2, { cast: false }));
      from = x + 4.65;
    }
    add(box(X1 - from, top - floorY + 1, 1, wall, (from + X1) / 2, (top + floorY - 1) / 2, -6.2, { cast: false }));
    add(box(X1 - X0, 0.6, 4.4, M('#1E2630'), (X0 + X1) / 2, 11.6, -3.6, { cast: false }));
    add(box(X1 - X0, -floorY + 0.01, 2, M('#FFFFFF', { map: tex('tiles'), color: '#6E8494' }), (X0 + X1) / 2, floorY / 2, -4.6, { cast: false }));
    for (let x = X0 + 1; x < X1; x += 2.3) {
      mid.push([x, 1.05, -4.6, 2.1, 2.1, 1.6, r() > 0.85 ? '#DCE6EE' : '#EEF2F5']);
      wins.push([x, 1.15, -3.78, 1.0, 1.0, 0.02, r() > 0.6 ? '#2B6A90' : '#1D3A52']);
      wins.push([x + 0.6, 1.92, -3.78, 0.3, 0.1, 0.02, r() > 0.5 ? '#56E0FF' : '#7CFF8A']);
    }
    for (let x = X0 + 8; x < X1; x += 22) {   // big windows onto the rainy street, with a car's lights going by
      add(box(9, 4.4, 0.05, M('#6A90B8', { transparent: true, opacity: 0.16, roughness: 0.05, metalness: 0.3 }), x, 5.4, -5.62, { cast: false }));
      add(box(9.3, 0.18, 0.2, M('#5E6B75'), x, 3.15, -5.6), box(9.3, 0.18, 0.2, M('#5E6B75'), x, 7.65, -5.6));
      for (let k = 0; k < 4; k++) add(box(0.12, 4.4, 0.2, M('#5E6B75'), x - 4.5 + k * 3, 5.4, -5.6));
      street(dark, wins, r, { x0: x - 9, x1: x + 9, z: -12, y0: floorY, h0: 9, h1: 14, w0: 2, w1: 4, d: 2, cols: ['#0A1424', '#0E1A2E', '#101C30'], lit: 0.4, wy: 1, wx: 0.9 });
    }
    for (let x = X0 + 4; x < X1; x += 9) if (!(L.lamps || []).some((l) => Math.abs(l[0] - x) < 4.5)) g.add(lampPost(x, 11, -1.5, '#E6F6FF', floorY, 'tube'));
  } else if (L.theme === 'yard') {
    street(far, farWins, r, { x0: X0, x1: X1, z: -55, y0: floorY, h0: 6, h1: 12, w0: 4, w1: 8, d: 4, cols: ['#3A2440', '#2E1E36', '#40284A'], lit: 0.12, roofs: 0.8, roofC: '#2E1C34' });
    for (let x = X0; x < X1; x += 2 + r() * 3) tree(far, r, x, floorY, -38, 2.5 + r() * 2.5, '#3A2A48');
    street(mid, wins, r, { x0: X0, x1: X1, z: -16, y0: floorY, h0: 7, h1: 11, w0: 5, w1: 8, d: 5, cols: ['#8A4A3A', '#7A4030', '#94523E'], lit: 0.3, roofs: 1, roofC: '#4A2A2A', gapMax: 3, ws: 0.8 });
    for (let x = X0 + 3; x < X1; x += 6 + r() * 5) tree(near, r, x, floorY, -7 - r() * 3, 2.2 + r() * 1.6, r() > 0.5 ? '#2E5A2A' : '#3A6A30');
    for (let x = X0 + 2; x < X1; x += 1.4) near.push([x, floorY + 2.2, -4, 0.12, 4.4, 0.12, '#6A4A34']);
    near.push([(X0 + X1) / 2, floorY + 3.6, -4, X1 - X0, 0.12, 0.08, '#6A4A34'], [(X0 + X1) / 2, floorY + 1.8, -4, X1 - X0, 0.12, 0.08, '#6A4A34']);
    for (let x = X0 + 10; x < X1; x += 16) {   // a washing line between two poles with shirts on it
      near.push([x, 3.5, -2.8, 0.14, 7, 0.14, '#9AA6AD'], [x + 9, 3.5, -2.8, 0.14, 7, 0.14, '#9AA6AD'], [x + 4.5, 6.6, -2.8, 9, 0.04, 0.04, '#E8E0D0']);
      for (let k = 0; k < 4; k++) { const s = new THREE.Group(), c = ['#F6F8FA', '#2F6FD6', '#D6453A', '#F2C230', '#2E9B4B'][(k + Math.round(x)) % 5]; at(s, x + 1.4 + k * 2, 6.55, -2.8); s.add(box(0.8, 0.9, 0.04, M(c, { roughness: 1 }), 0, -0.6, 0), box(1.3, 0.28, 0.04, M(c, { roughness: 1 }), 0, -0.22, 0)); s.userData.sway = k + x; live.sway.push(s); g.add(s); }
    }
    for (let x = X0 + 6; x < X1; x += 1.1) if (r() < 0.8) fore.push([x, floorY + 0.4, 5, 0.1, 1 + r() * 1.4, 0.1, '#120E18', (r() - 0.5) * 0.5]);   // tall grass in front
  } else if (L.theme === 'street') {
    // far towers full of small windows, blinking red lights on top; shops with signs; cars on the road behind
    street(far, farWins, r, { x0: X0 - 20, x1: X1 + 20, z: -70, y0: floorY, h0: 14, h1: 34, w0: 4, w1: 9, d: 6, cols: ['#1A1630', '#1E1A38', '#16142A'], lit: 0.16, warm: ['#8FA8E8', '#B8C8F0', '#E8C890'], wy: 1.4, wx: 1.2, ws: 0.6 });
    street(mid, wins, r, { x0: X0, x1: X1, z: -15, y0: floorY, h0: 9, h1: 16, w0: 5, w1: 9, d: 5, cols: ['#5A4E7A', '#4E446E', '#625684'], lit: 0.22, warm: ['#FFD28A', '#FF9AD0', '#8AE8FF', '#FFC060'], gapMax: 0.3, wy: 1.6, wx: 1.5, ws: 0.9,
      shops: ['#FFB870', '#FF7AB8', '#7AD8F0', '#FFE0A0'], shopList: shopWins });
    for (let x = X0; x < X1; x += 18 + r() * 10) live.blink.push(add(at(mesh(new THREE.SphereGeometry(0.4, 6, 4), glowMat(3).clone(), { cast: false }), x, floorY + 24 + r() * 10, -69)));
    live.blink.forEach((m) => m.material.color.setRGB(3, 0.2, 0.2));
    add(box(X1 - X0, 0.2, 6, M('#16141C', { roughness: 0.2, metalness: 0.3 }), (X0 + X1) / 2, floorY - 0.4, -8, { cast: false }));
    for (let k = 0; k < 5; k++) {   // cars: two lights in front, two red ones at the back
      const car = new THREE.Group(), dir = k % 2 ? 1 : -1, z = dir > 0 ? -7 : -9;
      car.add(box(3.2, 1, 1.6, M('#14121C', { roughness: 0.3, metalness: 0.4 }), 0, 0.7, 0), box(1.8, 0.7, 1.4, M('#14121C'), -0.2 * dir, 1.5, 0));
      car.add(box(0.1, 0.18, 0.3, glowMat(4).clone(), dir * 1.62, 0.7, 0.5, { cast: false }), box(0.1, 0.18, 0.3, glowMat(4).clone(), dir * 1.62, 0.7, -0.5, { cast: false }));
      const tail = new THREE.MeshBasicMaterial({ color: new THREE.Color(3, 0.15, 0.1) });
      car.add(at(mesh(new THREE.BoxGeometry(0.1, 0.16, 0.3), tail, { cast: false }), -dir * 1.62, 0.75, 0.5), at(mesh(new THREE.BoxGeometry(0.1, 0.16, 0.3), tail, { cast: false }), -dir * 1.62, 0.75, -0.5));
      const beam = lightCone(1.4, 6, '#FFF2C8', 0.18); beam.rotation.z = -dir * Math.PI / 2; at(beam, dir * 1.7, 0.7, 0); car.add(beam);
      at(car, X0 + r() * (X1 - X0), floorY - 0.3, z); car.userData.v = dir * (5 + r() * 5); car.userData.span = [X0 - 10, X1 + 10];
      live.cars.push(add(car));
    }
    for (let x = X0 + 4; x < X1; x += 16) fore.push([x, 6, 6, 0.24, 30, 0.24, '#08060E']);
    fore.push([(X0 + X1) / 2, 13.5, 6, X1 - X0, 0.05, 0.05, '#08060E'], [(X0 + X1) / 2, 14.2, 6, X1 - X0, 0.05, 0.05, '#08060E']);
    const stop = L.checkpoints[0];   // the bus stop: a shelter behind the checkpoint
    if (stop) { add(box(3.4, 0.14, 1.4, M('#3A4048', { metalness: 0.5 }), stop[0] + 1.2, stop[1] + 3, -1.8)); add(box(0.1, 3, 0.1, M('#3A4048'), stop[0] - 0.4, stop[1] + 1.5, -2.4)); add(box(0.1, 3, 0.1, M('#3A4048'), stop[0] + 2.8, stop[1] + 1.5, -2.4)); add(box(3.2, 2.2, 0.04, M('#8AA8C0', { transparent: true, opacity: 0.25, roughness: 0.05 }), stop[0] + 1.2, stop[1] + 1.6, -2.45, { cast: false })); }
  } else if (L.theme === 'rhine') {
    // the far bank with Xanten's cathedral, the bridge in the haze, piles and reeds
    for (let x = X0 - 30; x < X1 + 30; x += 1.5 + r() * 2) tree(far, r, x, floorY, -75 - r() * 10, 2 + r() * 3, '#8E8A9A');
    const dom = (X0 + X1) * 0.42;
    for (const sx of [-2.2, 2.2]) { far.push([dom + sx, floorY + 9, -70, 3, 18, 3, '#7E7A8C']); far.push([dom + sx, floorY + 20, -70, 2.1, 4, 2.1, '#6E6A7C', Math.PI / 4]); }
    far.push([dom - 8, floorY + 6, -72, 12, 12, 4, '#848092']);
    const bz = -30;
    mid.push([(X0 + X1) / 2, 9, bz, X1 - X0 + 60, 0.8, 3, '#7A7690']);
    for (let x = X0 - 30; x < X1 + 30; x += 28) {
      mid.push([x, (floorY + 9) / 2, bz, 1.8, 9 - floorY, 3, '#726E86']);
      for (let k = 1; k < 14; k++) { const a = (k / 14) * Math.PI, ax = x + 14 - Math.cos(a) * 14, ay = 9.4 + Math.sin(a) * 6; mid.push([ax, ay, bz, 1.6, 0.35, 0.5, '#6E6A82', Math.atan2(6 * Math.cos(a), 14 * Math.sin(a))]); if (k % 2) mid.push([ax, (ay + 9.4) / 2, bz, 0.12, ay - 9.4, 0.12, '#6E6A82']); }
    }
    for (let x = X0; x < X1; x += 0.5 + r() * 1.2) fore.push([x, floorY - 0.2, 5.5 + r() * 2, 0.07, 0.8 + r() * 1.2, 0.07, '#3A4A40', (r() - 0.5) * 0.4]);
    const glit = [];
    for (let i = 0; i < 260; i++) { const z = -2 - Math.pow(r(), 1.6) * 40; glit.push([X0 + r() * (X1 - X0), floorY + 0.06, z, 0.5 + r() * 1.4, 0.06, 0.12, r() > 0.3 ? '#FFE6C8' : '#FFFFFF']); }
    live.glitter = add(boxes(glit, new THREE.MeshBasicMaterial({ color: new THREE.Color(1.3, 1.3, 1.3), transparent: true, opacity: 0.8, depthWrite: false, blending: THREE.AdditiveBlending })));
    live.glitter.userData.base = glit;
    for (const z of [-6, -12, -20]) { const m = mistBand(X1 - X0 + 120, 6, '#F2E2DA', 0.32); at(m, (X0 + X1) / 2, floorY + 1.2, z); m.userData.drift = 0.25; live.drift.push(add(m)); }
  } else if (L.theme === 'roman') {
    // the amphitheatre far away, the city gate, the temple on its podium, poplars; light falls in shafts
    for (let x = X0 - 20; x < X1 + 20; x += 3.2) { far.push([x, floorY + 5, -60, 0.9, 10, 3, '#B8805A']); far.push([x + 1.6, floorY + 9.4, -60, 2.4, 1.2, 3, '#B8805A']); far.push([x + 1.6, floorY + 3.6, -60, 2.4, 0.9, 3, '#B07A56']); }
    far.push([(X0 + X1) / 2, floorY + 10.8, -60, X1 - X0 + 40, 1.2, 3, '#A8724E']);
    const gate = X0 + 30;
    mid.push([gate - 4, floorY + 6, -30, 3, 12, 3, '#D8B488'], [gate + 4, floorY + 6, -30, 3, 12, 3, '#D8B488'], [gate, floorY + 13, -30, 12, 2.4, 3.2, '#D0AC80'], [gate, floorY + 3, -32, 70, 6, 1.5, '#C8A47A']);
    const tx = (X0 + X1) * 0.55;
    mid.push([tx, floorY + 2, -18, 18, 4, 9, '#E8D2AE']);
    for (let k = 0; k < 7; k++) mid.push([tx - 7.5 + k * 2.5, floorY + 8, -14.2, 0.9, 8, 0.9, '#F2E4C8']);
    mid.push([tx, floorY + 12.4, -16, 19, 0.8, 9, '#E0C8A0'], [tx, floorY + 13.6, -16, 13, 13, 8.6, '#D8BE94', Math.PI / 4]);
    for (let x = X0; x < X1; x += 5 + r() * 7) { const s = 3 + r() * 2.5, z = -12 - r() * 10; near.push([x, floorY + s * 0.4, z, 0.3, s * 0.8, 0.3, '#4A3420']); for (let k = 0; k < 4; k++) near.push([x, floorY + s * (0.9 + k * 0.45), z, s * (0.55 - k * 0.1), s * 0.6, s * 0.4, '#5A6234', 0.1 * (k - 1.5)]); }
    for (let x = X0 + 5; x < X1; x += 9) fore.push([x, floorY + 0.1, 5.5, 0.9, 0.7, 0.8, '#5A3A22', 0.2], [x + 0.9, floorY - 0.1, 5.5, 0.6, 0.4, 0.6, '#4A3020']);
    for (let x = X0; x < X1; x += 9) { const ray = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 40), new THREE.MeshBasicMaterial({ color: '#FFD9A0', transparent: true, opacity: 0.07, depthWrite: false, blending: THREE.AdditiveBlending, fog: false })); ray.rotation.z = -0.55; at(ray, x, 8, -10 - (x % 3) * 4); ray.renderOrder = 5; add(ray); }
  } else if (L.theme === 'mill') {
    // the fields, Xanten far away against the storm, the mill's tower behind its sails
    for (let x = X0 - 30; x < X1 + 30; x += 1.2 + r() * 2.5) tree(far, r, x, floorY, -60 - r() * 10, 1.5 + r() * 2, '#2A1A26');
    const dom = (X0 + X1) * 0.62;
    for (const sx of [-2, 2]) { far.push([dom + sx, floorY + 8, -64, 2.8, 16, 2.8, '#24162A']); far.push([dom + sx, floorY + 18, -64, 2, 4, 2, '#1E1224', Math.PI / 4]); }
    street(far, wins, r, { x0: dom - 20, x1: dom + 20, z: -66, y0: floorY, h0: 3, h1: 6, w0: 2, w1: 4, d: 3, cols: ['#24162A', '#2A1A2E'], lit: 0.2, roofs: 1 });
    const hub = L.platforms.find((p) => p.hub);
    if (hub) {
      const [hx, hy] = hub.hub, th2 = hy - floorY + 1.6;
      add(cyl(1.7, 2.6, th2, M('#FFFFFF', { map: tex('brick'), color: '#B07060' }), hx, floorY - 1.6 + th2 / 2, -3.2, 14));
      add(at(mesh(new THREE.ConeGeometry(2.1, 2.4, 14), M('#3A2A24')), hx, hy + 1.2, -3.2));
      add(box(0.6, 0.9, 0.1, M('#FFD9A0', { emissive: '#FFB060', emissiveIntensity: 2 }), hx + 0.8, hy - 1.6, -1.25, { cast: false }));
    }
    for (let x = X0; x < X1; x += 3 + r() * 5) tree(near, r, x, floorY, -10 - r() * 6, 1.8 + r() * 1.4, '#2A2A1E');
    for (let x = X0 + 4; x < X1; x += 12) fore.push([x, floorY + 0.6, 5.5, 0.16, 2.4, 0.16, '#0E0A0C'], [x + 1.2, floorY + 1.4, 5.5, 2.6, 0.1, 0.1, '#0E0A0C']);
  }

  // signs and lamps from the level
  for (const [text, x, y, z, color] of L.signs || []) { const s = sign(text, color, x, y, z, L.theme === 'laundry' ? 0.9 : 1.3); live.neon.push(s); add(s); }
  for (const [x, y, z, color] of L.lamps || []) add(lampPost(x, y, z, color, floorY, L.theme === 'laundry' ? 'tube' : 'post'));

  const lit = (list, o) => { if (list.length) add(boxes(list, M('#FFFFFF', { roughness: 0.9 }), o)); };
  lit(far); lit(mid, { receive: true }); lit(near, { receive: true, cast: true });
  if (dark.length) add(boxes(dark, M('#FFFFFF', { basic: true })));
  if (wins.length) add(boxes(wins, new THREE.MeshBasicMaterial({ color: new THREE.Color(1.6, 1.6, 1.6) })));
  if (farWins.length) add(boxes(farWins, new THREE.MeshBasicMaterial({ color: new THREE.Color(0.75, 0.75, 0.75) })));
  if (shopWins.length) add(boxes(shopWins, new THREE.MeshBasicMaterial({ color: new THREE.Color(0.55, 0.55, 0.55) })));
  if (fore.length) add(boxes(fore, new THREE.MeshBasicMaterial({ color: '#FFFFFF', fog: false })));
  return { g, live };
}
