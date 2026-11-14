// The picture of "Пригоди шкарпетки", seen from the side in the manner of pixel-art games lit like films (The Last
// Night): three.js draws the level in 3D (real light and shadows, fog, depth) into a small picture about 220 pixels on
// its short side, which is then enlarged with hard pixel edges. Layers far behind move slower than the play, layers in
// front faster (the depth), neon and lamps glow, rain falls before and behind. The rules (physics.js) step 120 times a
// second; the page (igry/hop.js) gives the stick and the jump and shows what the engine reports.
import * as THREE from '../../assets/three/r185/three.module.min.js';
import { K, createWorld, step, pose, half } from './physics.js?v=0393d637';
import { ART, THEMES, M, at, mesh, rng, makeSock, makeLetter, platformMesh, makeBelow, makeScenery, mistBand } from './art.js?v=342ed2b4';

// three.js r185 draws with WebGL 2
export function webgl() {
  try { const c = document.createElement('canvas'); return !!(window.WebGL2RenderingContext && c.getContext('webgl2')); } catch (e) { return false; }
}

const D = 30;           // the camera's distance from the play
const TARGET = 220;     // about this many pixels on the short side of the screen
const LAMP = 22;        // how strong a lamp is (a sign a little less)

/* the last step: glow around bright things, the colours of the place, darker corners, then a few colour steps per
   channel with an ordered dither between them (the banding of pixel art) */
const POST_VS = 'varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy, 0., 1.); }';
const POST_FS = `
uniform sampler2D tScene; uniform vec2 uRes; uniform float uGlow, uVig, uFlash; uniform vec3 uLift, uGain;
varying vec2 vUv;
float bayer2(vec2 a) { a = floor(a); return fract(dot(a, vec2(.5, a.y * .75))); }
float bayer4(vec2 a) { return bayer2(.5 * a) * .25 + bayer2(a); }
vec3 bright(vec2 uv) { return max(texture2D(tScene, uv).rgb - .75, 0.); }
void main() {
  vec3 c = texture2D(tScene, vUv).rgb;
  vec2 px = 1. / uRes; vec3 g = vec3(0.);
  for (int i = 0; i < 8; i++) {
    float a = float(i) * .7853982 + .39; vec2 d = vec2(cos(a), sin(a)) * px;
    g += bright(vUv + d * 1.5) * .8 + bright(vUv + d * 3.5) * .5 + bright(vUv + d * 6.5) * .25;
  }
  c += g * uGlow * .07;
  c *= mix(vec3(1.), uGain, .45);
  c += uLift * .07 * (1. - clamp(c, 0., 1.)) + uFlash;
  vec2 q = vUv - .5; c *= 1. - dot(q, q) * uVig * .9;
  gl_FragColor = vec4(c, 1.);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
  gl_FragColor.rgb = floor(gl_FragColor.rgb * 36. + bayer4(gl_FragCoord.xy)) / 36.;
}`;

