// Cosmopro · process story. One serum travels: formulation → manufacturing → filling → labelling → packaging → finished.
import * as THREE from 'three';
import { RoomEnvironment } from './assets/vendor/RoomEnvironment.js';

const BG = '#D9CAEC'; // matches --lilac (.band-stone)
const INK = '#2A1C45';
const LIQUID = '#B9A3DA';
const LIQUID_DEEP = '#A68BD0';
const PLUM = '#6C4A99';
const PORCELAIN = '#EFE8F6';

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const seg = (p, a, b) => clamp((p - a) / (b - a));
const ease = (t) => 1 - Math.pow(1 - t, 3); // cubic out
const inOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const lerp = (a, b, t) => a + (b - a) * t;
const S = 1 / 6; // one stage

// Canvas text with manual tracking (letterSpacing is not everywhere yet).
function tracked(ctx, text, x, y, track) {
  const chars = [...text];
  const widths = chars.map((c) => ctx.measureText(c).width);
  const total = widths.reduce((a, b) => a + b, 0) + track * (chars.length - 1);
  let cx = x - total / 2;
  ctx.textAlign = 'left';
  chars.forEach((c, i) => { ctx.fillText(c, cx, y); cx += widths[i] + track; });
}

function labelTexture(arcW, h) {
  const W = 2048, H = Math.round((W * h) / arcW);
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const x = c.getContext('2d');
  x.fillStyle = '#FBF9FD'; x.fillRect(0, 0, W, H);
  x.fillStyle = INK; x.textBaseline = 'alphabetic';
  x.font = '500 76px "Host Grotesk", sans-serif';
  tracked(x, 'YOUR BRAND', W / 2, H * 0.42, 18);
  x.font = '400 40px "Host Grotesk", sans-serif';
  tracked(x, 'Brightening serum', W / 2, H * 0.6, 0);
  x.fillStyle = '#6A6178';
  x.font = '400 23px "Geist Mono", monospace';
  tracked(x, '30 ML · 1.01 FL OZ', W / 2, H * 0.84, 4);
  // fine print on the wrap-around panels
  x.font = '400 17px "Geist Mono", monospace'; x.fillStyle = '#8E85A0';
  const ing = ['AQUA, NIACINAMIDE, GLYCERIN,', 'SODIUM HYALURONATE, PANTHENOL,', 'ALLANTOIN, TOCOPHEROL,', 'PHENOXYETHANOL.', '', 'MANUFACTURED UNDER LICENCE', 'BATCH 0000  ·  EXP 00/00'];
  ing.forEach((l, i) => { x.textAlign = 'left'; x.fillText(l, 120, H * 0.3 + i * 30); x.fillText(l, W - 520, H * 0.3 + i * 30); });
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  return t;
}

function cartonTextures() {
  const mk = (w, h, draw) => {
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    const x = c.getContext('2d'); x.fillStyle = INK; x.fillRect(0, 0, w, h); draw(x, w, h);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
  };
  const front = mk(1024, 1772, (x, w, h) => {
    x.fillStyle = PORCELAIN;
    x.save(); x.translate(w * 0.5, h * 0.5); x.rotate(-Math.PI / 2);
    x.font = '500 118px "Host Grotesk", sans-serif'; tracked(x, 'YOUR BRAND', 0, 40, 30);
    x.restore();
    x.font = '400 40px "Host Grotesk", sans-serif'; x.fillStyle = '#D3CADF'; tracked(x, 'Brightening serum', w / 2, h - 170, 0);
    x.font = '400 24px "Geist Mono", monospace'; x.fillStyle = '#9C92AE'; tracked(x, '30 ML · 1.01 FL OZ', w / 2, h - 110, 4);
  });
  const side = mk(1024, 1772, (x, w, h) => {
    x.font = '400 22px "Geist Mono", monospace'; x.fillStyle = '#9C92AE'; x.textAlign = 'left';
    ['DIRECTIONS', 'APPLY 2 TO 3 DROPS TO CLEAN SKIN,', 'MORNING AND EVENING.', '', 'INGREDIENTS', 'AQUA, NIACINAMIDE, GLYCERIN,', 'SODIUM HYALURONATE, PANTHENOL.'].forEach((l, i) => x.fillText(l, 110, 260 + i * 40));
  });
  return { front, side };
}

function shadowTexture() {
  const c = document.createElement('canvas'); c.width = c.height = 256;
  const x = c.getContext('2d');
  const g = x.createRadialGradient(128, 128, 0, 128, 128, 128);
  g.addColorStop(0, 'rgba(46,30,70,0.5)'); g.addColorStop(0.45, 'rgba(46,30,70,0.2)'); g.addColorStop(1, 'rgba(46,30,70,0)');
  x.fillStyle = g; x.fillRect(0, 0, 256, 256);
  const t = new THREE.CanvasTexture(c); return t;
}

