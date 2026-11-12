// The 3D part of "Пригоди шкарпетки": draws a level with three.js (kept in assets/three), steps the rules of physics.js
// 120 times a second and follows the sock with the camera. The page (igry/hop.js) gives it the stick and the jump and
// shows what it reports: letters, checkpoints, falls, the goal. Low-poly, soft and round, in the colours of the app.
import * as THREE from '../../assets/three/r185/three.module.min.js';
import { K, createWorld, step, pose } from './physics.js?v=1';

export function webgl() {
  try { const c = document.createElement('canvas'); return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl'))); } catch (e) { return false; }
}

/* ---------------- colours of each place ---------------- */
const ART = { der: '#2F6FD6', die: '#D6453A', das: '#2E9B4B' };
const THEMES = {
  laundry: { sky: ['#9FD3F0', '#E9F6FC'], sea: '#CFEAF7', seaNight: '#2B4C63', foam: true, sun: '#FFF4E0',
    looks: { tiles: ['#F4F7FA', '#9CB3C4'], machine: ['#FBFCFD', '#E3E9EE'], powder: ['#FFFFFF', '#F08A24'], basket: ['#D9A35F', '#B87E3E'] } },
  yard: { sky: ['#8CCBF2', '#F3F0DC'], sea: '#8CCB6E', seaNight: '#1F3A2A', ground: true, splash: '#6DBE4B', sun: '#FFF1D2',
    looks: { grass: ['#6DBE4B', '#8B5E3C'], basket: ['#E2B46E', '#C08A45'], bench: ['#C68A52', '#7A5232'], spring: ['#E04B3C', '#3B4650'] } },
  street: { sky: ['#9CC8EE', '#F6EBDD'], sea: '#8A8F94', seaNight: '#262B31', ground: true, splash: '#C9C3B8', sun: '#FFF0DA',
    looks: { pave: ['#D9D2C7', '#A79C8E'], bus: ['#F4F4F2', '#2E8B57'], crate: ['#D9A45E', '#B98443'], roof: ['#C8553D', '#8E3A2A'], spring: ['#E04B3C', '#3B4650'] } },
  rhine: { sky: ['#7FB7E6', '#F2E6D3'], sea: '#3E87B6', seaNight: '#163650', sun: '#FFE9C6',
    looks: { plank: ['#C99A63', '#8B6340'], barge: ['#B9875A', '#2F3E4C'], buoy: ['#F2F2EF', '#D6453A'], stone: ['#C9C3B8', '#8F877B'], crate: ['#D9A45E', '#B98443'] } },
  roman: { sky: ['#F2C38B', '#FBEBD6'], sea: '#A9C98A', seaNight: '#2A3A22', ground: true, splash: '#D9C9A8', sun: '#FFE1B5',
    looks: { stone: ['#E8DCC6', '#B8A486'], column: ['#F2EBDD', '#D7CAB2'], disc: ['#E0A458', '#9B6B3A'], spring: ['#D6453A', '#5A4A3A'], crate: ['#D9A45E', '#B98443'] } },
  mill: { sky: ['#F0A27A', '#FBE3C8'], sea: '#93C26A', seaNight: '#22361F', ground: true, splash: '#7FBF55', sun: '#FFD9B0',
    looks: { grass: ['#7FBF55', '#7A5638'], brick: ['#C46A4A', '#8E4632'], plank: ['#C99A63', '#8B6340'], sail: ['#EFE6D2', '#8B6340'], crate: ['#D9A45E', '#B98443'], spring: ['#2F6FD6', '#3B4650'] } },
};
const NIGHT = { sky: ['#0E1B33', '#2A3B5E'], sun: '#BFD2FF' };

/* ---------------- shapes ---------------- */
// a box with round edges (the idea of three.js's RoundedBoxGeometry, MIT): a split cube whose points are pushed onto a
// smaller box plus a sphere of radius r
function rbox(w, h, d, r, seg = 3) {
  r = Math.max(0.001, Math.min(r, w / 2, h / 2, d / 2));
  const n = seg * 2 + 1, g = new THREE.BoxGeometry(1, 1, 1, n, n, n), pos = g.attributes.position, nor = g.attributes.normal, hs = 0.5 / n;
  const bx = w / 2 - r, by = h / 2 - r, bz = d / 2 - r, v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const sx = Math.sign(v.x), sy = Math.sign(v.y), sz = Math.sign(v.z);
    v.set(v.x - sx * hs, v.y - sy * hs, v.z - sz * hs).normalize();
    pos.setXYZ(i, bx * sx + v.x * r, by * sy + v.y * r, bz * sz + v.z * r);
    nor.setXYZ(i, v.x, v.y, v.z);
  }
  return g;
}
const mats = new Map();
function mat(color, o = {}) {
  const key = color + JSON.stringify(o);
  if (!mats.has(key)) { const m = new THREE.MeshStandardMaterial({ color, roughness: 0.82, metalness: 0, ...o }); m.userData.shared = true; mats.set(key, m); }
  return mats.get(key);
}
function mesh(geo, material, { cast = true, receive = true } = {}) {
  const m = new THREE.Mesh(geo, material); m.castShadow = cast; m.receiveShadow = receive; return m;
}
function at(obj, x, y, z) { obj.position.set(x, y, z); return obj; }

