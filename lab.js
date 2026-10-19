import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const canvas = document.getElementById('labCanvas');
const stage = canvas.parentElement;
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.85;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0a09);
scene.fog = new THREE.Fog(0x0a0a09, 9, 22);
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
scene.environmentIntensity = 0.7;

const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
const coil = new THREE.Group();
scene.add(coil);

/* ---- copper winding texture ---- */
function copperTex() {
  const c = document.createElement('canvas'); c.width = 64; c.height = 1024;
  const x = c.getContext('2d');
  for (let y = 0; y < 1024; y += 4) {
    const g = x.createLinearGradient(0, y, 0, y + 4);
    g.addColorStop(0, '#5a2a10'); g.addColorStop(.45, '#e08a4a'); g.addColorStop(.6, '#ffc58a'); g.addColorStop(1, '#4a200a');
    x.fillStyle = g; x.fillRect(0, y, 64, 4);
  }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(6, 1.2); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
}
const H = 3.2, R = 0.42;

// floor
const floor = new THREE.Mesh(new THREE.CircleGeometry(14, 64), new THREE.MeshStandardMaterial({ color: 0x0f0f0d, roughness: .55, metalness: .2 }));
floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
const grid = new THREE.PolarGridHelper(6, 24, 12, 96, 0x1e1e1a, 0x161613); grid.position.y = .002; scene.add(grid);

// base (PCB + plinth)
const plinth = new THREE.Mesh(new THREE.CylinderGeometry(1.25, 1.35, .28, 64), new THREE.MeshStandardMaterial({ color: 0x151513, roughness: .4, metalness: .6 }));
plinth.position.y = .14; plinth.castShadow = plinth.receiveShadow = true; coil.add(plinth);
const pcb = new THREE.Mesh(new THREE.BoxGeometry(1.5, .06, 1.5), new THREE.MeshStandardMaterial({ color: 0x6f6418, roughness: .6, metalness: .1 }));
pcb.position.y = .31; pcb.castShadow = true; coil.add(pcb);
// tiny components on the pcb
const compMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: .35, metalness: .3 });
for (let i = 0; i < 6; i++) { const b = new THREE.Mesh(new THREE.BoxGeometry(.18, .1, .12), compMat); b.position.set(-.5 + i * .2, .39, .55); b.castShadow = true; coil.add(b); }
const led = new THREE.Mesh(new THREE.SphereGeometry(.04, 16, 16), new THREE.MeshBasicMaterial({ color: 0xff3b1f })); led.position.set(.6, .38, -.55); coil.add(led);

// primary turns
class Helix extends THREE.Curve { constructor(r, h, turns) { super(); this.r = r; this.h = h; this.t = turns; }
  getPoint(u, v = new THREE.Vector3()) { const a = u * Math.PI * 2 * this.t; return v.set(Math.cos(a) * this.r, u * this.h, Math.sin(a) * this.r); } }
const primary = new THREE.Mesh(new THREE.TubeGeometry(new Helix(R + .16, .22, 3), 300, .028, 10), new THREE.MeshStandardMaterial({ color: 0xc8742f, metalness: 1, roughness: .28 }));
primary.position.y = .38; primary.castShadow = true; coil.add(primary);

// secondary
const sec = new THREE.Mesh(new THREE.CylinderGeometry(R, R, H, 96, 1, true), new THREE.MeshStandardMaterial({ map: copperTex(), metalness: .75, roughness: .38 }));
sec.position.y = .34 + H / 2; sec.castShadow = true; coil.add(sec);
const capMat = new THREE.MeshStandardMaterial({ color: 0x0c0c0c, roughness: .6 });
const cap = new THREE.Mesh(new THREE.CylinderGeometry(R + .02, R + .02, .16, 64), capMat); cap.position.y = .34 + H + .06; coil.add(cap);