function lathe(build, segs = 128) {
  const path = new THREE.Path(); build(path);
  return new THREE.LatheGeometry(path.getPoints(24), segs);
}

export async function createProcess(canvas, { reduced = false } = {}) {
  try { await Promise.all([document.fonts.load('500 92px "Host Grotesk"'), document.fonts.load('400 26px "Geist Mono"')]); } catch {}

  const mobile = matchMedia('(max-width: 959px)').matches;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, mobile ? 1.75 : 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.toneMappingExposure = 1.0;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(BG);
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.9;
  const key = new THREE.DirectionalLight('#ffffff', 1.6); key.position.set(-3, 6, 5); scene.add(key);
  const rim = new THREE.DirectionalLight('#ffffff', 0.8); rim.position.set(4, 3, -4); scene.add(rim);

  const camera = new THREE.PerspectiveCamera(26, 1, 0.1, 100);
  const world = new THREE.Group(); scene.add(world);

  // plinth
  const plinth = new THREE.Mesh(
    lathe((p) => { p.moveTo(0, -0.26); p.lineTo(1.86, -0.26); p.quadraticCurveTo(1.92, -0.26, 1.92, -0.2); p.lineTo(1.92, -0.05); p.quadraticCurveTo(1.92, 0, 1.87, 0); p.lineTo(0, 0); }, 160),
    new THREE.MeshStandardMaterial({ color: '#F4EFF9', roughness: 0.85, metalness: 0 })
  );
  world.add(plinth);

  const shTex = shadowTexture();
  const mkShadow = (size) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(size, size), new THREE.MeshBasicMaterial({ map: shTex, transparent: true, depthWrite: false, opacity: 0 }));
    m.rotation.x = -Math.PI / 2; m.position.y = 0.003; world.add(m); return m;
  };
  const dropShadow = mkShadow(1.6);
  const bottleShadow = mkShadow(1.8);
  const cartonShadow = mkShadow(2.3);

  // shared liquid material with a soft wobble
  const uni = { uTime: { value: 0 }, uAmp: { value: 0.022 } };
  const liquidMat = new THREE.MeshPhysicalMaterial({
    color: '#ffffff', roughness: 0.04, metalness: 0, transmission: 1, thickness: 0.9, ior: 1.42,
    attenuationColor: new THREE.Color(LIQUID_DEEP), attenuationDistance: 1.4, clearcoat: 1, clearcoatRoughness: 0.04, specularIntensity: 1,
  });
  liquidMat.onBeforeCompile = (sh) => {
    sh.uniforms.uTime = uni.uTime; sh.uniforms.uAmp = uni.uAmp;
    sh.vertexShader = 'uniform float uTime;\nuniform float uAmp;\n' + sh.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>
      float wob = sin(position.y * 7.0 + uTime * 1.7) * 0.5 + sin(position.x * 6.0 - uTime * 1.3) * 0.35 + sin(position.z * 8.0 + uTime * 1.1) * 0.25;
      transformed += normal * wob * uAmp;`);
  };

  // stage I: the formula droplet and three actives
  const drop = new THREE.Mesh(new THREE.SphereGeometry(0.42, 96, 64), liquidMat);
  world.add(drop);
  const beads = [PORCELAIN, INK, PLUM].map((col, i) => {
    const b = new THREE.Mesh(new THREE.SphereGeometry(0.1, 48, 32), new THREE.MeshPhysicalMaterial({ color: col, roughness: col === INK ? 0.35 : 0.25, clearcoat: 0.8 }));
    b.userData.a = (i / 3) * Math.PI * 2; world.add(b); return b;
  });

  // stage II: the batch
  const N = 12;
  const batch = new THREE.InstancedMesh(new THREE.SphereGeometry(0.12, 48, 32), liquidMat, N);
  batch.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  world.add(batch);
  const tmp = new THREE.Object3D();

  // the product (bottle + liquid + label + dropper), grouped so it can turn
  const product = new THREE.Group(); world.add(product);
  const R = 0.5;
  const bottle = new THREE.Mesh(
    lathe((p) => {
      p.moveTo(0, 0); p.lineTo(R - 0.06, 0); p.quadraticCurveTo(R, 0, R, 0.07); p.lineTo(R, 1.5);
      p.bezierCurveTo(R, 1.74, 0.22, 1.7, 0.2, 1.9); p.lineTo(0.2, 2.1); p.quadraticCurveTo(0.2, 2.13, 0.17, 2.13); p.lineTo(0, 2.13);
    }),
    new THREE.MeshPhysicalMaterial({
      color: '#ffffff', metalness: 0, roughness: mobile ? 0.3 : 0.26, transmission: 1, thickness: 0.9, ior: 1.46,
      attenuationColor: new THREE.Color('#EEE6F6'), attenuationDistance: 2.6, clearcoat: 1, clearcoatRoughness: 0.18, specularIntensity: 1,
    })
  );
  product.add(bottle);
  const LH = 1.44; // liquid column height
  const liquid = new THREE.Mesh(
    lathe((p) => { p.moveTo(0, 0); p.lineTo(R - 0.12, 0); p.quadraticCurveTo(R - 0.05, 0, R - 0.05, 0.07); p.lineTo(R - 0.05, LH); p.lineTo(0, LH); }, 96),
    new THREE.MeshStandardMaterial({ color: LIQUID, roughness: 0.3 })
  );
  liquid.position.y = 0.05; product.add(liquid);

  const L = Math.PI * 2 * 0.8; // label wraps 80% of the way round
  const LR = R + 0.006, LY = 0.8, LHt = 0.92;
  const label = new THREE.Mesh(new THREE.BufferGeometry(), new THREE.MeshStandardMaterial({ map: labelTexture(LR * L, LHt), roughness: 0.62, metalness: 0 }));
  label.position.y = LY; product.add(label);
  let labelK = -1;
  const setLabel = (k) => {
    k = Math.round(k * 200) / 200;
    if (k === labelK) return; labelK = k;
    label.visible = k > 0.002;
    if (!label.visible) return;
    label.geometry.dispose();
    label.geometry = new THREE.CylinderGeometry(LR, LR, LHt, Math.max(3, Math.ceil(160 * k)), 1, true, -L / 2, L * k);
    label.material.map.repeat.x = k; label.material.map.offset.x = 0;
  };

  const dropper = new THREE.Group(); product.add(dropper);
  const inkMat = new THREE.MeshStandardMaterial({ color: INK, roughness: 0.42, metalness: 0.2 });
  const collar = new THREE.Mesh(lathe((p) => { p.moveTo(0, 0); p.lineTo(0.23, 0); p.quadraticCurveTo(0.25, 0, 0.25, 0.02); p.lineTo(0.25, 0.32); p.lineTo(0, 0.32); }, 96), inkMat);
  collar.position.y = 1.86; dropper.add(collar);
  const bulb = new THREE.Mesh(
    lathe((p) => { p.moveTo(0, 0); p.lineTo(0.18, 0); p.bezierCurveTo(0.2, 0.12, 0.15, 0.2, 0.155, 0.32); p.bezierCurveTo(0.16, 0.48, 0.09, 0.54, 0, 0.54); }, 96),
    new THREE.MeshStandardMaterial({ color: '#2E2148', roughness: 0.6, metalness: 0 })
  );
  bulb.position.y = 2.18; dropper.add(bulb);

  // stage V: carton
  const ct = cartonTextures();
  const plain = new THREE.MeshStandardMaterial({ color: INK, roughness: 0.72 });
  const carton = new THREE.Mesh(new THREE.BoxGeometry(1.12, 2.5, 1.12), [
    new THREE.MeshStandardMaterial({ map: ct.side, roughness: 0.72 }), plain, plain, plain,
    new THREE.MeshStandardMaterial({ map: ct.front, roughness: 0.72 }), plain,
  ]);
  world.add(carton);

  // ---------- layout over progress ----------
  let target = 0, p = 0, time = 0;
  const camPos = new THREE.Vector3(), camLook = new THREE.Vector3();

  function pose(pr, t) {
    // I · formulation
    const f1 = seg(pr, 0, S);
    // II · manufacturing
    const f2 = seg(pr, S, 2 * S);
    // III · filling: bottle lands, then fills
    const land = ease(seg(pr, 2 * S, 2.45 * S));
    const fill = inOut(seg(pr, 2.45 * S, 3 * S));
    // IV · labelling
    const lab = inOut(seg(pr, 3 * S, 3.9 * S));
    // V · packaging: dropper, then carton
    const cap = ease(seg(pr, 4 * S, 4.5 * S));
    const box = inOut(seg(pr, 4.45 * S, 5 * S));
    // VI · finished
    const fin = inOut(seg(pr, 5 * S, 1));

    const bob = reduced ? 0 : Math.sin(t * 1.2) * 0.04;
    const gone = ease(seg(pr, 2 * S, 2.55 * S)); // droplets travel into the bottle

    // droplet
    const dScale = lerp(0.72, 1, ease(f1)) * lerp(1, 1.3, ease(f2)) * (1 - gone);
    drop.scale.setScalar(Math.max(0.0001, dScale));
    drop.position.set(0, lerp(1.25 + bob, 2.35, gone), 0);
    drop.visible = dScale > 0.002;
    dropShadow.material.opacity = 0.55 * (1 - gone) * clamp(dScale);
    dropShadow.scale.setScalar(lerp(0.9, 1.2, f2));

    // actives orbit in and merge
    beads.forEach((b) => {
      const a = b.userData.a + t * 0.5 + f1 * 2.4;
      const r = lerp(1.15, 0.05, ease(f1));
      b.position.set(Math.cos(a) * r, 1.25 + bob + Math.sin(a * 2) * 0.12 * (1 - f1), Math.sin(a) * r);
      const s = 1 - seg(f1, 0.78, 1);
      b.scale.setScalar(Math.max(0.0001, s)); b.visible = s > 0.002;
    });

    // batch ring
    const ringIn = ease(f2);
    for (let i = 0; i < N; i++) {
      const a = (i / N) * Math.PI * 2 + t * 0.25 + f2 * 1.2;
      const r = lerp(0.35, 1.25, ringIn);
      tmp.position.set(Math.cos(a) * r * (1 - gone), lerp(1.25 + bob + Math.sin(a * 3 + t) * 0.08, 2.35, gone), Math.sin(a) * r * (1 - gone));
      tmp.scale.setScalar(Math.max(0.0001, ringIn * (1 - gone)));
      tmp.updateMatrix(); batch.setMatrixAt(i, tmp.matrix);
    }
    batch.instanceMatrix.needsUpdate = true;
    batch.visible = ringIn * (1 - gone) > 0.002;

    // bottle arrives from above
    product.visible = land > 0.001;
    product.position.y = lerp(3.6, 0, land);
    liquid.scale.y = Math.max(0.0001, fill * 0.84);
    liquid.visible = fill > 0.002;
    bottleShadow.material.opacity = 0.6 * land * land;
    bottleShadow.scale.setScalar(lerp(0.4, 1, land));

    setLabel(lab);
    dropper.position.y = lerp(3.2, 0, cap);
    dropper.rotation.y = (1 - cap) * Math.PI * 1.5;
    dropper.visible = cap > 0.001;

    // composition shifts left as the carton arrives
    const shift = lerp(0, mobile ? -0.55 : -0.66, box);
    product.position.x = shift;
    bottleShadow.position.x = shift;
    carton.position.set(lerp(5.5, mobile ? 0.7 : 0.82, box), 1.25, lerp(-0.2, -0.12, box));
    carton.rotation.y = lerp(-1.1, -0.38, box);
    carton.visible = box > 0.001;
    cartonShadow.position.set(carton.position.x, 0.003, carton.position.z);
    cartonShadow.material.opacity = 0.55 * box;

    // the product turns: a slow quarter turn while labelling, settling front-on
    const turn = lerp(0.9, 0, lab) + (reduced ? 0 : Math.sin(t * 0.6) * 0.06 * (1 - box));
    product.rotation.y = turn;

    // finished: whole world turns a touch
    world.rotation.y = lerp(0, -0.22, fin) + (reduced ? 0 : Math.sin(t * 0.35) * 0.03 * fin);

    // camera: fit the composition
    const aspect = camera.aspect;
    const wide = 4.25;
    const tall = 3.3;
    const tan = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    const dist = Math.max((tall / 2) / tan, (wide / 2) / (tan * aspect)) * (mobile ? 1.0 : 1.06) * lerp(1, 0.94, fin);
    const lookY = lerp(1.2, 1.1, land);
    camLook.set(0, lookY, 0);
    camPos.set(0, lookY + dist * 0.27, dist);
    camera.position.copy(camPos); camera.lookAt(camLook);
  }

  // ---------- loop ----------
  let active = false, raf = 0, last = performance.now();
  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
  }
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    if (!reduced) time += dt;
    uni.uTime.value = time;
    p += (target - p) * (1 - Math.exp(-dt * 9));
    if (Math.abs(target - p) < 0.0004) p = target;
    pose(p, time);
    renderer.render(scene, camera);
    raf = active ? requestAnimationFrame(frame) : 0;
  }
  const ro = new ResizeObserver(() => { resize(); if (!active) { pose(p, time); renderer.render(scene, camera); } });
  ro.observe(canvas);
  resize(); pose(0, 0); renderer.render(scene, camera);

  return {
    setProgress(v) { target = clamp(v); if (!active) { p = target; pose(p, time); renderer.render(scene, camera); } },
    setActive(on) {
      if (on === active) return; active = on;
      if (on && !raf) { last = performance.now(); raf = requestAnimationFrame(frame); }
    },
  };
}