/* ---------------- the sock ---------------- */
function makeSock(main = '#F2C230', stripe = '#2F5DB3', toe = '#D6453A') {
  const g = new THREE.Group(), body = new THREE.Group();
  g.add(body);
  const leg = mesh(new THREE.CapsuleGeometry(0.25, 0.42, 6, 20), mat(main, { roughness: 0.95 }));
  at(leg, 0, 0.46, 0); body.add(leg);
  const foot = mesh(new THREE.CapsuleGeometry(0.21, 0.24, 6, 18), mat(main, { roughness: 0.95 }));
  foot.rotation.x = Math.PI / 2; at(foot, 0, 0.21, 0.17); body.add(foot);
  const toeCap = mesh(new THREE.SphereGeometry(0.215, 18, 12, 0, Math.PI * 2, 0, Math.PI / 2), mat(toe, { roughness: 0.95 }));
  toeCap.rotation.x = Math.PI / 2; at(toeCap, 0, 0.21, 0.29); body.add(toeCap);
  const heel = mesh(new THREE.SphereGeometry(0.255, 18, 12, 0, Math.PI * 2, 0, Math.PI / 2.4), mat(toe, { roughness: 0.95 }));
  heel.rotation.x = -Math.PI / 2; at(heel, 0, 0.24, -0.02); body.add(heel);
  for (const y of [0.58, 0.7]) { const s = mesh(new THREE.CylinderGeometry(0.262, 0.262, 0.07, 24, 1, true), mat(stripe, { roughness: 0.9, side: THREE.DoubleSide })); at(s, 0, y, 0); body.add(s); }
  const cuff = mesh(new THREE.TorusGeometry(0.22, 0.06, 10, 24), mat(stripe, { roughness: 0.9 }));
  cuff.rotation.x = Math.PI / 2; at(cuff, 0, 0.86, 0); body.add(cuff);
  const eyes = new THREE.Group(); at(eyes, 0, 0.66, 0.2); body.add(eyes);
  for (const s of [-1, 1]) {
    const e = mesh(new THREE.SphereGeometry(0.075, 14, 10), mat('#FFFFFF', { roughness: 0.4 }), { cast: false });
    at(e, s * 0.095, 0, 0.02); eyes.add(e);
    const p = mesh(new THREE.SphereGeometry(0.04, 10, 8), mat('#1B1F24', { roughness: 0.3 }), { cast: false });
    at(p, s * 0.095, 0.005, 0.085); eyes.add(p);
  }
  g.userData = { body, eyes };
  return g;
}

/* ---------------- letters: a tile in the colour of the article, the letter on both sides ---------------- */
function letterTexture(ch, color) {
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const x = c.getContext('2d');
  x.fillStyle = color; x.fillRect(0, 0, 128, 128);
  x.fillStyle = '#FFFFFF'; x.textAlign = 'center'; x.textBaseline = 'middle';
  x.font = '700 84px Unbounded, "Arial Black", system-ui, sans-serif';
  x.fillText(ch, 64, 70);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  return t;
}
function makeLetter(ch, color) {
  const g = new THREE.Group();
  const tile = mesh(rbox(0.66, 0.66, 0.16, 0.08, 2), mat(color, { roughness: 0.5, emissive: color, emissiveIntensity: 0.25 }));
  g.add(tile);
  const tex = letterTexture(ch, color);
  for (const s of [1, -1]) {
    const face = new THREE.Mesh(new THREE.PlaneGeometry(0.54, 0.54), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.5, emissive: '#FFFFFF', emissiveMap: tex, emissiveIntensity: 0.25 }));
    face.position.z = s * 0.081; if (s < 0) face.rotation.y = Math.PI; g.add(face);
  }
  return g;
}