/* rain: streaks in a box that travels with the camera, moved by the graphics card */
function makeRain(time) {
  const n = 520, pos = new Float32Array(n * 6), end = new Float32Array(n * 2), r = rng(9);
  for (let i = 0; i < n; i++) { const x = r() * 44, y = r() * 34, z = -18 + r() * 25; pos.set([x, y, z, x, y, z], i * 6); end[i * 2 + 1] = 1; }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('aEnd', new THREE.BufferAttribute(end, 1));
  const m = new THREE.ShaderMaterial({
    uniforms: { uTime: time, uCam: { value: new THREE.Vector3() }, uColor: { value: new THREE.Color('#A8B8F0') } }, transparent: true, depthWrite: false,
    vertexShader: `uniform float uTime; uniform vec3 uCam; attribute float aEnd; varying float vA;
      void main() {
        vec3 p = position;
        p.y = mod(p.y - uTime * 26. - uCam.y, 34.) + uCam.y - 17.;
        p.x = mod(p.x + uTime * 4. - uCam.x, 44.) + uCam.x - 22.;
        p += vec3(-.16, 1.05, 0.) * aEnd;
        vA = mix(.18, .6, smoothstep(-18., 4., p.z));
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.);
      }`,
    fragmentShader: 'uniform vec3 uColor; varying float vA; void main() { gl_FragColor = vec4(uColor, vA); }',
  });
  const lines = new THREE.LineSegments(g, m); lines.frustumCulled = false; lines.renderOrder = 6;
  return lines;
}
/* things in the air: bubbles, fireflies, dust in the sun, leaves in the wind (one pixel or two each) */
function makeMotes(mo, time) {
  const n = mo.n, pos = new Float32Array(n * 3), seed = new Float32Array(n * 3), r = rng(21);
  for (let i = 0; i < n; i++) { pos.set([r() * 40, r() * 24, -8 + r() * 12], i * 3); seed.set([r(), r(), r()], i * 3); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 3));
  const kind = { bubble: 0, firefly: 1, dust: 2, leaf: 3 }[mo.kind] || 0, k = kind === 1 ? 3.2 : kind === 0 ? 1.4 : 1.2;
  const m = new THREE.ShaderMaterial({
    uniforms: { uTime: time, uCam: { value: new THREE.Vector3() }, uColor: { value: new THREE.Color(mo.c).multiplyScalar(k) }, uKind: { value: kind } }, transparent: true, depthWrite: false,
    vertexShader: `uniform float uTime; uniform vec3 uCam; uniform float uKind; attribute vec3 aSeed; varying float vA;
      void main() {
        vec3 p = position; float t = uTime;
        float wind = uKind == 3. ? 7. + aSeed.y * 4. : .15, rise = uKind == 0. ? .5 : uKind == 3. ? -.8 : uKind == 2. ? .12 : 0.;
        p.x += sin(t * (.3 + aSeed.x * .5) + aSeed.y * 6.28) * (uKind == 1. ? 1.4 : .6) + t * wind;
        p.y += cos(t * (.25 + aSeed.z * .4) + aSeed.x * 6.28) * (uKind == 3. ? 1.2 : .7) + t * rise;
        p.x = mod(p.x - uCam.x + 20., 40.) + uCam.x - 20.;
        p.y = mod(p.y - uCam.y + 12., 24.) + uCam.y - 12.;
        vA = uKind == 1. ? smoothstep(.1, 1., .5 + .5 * sin(t * (1.5 + aSeed.z * 2.) + aSeed.x * 40.)) : .85;
        gl_PointSize = uKind == 2. ? 1. : 2.;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.);
      }`,
    fragmentShader: 'uniform vec3 uColor; varying float vA; void main() { gl_FragColor = vec4(uColor, vA); }',
  });
  const pts = new THREE.Points(g, m); pts.frustumCulled = false; pts.renderOrder = 6;
  return pts;
}
function skyTexture([top, middle, bottom], stars) {
  const c = document.createElement('canvas'); c.width = 64; c.height = 256;
  const x = c.getContext('2d'), gr = x.createLinearGradient(0, 0, 0, 256);
  gr.addColorStop(0, top); gr.addColorStop(0.55, middle); gr.addColorStop(1, bottom);
  x.fillStyle = gr; x.fillRect(0, 0, 64, 256);
  const r = rng(3);
  for (let i = 0; i < (stars || 0); i++) { x.fillStyle = `rgba(255,255,255,${0.3 + r() * 0.6})`; x.fillRect((r() * 64) | 0, (r() * 110) | 0, 1, 1); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.magFilter = THREE.NearestFilter; return t;
}

export function createEngine(canvas, { onEvent = () => {} } = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance', alpha: false });
  renderer.setPixelRatio(1);
  renderer.info.autoReset = false;   // two draws a frame (the scene, then the last step): count both
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  // light brighter than white (neon, lamps) is kept for the glow where the phone can (half floats), else 8 bits in sRGB
  const hdr = !!(renderer.extensions.has('EXT_color_buffer_float') || renderer.extensions.has('EXT_color_buffer_half_float'));
  const rt = new THREE.WebGLRenderTarget(4, 4, { type: hdr ? THREE.HalfFloatType : THREE.UnsignedByteType, colorSpace: hdr ? THREE.NoColorSpace : THREE.SRGBColorSpace,
    minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter, generateMipmaps: false, depthBuffer: true });
  const post = new THREE.ShaderMaterial({ vertexShader: POST_VS, fragmentShader: POST_FS, depthTest: false, depthWrite: false,
    uniforms: { tScene: { value: rt.texture }, uRes: { value: new THREE.Vector2(4, 4) }, uGlow: { value: 1 }, uVig: { value: 1 }, uFlash: { value: 0 }, uLift: { value: new THREE.Color() }, uGain: { value: new THREE.Color(1, 1, 1) } } });
  const postScene = new THREE.Scene(), postCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1), quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), post);
  quad.frustumCulled = false; postScene.add(quad);

  const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(30, 1, 0.5, 420);
  const hemi = new THREE.HemisphereLight('#FFFFFF', '#444444', 1), key = new THREE.DirectionalLight('#FFFFFF', 1.5), rim = new THREE.DirectionalLight('#FFFFFF', 1);
  key.castShadow = true; key.shadow.mapSize.set(1024, 1024);
  Object.assign(key.shadow.camera, { left: -22, right: 22, top: 16, bottom: -16, near: 1, far: 90 });
  key.shadow.bias = -0.0005; key.shadow.normalBias = 0.05;
  scene.add(hemi, key, key.target, rim, rim.target);
  const keyDir = new THREE.Vector3(), rimDir = new THREE.Vector3();
  // four lamps follow the camera: the lamps and signs nearest to it lend them their place and colour
  const points = [0, 1, 2, 3].map(() => { const l = new THREE.PointLight('#FFFFFF', 0, 16, 1.5); scene.add(l); return l; });

  const time = { value: 0 };
  const sock = makeSock(); scene.add(sock);

  // little bits that fly: dust, sparkles, splashes
  const N = 160, parts = new THREE.InstancedMesh(new THREE.BoxGeometry(0.09, 0.09, 0.09), new THREE.MeshBasicMaterial({ color: '#FFFFFF' }), N);
  parts.instanceMatrix.setUsage(THREE.DynamicDrawUsage); parts.frustumCulled = false;
  parts.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(N * 3), 3);
  scene.add(parts);
  const P = Array.from({ length: N }, () => ({ life: 0 })), m4 = new THREE.Matrix4(), q0 = new THREE.Quaternion(), v3 = new THREE.Vector3(), s3 = new THREE.Vector3(), col = new THREE.Color();
  let pi = 0;
  function burst(x, y, z, n, color, speed = 3, up = 2, life = 0.6, size = 1, glow = 1) {
    for (let i = 0; i < n; i++) {
      const p = P[pi = (pi + 1) % N], a = Math.random() * Math.PI * 2, s = speed * (0.4 + Math.random() * 0.6);
      Object.assign(p, { x, y, z, vx: Math.cos(a) * s, vy: up * (0.5 + Math.random()), vz: Math.sin(a) * s * 0.4, life, max: life, size: size * (0.6 + Math.random() * 0.8) });
      parts.setColorAt(pi, col.set(color).multiplyScalar(glow));
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

  let L = null, W = null, th = null, world = new THREE.Group(), plats = [], letters = [], cps = [], goal = null, arms = [], live = null, below = null, rain = null, motes = null;
  let floorY = -3, x0 = 0, x1 = 0, sources = [], storm = 0;
  scene.add(world);
  let input = { x: 0, hold: false, press: false }, drive = null;
  let running = false, raf = 0, last = 0, acc = 0, focusY = 0, camX = 0, squash = 0, squashV = 0, blink = 3, prevY = 0, turn = 1.15;
  const view = { w: 12.5, h: 10.5 };
  let bufW = 4, bufH = 4, px = 1, extra = 0, adaptive = true;

  function clear() {
    world.traverse((o) => {   // a level's own shapes, letter pictures and one-off materials go; the shared materials stay
      if (o.geometry) o.geometry.dispose();
      const ms = Array.isArray(o.material) ? o.material : o.material ? [o.material] : [];
      for (const m of ms) if (!m.userData.shared) { if (m.map) m.map.dispose(); m.dispose(); }
    });
    if (scene.background && scene.background.dispose) scene.background.dispose();
    scene.remove(world); world = new THREE.Group(); scene.add(world);
    plats = []; letters = []; cps = []; goal = null; arms = []; live = null; below = null; rain = null; motes = null; sources = [];
  }

  function load(level) {
    clear();
    L = level; W = createWorld(L); th = THEMES[L.theme] || THEMES.laundry;
    const xs = L.platforms.flatMap((p) => [p.x - half(p), p.x + half(p) + Math.max(0, p.move ? p.move.to[0] : 0)]);
    x0 = Math.min(...xs); x1 = Math.max(...xs);
    floorY = L.floor != null ? L.floor : W.kill + 1;
    // the sky, the fog, the light of the place
    scene.background = skyTexture(th.sky, th.stars);
    scene.fog = new THREE.Fog(th.fog[0], D + 6, D + th.fog[1]);
    hemi.color.set(th.hemi[0]); hemi.groundColor.set(th.hemi[1]); hemi.intensity = th.hemi[2];
    key.color.set(th.key[0]); key.intensity = th.key[1]; keyDir.set(...th.key[2]).normalize();
    rim.color.set(th.rim[0]); rim.intensity = th.rim[1]; rimDir.set(...th.rim[2]).normalize();
    renderer.toneMappingExposure = th.exposure;
    const gr = th.grade, U = post.uniforms;
    U.uGlow.value = gr.glow; U.uVig.value = gr.vig; U.uLift.value.set(gr.lift); U.uGain.value.set(gr.gain); U.uFlash.value = 0;
    if (th.sun) {   // the sun (or a moon) low over the far layers, with a halo
      const [c, size, y] = th.sun, sun = new THREE.Group();
      sun.add(new THREE.Mesh(new THREE.CircleGeometry(size, 32), new THREE.MeshBasicMaterial({ color: new THREE.Color(c).multiplyScalar(2.2), fog: false })));
      const halo = new THREE.Mesh(new THREE.CircleGeometry(size * 3.2, 32), new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0.18, fog: false, depthWrite: false, blending: THREE.AdditiveBlending }));
      halo.position.z = -1; sun.add(halo);
      at(sun, (x0 + x1) / 2 - 20, floorY + y * 5, -230); world.add(sun);
    }
    // what lies below, the platforms, the scenery
    below = makeBelow(th, x0, x1, floorY, time); world.add(below);
    for (const pl of L.platforms) { const { g, fixed } = platformMesh(pl, th, floorY); world.add(g, fixed); plats.push(g); }
    const hubs = new Map();
    L.platforms.forEach((pl, i) => {   // what goes round hangs on an arm from its hub: the sails of the mill, the Roman disc
      if (!pl.orbit) return;
      const hub = pl.hub || [pl.x, pl.y - 0.2, -0.8], k = hub.join();
      if (!hubs.has(k)) { const h = mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.5, 16), M('#4A3424'), { cast: false }); h.rotation.x = Math.PI / 2; at(h, ...hub); world.add(h); hubs.set(k, h); }
      const beam = mesh(new THREE.BoxGeometry(0.24, 1, 0.24), M('#5A3E28')); world.add(beam);
      let cloth = null;
      if (pl.look === 'sail') { cloth = mesh(new THREE.BoxGeometry(1.1, 1, 0.04), M('#EDE2CC', { roughness: 1 })); world.add(cloth); }
      arms.push({ i, beam, cloth, hub });
    });
    const color = ART[L.word[0]] || ART.die, chars = [...L.word[1].toUpperCase()];
    L.letters.forEach(([x, y, z], k) => { const m = makeLetter(chars[k] || '?', color); at(m, x, y, z); world.add(m); letters.push(m); });
    for (const [x, y] of L.checkpoints || []) {   // a flag on a pole with a little lamp that lights when reached
      const g = new THREE.Group(); at(g, x + 0.9, y, -0.7);
      g.add(at(mesh(new THREE.CylinderGeometry(0.05, 0.05, 2, 8), M('#9AA6AD', { metalness: 0.4 })), 0, 1, 0));
      const flag = mesh(new THREE.BoxGeometry(0.7, 0.45, 0.04), M('#8A949A')); at(flag, 0.37, 1.75, 0); g.add(flag);
      const bulb = mesh(new THREE.SphereGeometry(0.1, 8, 6), M('#5A6066', { emissive: '#000000' }), { cast: false }); at(bulb, 0, 2.08, 0); g.add(bulb);
      g.userData = { flag, bulb }; world.add(g); cps.push(g);
    }
    const [gx, gy] = L.goal;   // the goal: a flag in the colour of the word's article (in the last level, the other sock)
    goal = new THREE.Group(); at(goal, gx, gy, 0); world.add(goal);
    const pillar = mistBand(1.8, 7, color, 0.5); pillar.rotation.z = Math.PI; pillar.material.blending = THREE.AdditiveBlending; at(pillar, 0, 3.5, -0.2); goal.add(pillar); goal.userData.pillar = pillar;
    if (L.pair) { const pair = makeSock(); pair.rotation.y = -1.15; goal.add(pair); goal.userData.pair = pair; }
    else {
      goal.add(at(mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.6, 8), M('#E9EEF1', { metalness: 0.5, roughness: 0.3 })), 0, 1.3, -0.4));
      const fg = new THREE.PlaneGeometry(1.2, 0.75, 8, 3); fg.translate(0.6, 0, 0);
      const flag = mesh(fg, M(color, { side: THREE.DoubleSide, roughness: 0.8, emissive: color, emissiveIntensity: 0.4 })); at(flag, 0.04, 2.15, -0.4); goal.add(flag);
      goal.userData.flag = flag; goal.userData.flat = fg.attributes.position.array.slice();
    }
    const sc = makeScenery(L, th, x0, x1, floorY); world.add(sc.g); live = sc.live;
    // what can light the play: the level's lamps, and its signs a little
    sources = (L.lamps || []).map(([x, y, z, c]) => ({ x: x + (L.theme === 'laundry' ? 0 : 0.9), y: y - 0.4, z: z + 0.6, c, k: 1 }))
      .concat((L.signs || []).map(([, x, y, z, c], i) => ({ x, y: y - 0.6, z: z + 1.6, c, k: 0.55, sign: live.neon[i] })));
    if (th.rain) { rain = makeRain(time); world.add(rain); }
    if (th.motes && th.motes.n) { motes = makeMotes(th.motes, time); world.add(motes); }
    storm = th.storm ? 3 : 0;
    // start
    const p = W.p; focusY = p.y; prevY = p.y; camX = p.x + view.w * 0.16;
    sock.position.set(p.x, p.y, 0); sock.rotation.y = turn; squash = 0; squashV = 0; sock.visible = true;
    syncPlatforms(); place(0); render();
  }

  function syncPlatforms() {
    L.platforms.forEach((pl, i) => {
      const q = pose(pl, W.t, W.st[i]), m = plats[i], st = W.st[i];
      m.position.set(q.x, q.y, pl.z || 0); m.rotation.z = 0;
      if (st.trig != null) {
        const k = W.t - st.trig;
        if (k < K.CRUMBLE) { m.position.x += Math.sin(k * 90) * 0.04; m.position.y += Math.cos(k * 77) * 0.03; }
        else m.rotation.z = (k - K.CRUMBLE) * 1.4 * (i % 2 ? 1 : -1);
        m.visible = k < K.CRUMBLE + 1.4; m.userData.gone = true;
      } else if (m.userData.gone) { m.userData.gone = false; m.userData.pop = 0.3; m.visible = true; }   // back again: grows in
      if (m.userData.pop > 0) { m.userData.pop -= 1 / 60; m.scale.setScalar(1 - (Math.max(0, m.userData.pop) / 0.3) * 0.3); } else m.scale.setScalar(1);
    });
    for (const a of arms) {
      const m = plats[a.i], [hx, hy, hz] = a.hub, dx = m.position.x - hx, dy = m.position.y - 0.25 - hy, len = Math.hypot(dx, dy), ang = Math.atan2(dy, dx) - Math.PI / 2;
      a.beam.scale.y = len; a.beam.rotation.z = ang; a.beam.position.set(hx + dx / 2, hy + dy / 2, hz + 0.15);
      if (a.cloth) { a.cloth.scale.y = len * 0.8; a.cloth.rotation.z = ang; a.cloth.position.set(hx + dx * 0.5 + Math.cos(ang) * 0.62, hy + dy * 0.5 + Math.sin(ang) * 0.62, hz + 0.1); }
    }
  }

  function place(dt) {
    const p = W.p, air = p.ground < 0, sp = Math.abs(p.vx) / K.MAXV, body = sock.userData.body;
    // the sock: turns three quarters towards where it runs, squashes on landing, stretches on a jump, waddles while running
    sock.position.set(p.x, p.y, 0);
    const want = p.face * turn;
    sock.rotation.y += (want - sock.rotation.y) * Math.min(1, dt * 16);
    for (let n = Math.ceil(dt / 0.008), h = n ? dt / n : 0, k = 0; k < n; k++) { squashV += (-squash * 180 - squashV * 16) * h; squash += squashV * h; }
    squash = Math.max(-0.45, Math.min(0.45, squash));
    const stretch = air ? Math.max(-0.12, Math.min(0.18, p.vy * 0.015)) : 0;
    const sy = 1 + squash + stretch, sxz = 1 / Math.sqrt(Math.max(0.5, sy));
    body.scale.set(sxz, sy, sxz);
    body.rotation.x = air ? -0.12 : sp * 0.22;
    body.rotation.z = !air && sp > 0.2 ? Math.sin(time.value * 16) * 0.1 * sp : 0;
    body.position.y = !air && sp > 0.2 ? Math.abs(Math.sin(time.value * 16)) * 0.07 * sp : 0;
    blink -= dt; const e = sock.userData.eyes;
    e.scale.y = blink < 0.12 ? 0.15 : 1; if (blink < 0) blink = 2.5 + Math.random() * 3;
    // the camera: a little ahead of where the sock looks; up and down only when it lands (calmer than every jump)
    const target = p.ground >= 0 ? p.y : Math.min(focusY, p.y);
    focusY += (target - focusY) * (dt ? Math.min(1, dt * (p.y < focusY - 1 ? 6 : 2.5)) : 1);
    camX += (p.x + p.face * view.w * 0.16 - camX) * (dt ? Math.min(1, dt * 2.4) : 1);
    const upp = view.h / bufH, cy = focusY + view.h * 0.12, snap = (v) => Math.round(v / upp) * upp;   // on whole pixels: the play does not shimmer
    camera.position.set(snap(camX), snap(cy + 2), D); camera.lookAt(snap(camX), snap(cy), 0);
    key.position.set(camX + keyDir.x * 40, cy + keyDir.y * 40, keyDir.z * 40); key.target.position.set(camX, cy - 2, -4);
    rim.position.copy(rimDir).multiplyScalar(40).add(sock.position); rim.target.position.copy(sock.position);
    // the four lamps go to the lamps and signs nearest the camera, fading in and out at the edges
    const near = sources.map((s) => [Math.abs(s.x - camX), s]).sort((a, b) => a[0] - b[0]);
    points.forEach((l, i) => {
      const n = near[i]; if (!n) { l.intensity = 0; return; }
      const [dx, s] = n, fade = Math.max(0, Math.min(1, 1 - (dx - view.w * 0.7) / 8)), on = s.sign ? s.sign.userData.on ?? 1 : 1;
      l.position.set(s.x, s.y, s.z); l.color.set(s.c); l.intensity = LAMP * s.k * fade * on;
    });
    if (rain) rain.material.uniforms.uCam.value.copy(camera.position);
    if (motes) motes.material.uniforms.uCam.value.copy(camera.position);
  }

  function animate(dt) {
    const T = time.value;
    letters.forEach((m, k) => {
      if (W.got[k]) {
        if (m.visible) { m.userData.out = (m.userData.out || 0) + dt; const s = 1 + m.userData.out * 4; m.scale.setScalar(Math.max(0, s * (1 - m.userData.out / 0.3))); if (m.userData.out > 0.3) m.visible = false; }
        return;
      }
      m.visible = true; m.scale.setScalar(1); m.userData.out = 0;
      m.rotation.y = Math.sin(T * 1.8 + k) * 0.9; m.position.y = L.letters[k][1] + Math.sin(T * 2.2 + k) * 0.08;
    });
    cps.forEach((g, k) => {
      const on = k <= W.cpi;
      if (g.userData.on !== on) {
        g.userData.on = on;
        g.userData.flag.material = M(on ? '#F2C230' : '#8A949A', on ? { emissive: '#F2C230', emissiveIntensity: 0.6 } : {});
        g.userData.bulb.material = on ? M('#FFE08A', { emissive: '#FFD040', emissiveIntensity: 4 }) : M('#5A6066', { emissive: '#000000' });
      }
      g.userData.flag.rotation.y = on ? Math.sin(T * 5) * 0.25 : 0;
    });
    if (goal) {
      goal.userData.pillar.material.opacity = 0.35 + Math.sin(T * 3) * 0.15;
      if (goal.userData.flag) {
        const a = goal.userData.flag.geometry.attributes.position, f = goal.userData.flat;
        for (let i = 0; i < a.count; i++) { const x = f[i * 3]; a.setZ(i, Math.sin(x * 4 - T * 6) * 0.1 * x); }
        a.needsUpdate = true; goal.userData.flag.geometry.computeVertexNormals();
      }
      if (goal.userData.pair) { const pr = goal.userData.pair; pr.position.y = Math.abs(Math.sin(T * 5)) * 0.25; pr.rotation.y = -1.15 + Math.sin(T * 2) * 0.3; }
    }
    plats.forEach((m) => {
      if (m.userData.coil) { const k = m.userData.press || 0; m.userData.coil.scale.y = 1 - k * 0.5; m.userData.pad.position.y = -0.08 - k * m.userData.coilH * 0.5; m.userData.press = Math.max(0, k - dt * 3); }
      if (m.userData.spin) m.userData.spin.rotation.z = T * 4;
    });
    if (live) {   // the scenery that moves by itself
      for (const s of live.neon) {   // a sign now and then flickers
        const f = (Math.sin(T * 0.7 + s.userData.flick * 40) > 0.97 && Math.sin(T * 31 + s.userData.flick) > 0) ? 0.25 : 1;
        s.userData.on = f; s.userData.neon.color.setScalar(2.2 * f);
      }
      for (const c of live.cars) { c.position.x += c.userData.v * dt; const [a, b] = c.userData.span; if (c.position.x > b) c.position.x = a; if (c.position.x < a) c.position.x = b; }
      for (const s of live.sway) s.rotation.z = Math.sin(T * 2 + s.userData.sway) * 0.12;
      for (const m of live.blink) m.visible = Math.sin(T * 2.4 + m.position.x) > 0.6;
      if (live.glitter && Math.floor(T * 8) !== live.glitter.userData.tick) {   // the sun glitters on the water, a few sparks at a time
        const gl = live.glitter, k0 = (gl.userData.tick = Math.floor(T * 8));
        gl.userData.base.forEach(([x, y, z, w, h, d], i) => { const on = Math.sin(i * 12.9898 + k0 * 0.7) > 0.35; m4.compose(v3.set(x, y, z), q0, s3.set(on ? w : 0, h, d)); gl.setMatrixAt(i, m4); });
        gl.instanceMatrix.needsUpdate = true;
      }
      for (const m of live.drift) { m.userData.x0 ??= m.position.x; m.position.x = m.userData.x0 + Math.sin(T * 0.08 * m.userData.drift * 10) * 6; }
    }
    if (below) for (const m of below.children) if (m.userData.drift) { m.userData.x0 ??= m.position.x; m.position.x = m.userData.x0 + Math.sin(T * 0.1 + m.position.z) * 4; }
    if (storm) {   // lightning now and then: the sky flashes twice
      storm -= dt;
      const k = storm < 0 ? Math.max(0, 1 + storm / 0.35) * (Math.sin(-storm * 60) > 0 ? 1 : 0.3) : 0;
      post.uniforms.uFlash.value = k * 0.18; hemi.intensity = th.hemi[2] * (1 + k * 3);
      if (storm < -0.35) storm = 5 + Math.random() * 6;
    }
  }

  function handle(e) {
    const p = W.p;
    if (e.type === 'land' && e.v > 9) { squash = -0.32; squashV = 0; burst(p.x, p.y + 0.05, 0, 8, '#E8E8E8', 2.2, 1.2, 0.45, 1.1); }
    else if (e.type === 'land') { squash = -0.16; squashV = 0; }
    if (e.type === 'jump') { squash = 0.12; squashV = 3; burst(p.x, p.y + 0.05, 0, 4, '#E8E8E8', 1.5, 0.6, 0.35); }
    if (e.type === 'spring') { squash = 0.3; squashV = 4; plats[e.i].userData.press = 1; burst(p.x, p.y, 0, 10, '#F2C230', 3, 2, 0.6, 1, 2); }
    if (e.type === 'letter') { const [x, y] = L.letters[e.k]; burst(x, y, 0, 16, ART[L.word[0]] || '#F2C230', 3.5, 2.5, 0.7, 1.2, 2.5); }
    if (e.type === 'checkpoint') { const g = cps[e.k]; burst(g.position.x, g.position.y + 2, g.position.z, 14, '#FFD040', 2.5, 2, 0.7, 1, 2.5); }
    if (e.type === 'fall') { focusY = W.cp[1]; camX = W.cp[0] + view.w * 0.16; squash = 0.2; squashV = 0; }
    if (e.type === 'goal') { burst(p.x, p.y + 1, 0, 40, '#F2C230', 4.5, 4, 1.1, 1.3, 2.5); burst(p.x, p.y + 1, 0, 30, ART[L.word[0]] || '#2F6FD6', 4, 4, 1.1, 1.2, 2.5); }
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
      if (prevY > floorY && p.y <= floorY) {   // into the water, the foam or the mist
        const b = th.below.kind;
        burst(p.x, floorY + 0.1, 0, 22, b === 'water' ? '#CFE4F0' : b === 'foam' ? '#FFFFFF' : th.below.mist || '#888888', 3.5, b === 'water' || b === 'foam' ? 4.5 : 1.5, 0.9, 1.3);
      }
      prevY = p.y;
      for (const e of W.events.slice()) handle(e);
      acc -= K.DT; n++;
      if (W.done) { running = false; break; }
    }
    if (n >= 24) acc = 0;
    time.value += dt;
    syncPlatforms(); place(dt); animate(dt); stepParts(dt);
    render();
    // a phone that cannot keep up: bigger pixels, then no real shadows
    frames++; slow = slow * 0.95 + (dt > 0.026 ? 1 : 0) * 0.05;
    if (adaptive && frames > 120 && slow > 0.5) {
      frames = 0; slow = 0;
      if (extra < 2) { extra++; resize(); }
      else if (renderer.shadowMap.enabled) { renderer.shadowMap.enabled = false; scene.traverse((o) => { if (o.material) o.material.needsUpdate = true; }); }
    }
    if (!running && W.done) {   // keep the celebration going a little
      let t = 0; const tail = (n2) => { const d = Math.max(0, Math.min(0.05, (n2 - last) / 1000)); last = n2; t += d; time.value += d; stepParts(d); animate(d); place(d); render(); if (t < 1.6 && !running) requestAnimationFrame(tail); };
      requestAnimationFrame(tail);
    }
  }
  function render() {
    renderer.info.reset();
    renderer.setRenderTarget(rt); renderer.render(scene, camera);
    renderer.setRenderTarget(null); renderer.render(postScene, postCam);
  }
  // A small picture: whole screen pixels per game pixel, so every game pixel is the same square on the screen
  function resize() {
    const host = canvas.parentElement || canvas, cw = host.clientWidth || 1, ch = host.clientHeight || 1, dpr = window.devicePixelRatio || 1;
    const devW = Math.round(cw * dpr), devH = Math.round(ch * dpr);
    px = Math.max(1, Math.round(Math.min(devW, devH) / TARGET) + extra);
    bufW = Math.ceil(devW / px); bufH = Math.ceil(devH / px);
    renderer.setSize(bufW, bufH, false); rt.setSize(bufW, bufH); post.uniforms.uRes.value.set(bufW, bufH);
    const sw = (bufW * px) / dpr, sh = (bufH * px) / dpr;
    Object.assign(canvas.style, { width: sw + 'px', height: sh + 'px', left: Math.floor(((cw - sw) / 2) * dpr) / dpr + 'px', top: Math.floor(((ch - sh) / 2) * dpr) / dpr + 'px' });
    const aspect = bufW / bufH;
    view.h = Math.max(10.5, 10.5 / aspect); view.w = view.h * aspect;   // at least 10.5 across and up and down at the play
    camera.aspect = aspect; camera.fov = (2 * Math.atan(view.h / 2 / D) * 180) / Math.PI; camera.updateProjectionMatrix();
    if (L) { place(0); render(); }
  }

  return {
    load, resize, render,
    start() { if (running || !W || W.done) return; running = true; last = performance.now(); acc = 0; raf = requestAnimationFrame(frame); },
    stop() { running = false; cancelAnimationFrame(raf); },
    get running() { return running; },
    get world() { return W; },
    set drive(f) { drive = f; },
    set adaptive(v) { adaptive = !!v; if (!v && extra) { extra = 0; resize(); } if (!v) renderer.shadowMap.enabled = true; },   // tests: a steady picture
    stick(x) { input.x = x; },
    jump(down) { if (down && !input.hold) input.press = true; input.hold = !!down; },
    dispose() { running = false; cancelAnimationFrame(raf); clear(); rt.dispose(); renderer.dispose(); },
    info() { return { px, buf: [bufW, bufH], hdr, view: { ...view }, shadows: renderer.shadowMap.enabled, calls: renderer.info.render.calls, tris: renderer.info.render.triangles }; },
    three: THREE, scene, camera,
  };
}