// top load (toroid)
const topY = .34 + H + .42;
const toroid = new THREE.Mesh(new THREE.TorusGeometry(.62, .2, 48, 128), new THREE.MeshStandardMaterial({ color: 0x9a9a9a, metalness: 1, roughness: .22 }));
toroid.rotation.x = Math.PI / 2; toroid.position.y = topY; toroid.castShadow = true; coil.add(toroid);
const stem = new THREE.Mesh(new THREE.CylinderGeometry(.04, .04, .4, 16), toroid.material); stem.position.y = topY - .2; coil.add(stem);
// breakout point (the screw on his coil)
const spike = new THREE.Mesh(new THREE.ConeGeometry(.035, .32, 12), toroid.material); spike.position.y = topY + .22; coil.add(spike);

/* ---- lights ---- */
scene.add(new THREE.HemisphereLight(0x8899aa, 0x080806, .25));
const key = new THREE.SpotLight(0xffe9d0, 22, 30, .5, .7, 1.4); key.position.set(4, 9, 6); key.target = sec; key.castShadow = true; key.shadow.mapSize.set(1024, 1024); key.shadow.bias = -.0004; scene.add(key);
const rim = new THREE.PointLight(0x6c7cff, 14, 14, 2); rim.position.set(-4, 4, -3); scene.add(rim);
const arcLight = new THREE.PointLight(0xd4ff3a, 0, 12, 1.6); arcLight.position.set(0, topY, 0); coil.add(arcLight);

/* ---- arcs ---- */
const ARC_MAX = 9, SEG = 64;
const arcs = [];
for (let i = 0; i < ARC_MAX; i++) {
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(SEG * 3), 3));
  const core = new THREE.Line(geo, new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 1, blending: THREE.AdditiveBlending, depthWrite: false }));
  const glow = new THREE.Line(geo, new THREE.LineBasicMaterial({ color: 0xc8ff2a, transparent: true, opacity: .9, blending: THREE.AdditiveBlending, depthWrite: false }));
  glow.scale.setScalar(1.002);
  core.frustumCulled = glow.frustumCulled = false;
  scene.add(core, glow); arcs.push({ geo, core, glow, life: 0 });
}
const tmp = new THREE.Vector3();
function fractal(a, b, n) {
  // midpoint displacement into SEG points
  let pts = [a.clone(), b.clone()];
  let disp = a.distanceTo(b) * .32;
  while (pts.length < SEG) {
    const nx = [];
    for (let i = 0; i < pts.length - 1; i++) {
      nx.push(pts[i]);
      const m = pts[i].clone().lerp(pts[i + 1], .5);
      m.x += (Math.random() - .5) * disp; m.y += (Math.random() - .5) * disp; m.z += (Math.random() - .5) * disp;
      nx.push(m);
    }
    nx.push(pts[pts.length - 1]); pts = nx; disp *= .52;
  }
  return pts.slice(0, SEG);
}
function fire(arc, from, to) {
  const pts = fractal(from, to);
  const p = arc.geo.attributes.position.array;
  for (let i = 0; i < SEG; i++) { p[i * 3] = pts[i].x; p[i * 3 + 1] = pts[i].y; p[i * 3 + 2] = pts[i].z; }
  arc.geo.attributes.position.needsUpdate = true; arc.life = 1;
}

/* ---- floating ions ---- */
const ionN = 500, ionGeo = new THREE.BufferGeometry(), ionPos = new Float32Array(ionN * 3), ionSeed = new Float32Array(ionN);
for (let i = 0; i < ionN; i++) { const r = 1 + Math.random() * 5, a = Math.random() * 6.283; ionPos[i * 3] = Math.cos(a) * r; ionPos[i * 3 + 1] = Math.random() * 6; ionPos[i * 3 + 2] = Math.sin(a) * r; ionSeed[i] = Math.random(); }
ionGeo.setAttribute('position', new THREE.BufferAttribute(ionPos, 3));
const ions = new THREE.Points(ionGeo, new THREE.PointsMaterial({ color: 0xd4ff3a, size: .022, transparent: true, opacity: .55, blending: THREE.AdditiveBlending, depthWrite: false }));
scene.add(ions);

/* ---- post ---- */
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), .9, .5, .72);
composer.addPass(bloom);
composer.addPass(new OutputPass());

/* ---- layout ---- */
let W = 1, Hh = 1;
function resize() {
  W = stage.clientWidth; Hh = stage.clientHeight;
  renderer.setSize(W, Hh, false); composer.setSize(W, Hh); bloom.setSize(W, Hh);
  camera.aspect = W / Hh; camera.updateProjectionMatrix();
  coil.position.x = W > 900 ? 3.0 : 0; // coil sits right, text left
}
addEventListener('resize', resize); resize();