/* ---------------- platforms ---------------- */
function platformMesh(pl, th) {
  const g = new THREE.Group(), look = th.looks[pl.look] || Object.values(th.looks)[0], [topC, sideC] = look, h = pl.h || 1;
  if (pl.t === 'cyl') {
    if (pl.look === 'column') {
      const shaft = mesh(new THREE.CylinderGeometry(pl.r * 0.82, pl.r * 0.9, h - 0.3, 20), mat(sideC)); at(shaft, 0, -0.3 - (h - 0.3) / 2, 0); g.add(shaft);
      const cap = mesh(new THREE.CylinderGeometry(pl.r, pl.r * 0.85, 0.3, 24), mat(topC)); at(cap, 0, -0.15, 0); g.add(cap);
      for (let i = 0; i < 10; i++) {   // flutes
        const a = (i / 10) * Math.PI * 2, f = mesh(new THREE.BoxGeometry(0.05, h - 0.4, 0.05), mat(topC), { cast: false });
        at(f, Math.cos(a) * pl.r * 0.84, -0.3 - (h - 0.3) / 2, Math.sin(a) * pl.r * 0.84); g.add(f);
      }
    } else if (pl.look === 'spring') {
      const base = mesh(new THREE.CylinderGeometry(pl.r, pl.r * 1.05, 0.25, 20), mat(sideC)); at(base, 0, -h + 0.125, 0); g.add(base);
      const coil = new THREE.Group(); at(coil, 0, -h + 0.25, 0); g.add(coil);
      for (let i = 0; i < 4; i++) { const c = mesh(new THREE.TorusGeometry(pl.r * 0.62, 0.05, 8, 20), mat('#C9D1D8', { metalness: 0.6, roughness: 0.35 })); c.rotation.x = Math.PI / 2; at(c, 0, 0.12 + i * 0.16, 0); coil.add(c); }
      const pad = mesh(new THREE.CylinderGeometry(pl.r, pl.r, 0.16, 24), mat(topC, { roughness: 0.6 })); at(pad, 0, -0.08, 0); g.add(pad);
      g.userData.coil = coil; g.userData.pad = pad; g.userData.coilH = h - 0.25;
    } else {
      // the body stops just under the top piece: two faces in one plane flicker (and stripe their shadows)
      const bh = h - 0.04, body = mesh(new THREE.CylinderGeometry(pl.r * 0.995, pl.r * 0.94, bh, 28, 1, pl.look === 'basket'), mat(sideC, pl.look === 'basket' ? { side: THREE.DoubleSide } : {}));
      at(body, 0, -0.04 - bh / 2, 0); g.add(body);
      if (pl.look === 'basket') {
        for (let i = 1; i < 4; i++) { const band = mesh(new THREE.TorusGeometry(pl.r * (1 - i * 0.015), 0.03, 6, 28), mat(topC), { cast: false }); band.rotation.x = Math.PI / 2; at(band, 0, -i * h / 4, 0); g.add(band); }
        const rim = mesh(new THREE.TorusGeometry(pl.r - 0.04, 0.07, 8, 28), mat(topC)); rim.rotation.x = Math.PI / 2; at(rim, 0, -0.03, 0); g.add(rim);
        const cloth = mesh(new THREE.CylinderGeometry(pl.r - 0.06, pl.r - 0.06, 0.08, 28), mat('#F6F8FA')); at(cloth, 0, -0.06, 0); g.add(cloth);
      } else if (pl.look === 'buoy') {
        const band = mesh(new THREE.CylinderGeometry(pl.r * 1.01, pl.r * 0.97, h * 0.34, 28), mat(topC)); at(band, 0, -h * 0.5, 0); g.add(band);
        const top = mesh(new THREE.CylinderGeometry(pl.r, pl.r, 0.08, 28), mat(topC)); at(top, 0, -0.04, 0); g.add(top);
      } else {
        const top = mesh(new THREE.CylinderGeometry(pl.r, pl.r, 0.14, 28), mat(topC)); at(top, 0, -0.07, 0); g.add(top);
        if (pl.look === 'disc') {   // a Roman mosaic: rings and a star
          for (let i = 1; i < 3; i++) { const ring = mesh(new THREE.TorusGeometry(pl.r * i / 3, 0.035, 6, 32), mat('#6E4A2A'), { cast: false }); ring.rotation.x = Math.PI / 2; at(ring, 0, 0.005, 0); g.add(ring); }
          for (let i = 0; i < 4; i++) { const b = mesh(new THREE.BoxGeometry(pl.r * 1.9, 0.02, 0.08), mat('#6E4A2A'), { cast: false }); b.rotation.y = (i * Math.PI) / 4; at(b, 0, 0.005, 0); g.add(b); }
        }
      }
    }
    return g;
  }
  const r = Math.min(0.14, pl.w / 6, pl.d / 6);
  const capT = pl.look === 'machine' ? 0.06 : 0.16, bh = h - capT / 2;   // the body's top hides inside the top piece
  const body = mesh(rbox(pl.w, bh, pl.d, r), mat(sideC)); at(body, 0, -capT / 2 - bh / 2, 0); g.add(body);
  const cap = mesh(rbox(pl.w + 0.04, capT, pl.d + 0.04, Math.min(r, capT / 2)), mat(topC)); at(cap, 0, -capT / 2, 0); g.add(cap);
  const front = pl.d / 2 + 0.01;
  if (pl.look === 'machine') {   // a washing machine: a round glass door and a panel
    const ring = mesh(new THREE.TorusGeometry(Math.min(pl.w, h) * 0.26, 0.06, 10, 32), mat('#AEB9C2', { metalness: 0.5, roughness: 0.35 }), { cast: false });
    at(ring, 0, -h * 0.55, front); g.add(ring);
    const glass = mesh(new THREE.CircleGeometry(Math.min(pl.w, h) * 0.24, 32), mat('#7FB2D6', { roughness: 0.15, metalness: 0.1 }), { cast: false });
    at(glass, 0, -h * 0.55, front - 0.005); g.add(glass);
    const panel = mesh(new THREE.BoxGeometry(pl.w * 0.86, 0.22, 0.04), mat('#DCE3E9'), { cast: false }); at(panel, 0, -0.2, front); g.add(panel);
    const knob = mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.05, 16), mat('#5D6B76'), { cast: false }); knob.rotation.x = Math.PI / 2; at(knob, pl.w * 0.3, -0.2, front + 0.03); g.add(knob);
  } else if (pl.look === 'powder') {
    const label = mesh(new THREE.BoxGeometry(pl.w * 0.8, h * 0.36, 0.03), mat('#FFFFFF'), { cast: false }); at(label, 0, -h * 0.5, front); g.add(label);
    const dot = mesh(new THREE.CircleGeometry(h * 0.12, 20), mat('#2F6FD6'), { cast: false }); at(dot, 0, -h * 0.5, front + 0.02); g.add(dot);
  } else if (pl.look === 'bus') {   // a city bus: windows, a stripe, wheels
    const win = mesh(new THREE.BoxGeometry(pl.w + 0.02, 0.42, pl.d * 0.84), mat('#2B3A46', { roughness: 0.25 }), { cast: false }); at(win, 0, -0.5, 0); g.add(win);
    const stripe = mesh(new THREE.BoxGeometry(pl.w + 0.03, 0.18, pl.d * 0.98), mat(sideC === '#2E8B57' ? '#2E8B57' : sideC), { cast: false }); at(stripe, 0, -h + 0.55, 0); g.add(stripe);
    body.material = mat('#F4F4F2');
    for (const sx of [-1, 1]) for (const sz of [-0.32, 0.32]) {
      const wheel = mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.24, 18), mat('#22262B')); wheel.rotation.z = Math.PI / 2; at(wheel, sx * (pl.w / 2 - 0.05), -h + 0.05, sz * pl.d); g.add(wheel);
    }
  } else if (pl.look === 'crate') {   // cardboard box with tape
    const tape = mesh(new THREE.BoxGeometry(pl.w * 0.22, 0.02, pl.d + 0.05), mat('#E9D2A6'), { cast: false }); at(tape, 0, 0.002, 0); g.add(tape);
  } else if (pl.look === 'barge') {   // a Rhine barge: a dark hull, a wooden deck, bollards in the corners
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) { const b = mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.22, 10), mat('#2F3E4C')); at(b, sx * (pl.w / 2 - 0.18), 0.11, sz * (pl.d / 2 - 0.18)); g.add(b); }
    const line = mesh(new THREE.BoxGeometry(pl.w + 0.03, 0.08, pl.d + 0.03), mat('#D6453A'), { cast: false }); at(line, 0, -0.28, 0); g.add(line);
  } else if (pl.look === 'plank' || pl.look === 'bench') {
    const n = Math.max(2, Math.round(pl.w / 0.5));
    for (let i = 1; i < n; i++) { const l = mesh(new THREE.BoxGeometry(0.03, 0.02, pl.d + 0.03), mat(sideC), { cast: false }); at(l, -pl.w / 2 + (i * pl.w) / n, 0.003, 0); g.add(l); }
  } else if (pl.look === 'brick') {
    for (let i = 1; i < 4; i++) { const l = mesh(new THREE.BoxGeometry(pl.w + 0.02, 0.03, pl.d + 0.02), mat('#E4C3A8'), { cast: false }); at(l, 0, -i * h / 4, 0); g.add(l); }
  }
  return g;
}

/* ---------------- things to look at (nothing to stand on) ---------------- */
function deco(d, th, night, ground) {
  const [kind, x, y0, z, s = 1, extra] = d, y = y0 == null ? ground : y0, g = new THREE.Group(); at(g, x, y, z); g.scale.setScalar(s);
  if (kind === 'bubble') {
    g.add(mesh(new THREE.SphereGeometry(0.5, 20, 14), new THREE.MeshStandardMaterial({ color: '#FFFFFF', roughness: 0.05, metalness: 0.2, transparent: true, opacity: 0.35 }), { cast: false, receive: false }));
    g.userData.bob = [0.4, 2.5 + (x * 7 + z * 3) % 1.5];
  } else if (kind === 'cloud') {
    for (const [cx, cy, cr] of [[0, 0, 1.2], [1.2, -0.2, 0.9], [-1.2, -0.3, 0.85], [0.5, 0.5, 0.8]]) g.add(at(mesh(new THREE.SphereGeometry(cr, 14, 10), mat(night ? '#5A6B8C' : '#FFFFFF', { roughness: 1 }), { cast: false, receive: false }), cx, cy, 0));
    g.userData.drift = 0.3;
  } else if (kind === 'tree') {
    g.add(at(mesh(new THREE.CylinderGeometry(0.14, 0.2, 1.2, 8), mat('#7A5232')), 0, 0.6, 0));
    g.add(at(mesh(new THREE.IcosahedronGeometry(0.9, 1), mat('#4E9A3C', { flatShading: true })), 0, 1.7, 0));
    g.add(at(mesh(new THREE.IcosahedronGeometry(0.65, 1), mat('#5FB04A', { flatShading: true })), 0.35, 2.3, 0.1));
  } else if (kind === 'pole') {   // a washing-line pole
    g.add(at(mesh(new THREE.CylinderGeometry(0.07, 0.07, 3, 10), mat('#9AA6AD', { metalness: 0.4, roughness: 0.5 })), 0, 1.5, 0));
  } else if (kind === 'line') {   // a washing line from here to `extra` with shirts on it
    const [x2, y2, z2] = extra, a = new THREE.Vector3(0, 0, 0), b = new THREE.Vector3(x2 - x, y2 - y, z2 - z), len = a.distanceTo(b);
    const rope = mesh(new THREE.CylinderGeometry(0.02, 0.02, len, 6), mat('#F6F1E6'), { cast: false });
    rope.position.copy(b).multiplyScalar(0.5); rope.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().normalize()); g.add(rope);
    const colors = ['#F6F8FA', '#2F6FD6', '#D6453A', '#F2C230', '#2E9B4B'], nc = colors.length;
    const n = Math.floor(len / 1.6);
    for (let i = 1; i <= n; i++) {
      const k = i / (n + 1), shirt = new THREE.Group(), c = colors[(((i + Math.round(x)) % nc) + nc) % nc];
      shirt.add(at(mesh(new THREE.BoxGeometry(0.62, 0.7, 0.04), mat(c, { roughness: 1 }), { receive: false }), 0, -0.4, 0));
      shirt.add(at(mesh(new THREE.BoxGeometry(1.05, 0.22, 0.04), mat(c, { roughness: 1 }), { receive: false }), 0, -0.14, 0));
      shirt.position.copy(b).multiplyScalar(k); shirt.position.y -= 0.12 * Math.sin(k * Math.PI);
      shirt.rotation.y = Math.atan2(b.x, b.z) + Math.PI / 2;
      shirt.userData.sway = i; g.add(shirt);
    }
  } else if (kind === 'dom') {   // Xanten cathedral far away: two towers and a nave
    const c = night ? '#2A3550' : '#C9B79C', roof = night ? '#1F2840' : '#6F7F86';
    for (const sx of [-1.6, 1.6]) { g.add(at(mesh(new THREE.BoxGeometry(2.2, 12, 2.2), mat(c), { cast: false, receive: false }), sx, 6, 0)); g.add(at(mesh(new THREE.ConeGeometry(1.55, 4, 4), mat(roof), { cast: false, receive: false }), sx, 14, 0).rotateY(Math.PI / 4)); }
    g.add(at(mesh(new THREE.BoxGeometry(3.6, 8, 12), mat(c), { cast: false, receive: false }), 0, 4, -7));
  } else if (kind === 'mill') {   // the Kriemhild mill: a tower and turning sails
    const c = night ? '#3A2E3A' : '#B8674A';
    g.add(at(mesh(new THREE.CylinderGeometry(1.4, 2.2, 7, 12), mat(c)), 0, 3.5, 0));
    g.add(at(mesh(new THREE.ConeGeometry(1.7, 2, 12), mat('#4A3A30')), 0, 8, 0));
    const sails = new THREE.Group(); at(sails, 0, 6.6, 1.9); g.add(sails);
    for (let i = 0; i < 4; i++) { const s = mesh(new THREE.BoxGeometry(0.9, 5.2, 0.08), mat('#EFE6D2', { roughness: 1 })); s.position.y = 2.7; const arm = new THREE.Group(); arm.add(s); arm.rotation.z = (i * Math.PI) / 2; sails.add(arm); }
    g.userData.spin = sails;
  } else if (kind === 'column') {   // a broken Roman column
    g.add(at(mesh(new THREE.CylinderGeometry(0.5, 0.55, extra || 3, 14), mat('#EDE3D1')), 0, (extra || 3) / 2, 0));
  } else if (kind === 'arch') {   // a Roman gate far away
    const c = night ? '#3B3446' : '#E3D3B5';
    g.add(at(mesh(new THREE.BoxGeometry(2, 9, 2), mat(c), { cast: false, receive: false }), -4, 4.5, 0));
    g.add(at(mesh(new THREE.BoxGeometry(2, 9, 2), mat(c), { cast: false, receive: false }), 4, 4.5, 0));
    g.add(at(mesh(new THREE.BoxGeometry(10, 2.4, 2.2), mat(c), { cast: false, receive: false }), 0, 10, 0));
  } else if (kind === 'light') {   // traffic light
    g.add(at(mesh(new THREE.CylinderGeometry(0.08, 0.08, 3.2, 10), mat('#3B4650')), 0, 1.6, 0));
    g.add(at(mesh(rbox(0.4, 1.1, 0.3, 0.08), mat('#2B3238')), 0, 3.4, 0));
    ['#D6453A', '#F2C230', '#2E9B4B'].forEach((c, i) => g.add(at(mesh(new THREE.SphereGeometry(0.11, 12, 8), mat(c, { emissive: c, emissiveIntensity: i === 2 ? 1.2 : 0.15 }), { cast: false }), 0, 3.75 - i * 0.34, 0.16)));
  } else if (kind === 'house') {   // a Lower Rhine brick house far away
    const c = night ? '#3A2E36' : (extra || '#B5644A');
    g.add(at(mesh(new THREE.BoxGeometry(4, 4, 4), mat(c), { cast: false }), 0, 2, 0));
    const roof = mesh(new THREE.ConeGeometry(3.2, 2.4, 4), mat('#4A3A36'), { cast: false }); roof.rotation.y = Math.PI / 4; at(roof, 0, 5.2, 0); g.add(roof);
  } else if (kind === 'peg') {   // a giant clothes peg
    g.add(at(mesh(rbox(0.4, 2.4, 0.3, 0.12), mat(extra || '#F2C230')), -0.22, 1.2, 0));
    g.add(at(mesh(rbox(0.4, 2.4, 0.3, 0.12), mat(extra || '#F2C230')), 0.22, 1.2, 0));
    g.add(at(mesh(new THREE.TorusGeometry(0.3, 0.06, 8, 16), mat('#C9D1D8', { metalness: 0.6, roughness: 0.3 })), 0, 1.4, 0));
  } else if (kind === 'sign') {   // a road sign
    g.add(at(mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.6, 8), mat('#9AA6AD')), 0, 1.3, 0));
    g.add(at(mesh(new THREE.BoxGeometry(1.6, 0.5, 0.06), mat('#F2C230')), 0, 2.5, 0));
  }
  return g;
}