/* ---- pointer -> world target on a plane through the coil ---- */
const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(9, 9), plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
let hasPointer = false;
canvas.addEventListener('pointermove', e => { const r = canvas.getBoundingClientRect(); ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1); hasPointer = true; });
canvas.addEventListener('pointerleave', () => hasPointer = false);
let surge = 0; canvas.addEventListener('pointerdown', () => surge = 1);
addEventListener('overdrive', () => { surge = 3; document.getElementById('lab').scrollIntoView({ behavior: 'smooth' }); });

let visible = false;
new IntersectionObserver(([e]) => visible = e.isIntersecting, { threshold: 0 }).observe(stage);

const clock = new THREE.Clock();
const top = new THREE.Vector3(), target = new THREE.Vector3();
let camA = 0;
function frame() {
  requestAnimationFrame(frame);
  if (!visible) return;
  const dt = Math.min(clock.getDelta(), .05), t = clock.elapsedTime;

  // camera drift + parallax
  camA += dt * .06;
  const px = hasPointer ? ndc.x : Math.sin(t * .3) * .3, py = hasPointer ? ndc.y : 0;
  camera.position.set(coil.position.x + Math.sin(camA) * 1.4 - px * .8 - 2.2, 3.4 + py * .6, 13.5);
  camera.lookAt(coil.position.x - 2.4, 2.5, 0);

  coil.rotation.y += dt * .12;
  coil.updateMatrixWorld();
  top.set(0, topY + .2, 0).applyMatrix4(coil.matrixWorld);

  // where is the user pointing?
  let near = 0;
  if (hasPointer) {
    ray.setFromCamera(ndc, camera); plane.constant = -coil.position.z;
    if (ray.ray.intersectPlane(plane, target)) { const d = target.distanceTo(top); near = Math.max(0, 1 - d / 4.2); }
  }
  surge *= .94;
  const rate = .4 + near * .6 + surge;

  for (const a of arcs) {
    if (a.life <= 0 && Math.random() < rate * .35) {
      // start on the toroid's outer surface
      const ang = Math.random() * Math.PI * 2;
      const from = new THREE.Vector3(Math.cos(ang) * .8, topY + (Math.random() - .5) * .15, Math.sin(ang) * .8).applyMatrix4(coil.matrixWorld);
      let to;
      if (near > .05 && Math.random() < .55 + near * .4) {
        to = target.clone().add(new THREE.Vector3((Math.random() - .5) * .3, (Math.random() - .5) * .3, (Math.random() - .5) * .3));
        from.copy(top);
      } else {
        const L = 1 + Math.random() * 1.6 + surge * 1.5;
        to = from.clone().add(new THREE.Vector3(Math.cos(ang) * L, (Math.random() - .3) * L * .9, Math.sin(ang) * L));
      }
      fire(a, from, to);
    }
    a.life -= dt * (5 + Math.random() * 6);
    const o = Math.max(0, a.life);
    a.core.material.opacity = o * (Math.random() < .2 ? .4 : 1);
    a.glow.material.opacity = o * .9;
    a.core.visible = a.glow.visible = o > 0;
  }
  const live = arcs.reduce((s, a) => s + Math.max(0, a.life), 0);
  arcLight.intensity = .4 + live * 3.2 * (.6 + Math.random() * .4);
  bloom.strength = .85 + near * .5 + surge * .7;
  led.material.color.setHSL(0.02, 1, Math.random() < .5 ? .55 : .35);

  // ions drift upward and are pulled to the top load
  const p = ionGeo.attributes.position.array;
  for (let i = 0; i < ionN; i++) {
    p[i * 3 + 1] += dt * (.12 + ionSeed[i] * .25);
    if (p[i * 3 + 1] > 6.5) p[i * 3 + 1] = 0;
  }
  ionGeo.attributes.position.needsUpdate = true;
  ions.position.x = coil.position.x;
  ions.rotation.y = t * .03;

  composer.render();
}
frame();