/* ---------------- sky, sea, light ---------------- */
function skyTexture(top, bottom) {
  const c = document.createElement('canvas'); c.width = 2; c.height = 256;
  const x = c.getContext('2d'), gr = x.createLinearGradient(0, 0, 0, 256);
  gr.addColorStop(0, top); gr.addColorStop(0.62, bottom); gr.addColorStop(1, bottom);
  x.fillStyle = gr; x.fillRect(0, 0, 2, 256);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

export function createEngine(canvas, { dark = false, onEvent = () => {}, quality } = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: (window.devicePixelRatio || 1) < 2, powerPreference: 'high-performance', alpha: false });
  let ratio = Math.min(window.devicePixelRatio || 1, 2);
  renderer.setPixelRatio(ratio);
  renderer.shadowMap.enabled = quality !== 'low';
  renderer.shadowMap.type = THREE.PCFShadowMap;
  const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(50, 1, 0.1, 220);
  const hemi = new THREE.HemisphereLight('#FFFFFF', '#8A7A68', 1.35), sun = new THREE.DirectionalLight('#FFFFFF', 2.4);
  const big = (window.devicePixelRatio || 1) >= 2;
  sun.castShadow = true; sun.shadow.mapSize.set(big ? 2048 : 1024, big ? 2048 : 1024); sun.shadow.radius = 2.5;
  Object.assign(sun.shadow.camera, { left: -11, right: 11, top: 11, bottom: -11, near: 1, far: 50 });
  sun.shadow.bias = -0.0008; sun.shadow.normalBias = 0.07;
  scene.add(hemi, sun, sun.target);

  const time = { value: 0 };
  const sock = makeSock();
  scene.add(sock);
  // a soft round shadow right under the sock: where it will land (the real shadow falls a little to the side)
  const blob = new THREE.Mesh(new THREE.CircleGeometry(0.36, 24), new THREE.MeshBasicMaterial({ color: '#000000', transparent: true, opacity: 0.28, depthWrite: false }));
  blob.rotation.x = -Math.PI / 2; blob.renderOrder = 2; scene.add(blob);

  // little bits that fly: dust, sparkles, splashes
  const N = 160, parts = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.07, 0), new THREE.MeshBasicMaterial({ color: '#FFFFFF', transparent: true, opacity: 0.95 }), N);
  parts.instanceMatrix.setUsage(THREE.DynamicDrawUsage); parts.frustumCulled = false; parts.castShadow = false;
  parts.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(N * 3), 3);
  scene.add(parts);
  const P = Array.from({ length: N }, () => ({ life: 0 })), m4 = new THREE.Matrix4(), q0 = new THREE.Quaternion(), v3 = new THREE.Vector3(), s3 = new THREE.Vector3(), col = new THREE.Color();
  let pi = 0;
  function burst(x, y, z, n, color, speed = 3, up = 2, life = 0.6, size = 1) {
    for (let i = 0; i < n; i++) {
      const p = P[pi = (pi + 1) % N], a = Math.random() * Math.PI * 2, s = speed * (0.4 + Math.random() * 0.6);
      Object.assign(p, { x, y, z, vx: Math.cos(a) * s, vy: up * (0.5 + Math.random()), vz: Math.sin(a) * s, life, max: life, size: size * (0.6 + Math.random() * 0.8) });
      parts.setColorAt(pi, col.set(color));
    }
    parts.instanceColor.needsUpdate = true;
  }
  function stepParts(dt) {
    for (let i = 0; i < N; i++) {
      const p = P[i];
      if (p.life > 0) { p.life -= dt; p.vy -= 9 * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.z += p.vz * dt; }
      const k = p.life > 0 ? (p.life / p.max) * p.size : 0;
      m4.compose(v3.set(p.x || 0, p.y || 0, p.z || 0), q0, s3.set(k, k, k)); parts.setMatrixAt(i, m4);
    }
    parts.instanceMatrix.needsUpdate = true;
  }

  let L = null, W = null, th = null, world = new THREE.Group(), plats = [], letters = [], cps = [], goal = null, sea = null, seaY = 0, arms = [];
  scene.add(world);
  let input = { x: 0, z: 0, hold: false, press: false }, drive = null;
  let running = false, raf = 0, last = 0, acc = 0, focusY = 0, look = { x: 0, z: 0 }, squash = 0, squashV = 0, blink = 3, prevY = 0;
  const camPos = new THREE.Vector3(), camLook = new THREE.Vector3();

  function clear() {
    world.traverse((o) => {   // a level's own shapes, letter pictures and one-off materials go; the shared materials stay
      if (o.geometry) o.geometry.dispose();
      if (o.material && !o.material.userData.shared) { if (o.material.map) o.material.map.dispose(); o.material.dispose(); }
    });
    if (scene.background && scene.background.dispose) scene.background.dispose();
    scene.remove(world); world = new THREE.Group(); scene.add(world);
    plats = []; letters = []; cps = []; goal = null;
  }

  function load(level, opts = {}) {
    clear();
    L = level; W = createWorld(L); th = THEMES[L.theme] || THEMES.laundry;
    const night = !!opts.dark || dark;
    const sky = night ? NIGHT.sky : th.sky;
    scene.background = skyTexture(sky[0], sky[1]);
    scene.fog = new THREE.Fog(sky[1], 26, 75);
    hemi.color.set(night ? '#8FA3D9' : '#FFFFFF'); hemi.groundColor.set(night ? '#2A2F45' : '#8A7A68'); hemi.intensity = night ? 0.9 : 1.35;
    sun.color.set(night ? NIGHT.sun : th.sun); sun.intensity = night ? 1.25 : 2.4;
    // the sea (or foam, or a meadow) below: falling in it brings the sock back to the last checkpoint
    seaY = W.kill + (th.ground ? 0.05 : 1.6);   // water and foam: the sock sinks in a little; on solid ground it is caught at once
    const sg = new THREE.PlaneGeometry(260, 260, 90, 90);
    const sm = new THREE.MeshStandardMaterial({ color: night ? th.seaNight : th.sea, roughness: th.ground || th.foam ? 0.95 : 0.35, metalness: 0, flatShading: !th.ground });
    if (!th.ground) sm.onBeforeCompile = (sh) => {
      sh.uniforms.uTime = time;
      sh.vertexShader = 'uniform float uTime;\n' + sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\n transformed.z += sin(position.x * 0.45 + uTime * 1.4) * 0.16 + cos(position.y * 0.38 + uTime * 1.1) * 0.16;');
    };
    sea = new THREE.Mesh(sg, sm); sea.rotation.x = -Math.PI / 2; sea.position.set(0, seaY, -40); sea.receiveShadow = true; world.add(sea);
    for (const pl of L.platforms) { const m = platformMesh(pl, th); world.add(m); plats.push(m); }
    // the sails of the mill: a beam from the hub to each platform that goes round, turning with it
    arms = [];
    const hubs = new Map();
    L.platforms.forEach((pl, i) => {
      if (!pl.hub) return;
      const key = pl.hub.join();
      if (!hubs.has(key)) {
        const hub = mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.5, 20), mat('#6B4A2E'), { cast: false }); hub.rotation.x = Math.PI / 2; at(hub, ...pl.hub); world.add(hub);
        hubs.set(key, hub);
      }
      const beam = mesh(new THREE.BoxGeometry(0.22, 1, 0.22), mat('#6B4A2E'), { cast: false }); world.add(beam);
      const sail = mesh(new THREE.BoxGeometry(0.9, 1, 0.05), mat('#EFE6D2', { roughness: 1, side: THREE.DoubleSide }), { cast: false, receive: false }); world.add(sail);
      arms.push({ i, beam, sail, hub: pl.hub });
    });
    const color = ART[L.word[0]] || ART.die, chars = [...L.word[1].toUpperCase()];
    L.letters.forEach(([x, y, z], k) => { const m = makeLetter(chars[k] || '?', color); at(m, x, y, z); world.add(m); letters.push(m); });
    for (const [x, y, z] of L.checkpoints || []) {
      const g = new THREE.Group(); at(g, x + 1.1, y, z - 0.6);
      g.add(at(mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.6, 10), mat('#9AA6AD', { metalness: 0.3 })), 0, 0.8, 0));
      const flag = mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.08, 24), mat('#C7D0D5'));
      flag.rotation.x = Math.PI / 2; at(flag, 0, 1.75, 0); g.add(flag); g.userData.flag = flag;
      world.add(g); cps.push(g);
    }
    // the goal: a flag (in the last level, the other sock of the pair)
    const [gx, gy, gz] = L.goal;
    goal = new THREE.Group(); at(goal, gx, gy, gz); world.add(goal);
    const glow = new THREE.Mesh(new THREE.RingGeometry(0.55, 0.95, 40), new THREE.MeshBasicMaterial({ color: '#FFFFFF', transparent: true, opacity: 0.55, depthWrite: false }));
    glow.rotation.x = -Math.PI / 2; glow.position.y = 0.02; goal.add(glow); goal.userData.glow = glow;
    if (L.pair) {
      const pair = makeSock('#F2C230', '#2F5DB3', '#D6453A'); pair.rotation.y = 0.4; goal.add(pair); goal.userData.pair = pair;
    } else {
      goal.add(at(mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.4, 10), mat('#E9EEF1', { metalness: 0.4, roughness: 0.4 })), 0, 1.2, 0));
      goal.add(at(mesh(new THREE.SphereGeometry(0.11, 12, 8), mat('#F2C230', { metalness: 0.5, roughness: 0.3 })), 0, 2.45, 0));
      const fg = new THREE.PlaneGeometry(1.1, 0.7, 10, 4); fg.translate(0.55, 0, 0);
      const flag = mesh(fg, mat(color, { side: THREE.DoubleSide, roughness: 0.9 })); at(flag, 0.03, 2.0, 0); goal.add(flag);
      goal.userData.flag = flag; goal.userData.flat = fg.attributes.position.array.slice();
    }
    for (const d of L.deco || []) world.add(deco(d, th, night, seaY));
    // start
    const p = W.p; focusY = p.y; prevY = p.y; look.x = p.x; look.z = p.z;
    camPos.set(p.x, p.y + 6.2, p.z + 8.4); camLook.set(p.x, p.y + 0.6, p.z - 3);
    sock.position.set(p.x, p.y, p.z); sock.rotation.y = 0; squash = 0; squashV = 0;
    sock.visible = true;
    syncPlatforms(); place(0); render();
  }

  function syncPlatforms() {
    L.platforms.forEach((pl, i) => {
      const q = pose(pl, W.t, W.st[i]), m = plats[i], st = W.st[i];
      m.position.set(q.x, q.y, q.z); m.rotation.y = q.yaw;
      if (st.trig != null) {
        const k = W.t - st.trig;
        if (k < K.CRUMBLE) { m.position.x += Math.sin(k * 90) * 0.04; m.position.z += Math.cos(k * 77) * 0.04; }
        else { m.rotation.z = (k - K.CRUMBLE) * 1.2; }
        m.visible = k < K.CRUMBLE + 1.4;
        m.userData.gone = true;
      } else if (m.userData.gone) {   // back again: grows in
        m.userData.gone = false; m.userData.pop = 0.3; m.rotation.z = 0; m.visible = true;
      }
      if (m.userData.pop > 0) { m.userData.pop -= 1 / 60; const s = 1 - Math.max(0, m.userData.pop) / 0.3 * 0.3; m.scale.setScalar(s); } else m.scale.setScalar(1);
    });
    for (const a of arms) {
      const m = plats[a.i], [hx, hy, hz] = a.hub, dx = m.position.x - hx, dy = m.position.y - 0.2 - hy, len = Math.hypot(dx, dy), ang = Math.atan2(dy, dx) - Math.PI / 2;
      a.beam.scale.y = len; a.beam.rotation.z = ang; a.beam.position.set(hx + dx / 2, hy + dy / 2, hz + 0.1);
      a.sail.scale.y = len * 0.78; a.sail.rotation.z = ang; a.sail.position.set(hx + dx * 0.52 + Math.cos(ang) * 0.5, hy + dy * 0.52 + Math.sin(ang) * 0.5, hz + 0.05);
    }
  }

  // the highest platform top under (x, z) at or below y: for the round shadow
  function floorUnder(x, z, y) {
    let best = seaY;
    L.platforms.forEach((pl, i) => {
      const st = W.st[i]; if (st.trig != null && W.t - st.trig > K.CRUMBLE) return;
      const q = pose(pl, W.t, st);
      if (q.y <= y + 0.05 && q.y > best) {
        const dx = x - q.x, dz = z - q.z, c = Math.cos(q.yaw), s = Math.sin(q.yaw), lx = dx * c - dz * s, lz = dx * s + dz * c;
        const inside = pl.t === 'cyl' ? lx * lx + lz * lz <= pl.r * pl.r : Math.abs(lx) <= pl.w / 2 && Math.abs(lz) <= pl.d / 2;
        if (inside) best = q.y;
      }
    });
    return best;
  }

  function place(dt) {
    const p = W.p;
    // the sock: turns to where it runs, squashes on landing, stretches on a jump, waddles while running
    sock.position.set(p.x, p.y, p.z);
    let dy = p.face - sock.rotation.y; dy = Math.atan2(Math.sin(dy), Math.cos(dy));
    sock.rotation.y += dy * Math.min(1, dt * 14);
    // a springy squash, in small steps so a slow frame cannot make it swing up
    for (let n = Math.ceil(dt / 0.008), h = n ? dt / n : 0, k = 0; k < n; k++) { squashV += (-squash * 180 - squashV * 16) * h; squash += squashV * h; }
    squash = Math.max(-0.45, Math.min(0.45, squash));
    const air = p.ground < 0, sp = Math.hypot(p.vx, p.vz) / K.MAXV, body = sock.userData.body;
    const stretch = air ? Math.max(-0.12, Math.min(0.18, p.vy * 0.015)) : 0;
    const sy = 1 + squash + stretch, sxz = 1 / Math.sqrt(Math.max(0.5, sy));
    body.scale.set(sxz, sy, sxz);
    body.rotation.x = air ? -0.1 : sp * 0.18;
    body.rotation.z = !air && sp > 0.2 ? Math.sin(time.value * 16) * 0.09 * sp : 0;
    body.position.y = !air && sp > 0.2 ? Math.abs(Math.sin(time.value * 16)) * 0.06 * sp : 0;
    blink -= dt; const e = sock.userData.eyes;
    e.scale.y = blink < 0.12 ? 0.15 : 1; if (blink < 0) blink = 2.5 + Math.random() * 3;
    // the round shadow on whatever is under the sock
    const fy = floorUnder(p.x, p.z, p.y), hgt = p.y - fy;
    blob.position.set(p.x, fy + 0.02, p.z); blob.scale.setScalar(Math.max(0.35, 1 - hgt * 0.12)); blob.material.opacity = Math.max(0.08, 0.3 - hgt * 0.03);
    blob.visible = fy > seaY + 0.01;
    // the camera: behind and above, a little ahead; it moves up and down only when the sock lands (calmer than every jump)
    const target = p.ground >= 0 ? p.y : Math.min(focusY, p.y);
    focusY += (target - focusY) * Math.min(1, dt * (p.y < focusY - 1 ? 6 : 3));
    look.x += (p.x - look.x) * Math.min(1, dt * 5); look.z += (p.z - look.z) * Math.min(1, dt * 5);
    const wide = camera.aspect > 1;
    const want = new THREE.Vector3(look.x * 0.85 + p.x * 0.15, focusY + (wide ? 5.4 : 6.4), look.z + (wide ? 7.4 : 8.6));
    camPos.lerp(want, dt ? Math.min(1, dt * 5) : 1);
    camLook.lerp(v3.set(look.x * 0.85 + p.x * 0.15, focusY + 0.5, look.z - 3.2), dt ? Math.min(1, dt * 6) : 1);
    camera.position.copy(camPos); camera.lookAt(camLook);
    sun.position.set(p.x - 6, p.y + 16, p.z + 7); sun.target.position.set(p.x, p.y, p.z);
  }

  function animate(dt) {
    const T = time.value;
    letters.forEach((m, k) => {
      if (W.got[k]) {
        if (m.visible) { m.userData.out = (m.userData.out || 0) + dt; const s = 1 + m.userData.out * 4; m.scale.setScalar(Math.max(0, s * (1 - m.userData.out / 0.3))); if (m.userData.out > 0.3) m.visible = false; }
        return;
      }
      m.visible = true; m.scale.setScalar(1); m.userData.out = 0;
      m.rotation.y = T * 1.6 + k; m.position.y = L.letters[k][1] + Math.sin(T * 2.2 + k) * 0.08;
    });
    cps.forEach((g, k) => {
      const on = k <= W.cpi;
      if (g.userData.on !== on) { g.userData.on = on; g.userData.flag.material = mat(on ? '#F2C230' : '#C7D0D5', on ? { emissive: '#F2C230', emissiveIntensity: 0.3 } : {}); }
      g.userData.flag.rotation.z = on ? T * 2 : 0;
    });
    if (goal) {
      goal.userData.glow.material.opacity = 0.35 + Math.sin(T * 3) * 0.2;
      goal.userData.glow.scale.setScalar(1 + Math.sin(T * 3) * 0.06);
      if (goal.userData.flag) {
        const a = goal.userData.flag.geometry.attributes.position, f = goal.userData.flat;
        for (let i = 0; i < a.count; i++) { const x = f[i * 3]; a.setZ(i, Math.sin(x * 4 - T * 6) * 0.08 * x); }
        a.needsUpdate = true; goal.userData.flag.geometry.computeVertexNormals();
      }
      if (goal.userData.pair) { const pr = goal.userData.pair; pr.position.y = Math.abs(Math.sin(T * 5)) * 0.25; pr.rotation.y = 0.4 + Math.sin(T * 2) * 0.3; }
    }
    plats.forEach((m) => { if (m.userData.coil) { const k = m.userData.press || 0; m.userData.coil.scale.y = 1 - k * 0.5; m.userData.pad.position.y = -0.08 - k * m.userData.coilH * 0.5; m.userData.press = Math.max(0, k - dt * 3); } });
    world.children.forEach((g) => {
      if (g.userData.bob) g.position.y += Math.sin(T * 2 / g.userData.bob[1] * Math.PI) * g.userData.bob[0] * dt;
      if (g.userData.spin) g.userData.spin.rotation.z = T * 0.6;
      if (g.userData.drift) g.position.x += g.userData.drift * dt;
      g.children.forEach((c) => { if (c.userData && c.userData.sway) c.rotation.z = Math.sin(T * 2 + c.userData.sway) * 0.12; });
    });
  }

  function handle(e) {
    const p = W.p;
    if (e.type === 'land' && e.v > 9) { squash = -0.32; squashV = 0; burst(p.x, p.y + 0.05, p.z, 8, '#FFFFFF', 2.2, 1.2, 0.45, 1.1); }
    else if (e.type === 'land') { squash = -0.16; squashV = 0; }
    if (e.type === 'jump') { squash = 0.12; squashV = 3; burst(p.x, p.y + 0.05, p.z, 4, '#FFFFFF', 1.5, 0.6, 0.35); }
    if (e.type === 'spring') { squash = 0.3; squashV = 4; plats[e.i].userData.press = 1; burst(p.x, p.y, p.z, 10, '#F2C230', 3, 2, 0.6); }
    if (e.type === 'letter') { const [x, y, z] = L.letters[e.k]; burst(x, y, z, 16, ART[L.word[0]] || '#F2C230', 3.5, 2.5, 0.7, 1.2); }
    if (e.type === 'checkpoint') { const g = cps[e.k]; burst(g.position.x, g.position.y + 1.75, g.position.z, 14, '#F2C230', 2.5, 2, 0.7); }
    if (e.type === 'fall') { focusY = W.cp[1]; look.x = W.cp[0]; look.z = W.cp[2]; squash = 0.2; squashV = 0; }
    if (e.type === 'goal') { burst(p.x, p.y + 1, p.z, 40, '#F2C230', 4.5, 4, 1.1, 1.3); burst(p.x, p.y + 1, p.z, 30, ART[L.word[0]] || '#2F6FD6', 4, 4, 1.1, 1.2); }
    onEvent(e, W);
  }

  // frames: the rules step at a fixed rate, the drawing follows the screen
  let slow = 0, frames = 0;
  function frame(now) {
    if (!running) return;
    raf = requestAnimationFrame(frame);
    const dt = Math.max(0, Math.min(0.1, (now - last) / 1000 || 0)); last = now;   // the first frame may be stamped a moment before start()
    acc += dt;
    let n = 0;
    while (acc >= K.DT && n < 24) {
      const inp = drive ? drive(W) : input;
      W.events.length = 0;
      step(W, inp, K.DT);
      input.press = false;
      const p = W.p;
      if (prevY > seaY && p.y <= seaY) burst(p.x, seaY + 0.1, p.z, 22, th.splash || '#FFFFFF', 3.5, th.ground ? 2.5 : 4.5, 0.9, 1.3);
      prevY = p.y;
      for (const e of W.events.slice()) handle(e);
      acc -= K.DT; n++;
      if (W.done) { running = false; break; }
    }
    if (n >= 24) acc = 0;
    time.value += dt;
    syncPlatforms(); place(dt); animate(dt); stepParts(dt);
    render();
    // a phone that cannot keep up: fewer pixels, then no real shadows (the round one stays)
    frames++; slow = slow * 0.95 + (dt > 0.026 ? 1 : 0) * 0.05;
    if (frames > 120 && slow > 0.5) {
      frames = 0; slow = 0;
      if (ratio > 1.01) { ratio = Math.max(1, ratio - 0.5); renderer.setPixelRatio(ratio); resize(); }
      else if (renderer.shadowMap.enabled) { renderer.shadowMap.enabled = false; scene.traverse((o) => { if (o.material) o.material.needsUpdate = true; }); }
    }
    if (!running && W.done) { // keep the celebration going a little
      let t = 0; const tail = (n2) => { const d = Math.max(0, Math.min(0.05, (n2 - last) / 1000)); last = n2; t += d; time.value += d; stepParts(d); animate(d); place(d); render(); if (t < 1.6 && !running) requestAnimationFrame(tail); };
      requestAnimationFrame(tail);
    }
  }
  function render() { renderer.render(scene, camera); }
  function resize() {
    const w = canvas.clientWidth || 1, h = canvas.clientHeight || 1;
    renderer.setSize(w, h, false); camera.aspect = w / h;
    camera.fov = w / h > 1 ? 44 : 52; camera.updateProjectionMatrix(); if (L) render();
  }

  return {
    load, resize, render,
    start() { if (running || !W || W.done) return; running = true; last = performance.now(); acc = 0; raf = requestAnimationFrame(frame); },
    stop() { running = false; cancelAnimationFrame(raf); },
    get running() { return running; },
    get world() { return W; },
    set drive(f) { drive = f; },
    stick(x, z) { input.x = x; input.z = z; },
    jump(down) { if (down && !input.hold) input.press = true; input.hold = !!down; },
    dispose() { running = false; cancelAnimationFrame(raf); clear(); renderer.dispose(); },
    info() { return { ratio, shadows: renderer.shadowMap.enabled, calls: renderer.info.render.calls, tris: renderer.info.render.triangles }; },
    three: THREE, scene, camera,
  };
}
