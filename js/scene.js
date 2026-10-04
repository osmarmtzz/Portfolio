// 3D background: a field of particles rolling in waves under soft aurora
// lights. The camera flies over it as the page scrolls; scroll.js publishes
// the pinned sections' progress on window.__scrollFx.
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.min.js";

const REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const MINT   = new THREE.Color("#4fe3b5");
const BLUE   = new THREE.Color("#6ea8ff");
const VIOLET = new THREE.Color("#8b7bff");

const FIELD = { halfX: 20, nearZ: 2, farZ: -24 };

/* Simplex noise — Ian McEwan / Ashima Arts (MIT) */
const NOISE_GLSL = /* glsl */ `
vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1.0/6.0,1.0/3.0);
  const vec4 D=vec4(0.0,0.5,1.0,2.0);
  vec3 i=floor(v+dot(v,C.yyy));
  vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz);
  vec3 l=1.0-g;
  vec3 i1=min(g.xyz,l.zxy);
  vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx;
  vec3 x2=x0-i2+C.yyy;
  vec3 x3=x0-D.yyy;
  i=mod289(i);
  vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
  float n_=0.142857142857;
  vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.0*floor(p*ns.z*ns.z);
  vec4 x_=floor(j*ns.z);
  vec4 y_=floor(j-7.0*x_);
  vec4 x=x_*ns.x+ns.yyyy;
  vec4 y=y_*ns.x+ns.yyyy;
  vec4 h=1.0-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy);
  vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.0+1.0;
  vec4 s1=floor(b1)*2.0+1.0;
  vec4 sh=-step(h,vec4(0.0));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;
  vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x);
  vec3 p1=vec3(a0.zw,h.y);
  vec3 p2=vec3(a1.xy,h.z);
  vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
  vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);
  m=m*m;
  return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}`;

/* ---- Wave field ---- */
const FIELD_VERTEX = /* glsl */ `
uniform float uTime;
uniform float uTravel;      // forward flight, driven by the scroll position
uniform float uShift;       // sideways drift, driven by the pinned gallery
uniform float uAmp;
uniform float uMask;        // 1 = dim the left side of the screen (hero copy lives there)
uniform float uSize;
uniform float uPixelRatio;
uniform float uHalfX;
varying float vAlpha;
varying float vHeight;
${NOISE_GLSL}
void main(){
  vec3 p = position;
  float swell  = snoise(vec3(p.x * 0.16 + uShift, p.z * 0.16 + uTravel, uTime * 0.06));
  float ripple = snoise(vec3(p.x * 0.42 + uShift * 1.6 + 10.0, p.z * 0.42 + uTravel * 1.7, uTime * 0.1));
  float h = swell * 0.85 + ripple * 0.22;
  p.y = h * uAmp;

  vec4 mv   = modelViewMatrix * vec4(p, 1.0);
  vec4 clip = projectionMatrix * mv;
  float dist = -mv.z;

  float fog   = 1.0 - smoothstep(8.0, 27.0, dist);
  float near  = smoothstep(1.0, 3.6, dist);
  float side  = 1.0 - smoothstep(0.7, 1.0, abs(position.x) / uHalfX);
  float left  = mix(1.0, 0.22 + 0.78 * smoothstep(0.15, 0.7, clip.x / clip.w * 0.5 + 0.5), uMask);

  vHeight = h * 0.5 + 0.5;
  vAlpha  = fog * near * side * left * (0.3 + 0.7 * vHeight);
  gl_PointSize = max(uSize * uPixelRatio * (0.7 + vHeight * 0.9) / dist, 1.0);
  gl_Position  = clip;
}`;

const FIELD_FRAGMENT = /* glsl */ `
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform float uOpacity;
varying float vAlpha;
varying float vHeight;
void main(){
  float d = length(gl_PointCoord - 0.5);
  float a = smoothstep(0.5, 0.08, d);
  vec3 col = mix(uColorB, uColorA, smoothstep(0.25, 0.85, vHeight));
  gl_FragColor = vec4(col, a * vAlpha * uOpacity);
}`;

// The same vertices are also drawn as one flowing line per row
const FIELD_LINE_FRAGMENT = /* glsl */ `
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform float uOpacity;
varying float vAlpha;
varying float vHeight;
void main(){
  vec3 col = mix(uColorB, uColorA, smoothstep(0.25, 0.85, vHeight));
  gl_FragColor = vec4(col, vAlpha * uOpacity * 0.5);
}`;

/* ---- Aurora lights (full-screen pass behind everything) ---- */
const AURORA_VERTEX = /* glsl */ `
varying vec2 vUv;
void main(){
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}`;

const AURORA_FRAGMENT = /* glsl */ `
uniform float uTime;
uniform float uPhase;       // advances with the scroll, so the lights move between sections
uniform float uAspect;
uniform float uIntensity;
uniform vec3 uMint;
uniform vec3 uBlue;
uniform vec3 uViolet;
varying vec2 vUv;
${NOISE_GLSL}
vec3 light(vec2 uv, vec2 centre, float radius, vec3 colour){
  vec2 d = (uv - centre) * vec2(uAspect, 1.0);
  return colour * exp(-dot(d, d) / (radius * radius));
}
float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
void main(){
  float t = uTime * 0.05;
  vec2 uv = vUv + snoise(vec3(vUv * 1.3, t)) * 0.07;
  vec3 c = vec3(0.0);
  c += light(uv, vec2(0.74 + 0.12 * sin(uPhase * 1.3 + t), 0.50 + 0.12 * cos(uPhase * 0.9)), 0.44, uMint) * 0.17;
  c += light(uv, vec2(0.30 + 0.26 * sin(uPhase * 0.8 + 2.0), 0.32 + 0.14 * sin(uPhase * 1.1 + t * 1.3)), 0.52, uBlue) * 0.14;
  c += light(uv, vec2(0.55 + 0.30 * cos(uPhase * 0.6 + 4.0), 0.88), 0.40, uViolet) * 0.09;
  c *= (0.8 + 0.2 * snoise(vec3(vUv * 2.4, t * 1.5))) * uIntensity;
  c += (hash(gl_FragCoord.xy) - 0.5) / 255.0;          // dither: hides banding in the dark gradients
  float a = clamp(max(c.r, max(c.g, c.b)), 0.0, 1.0);
  gl_FragColor = vec4(c / max(a, 0.0001), a);
}`;

/* ---- Dust ---- */
const DUST_VERTEX = /* glsl */ `
attribute float aSize;
attribute float aPhase;
uniform float uTime;
uniform float uPixelRatio;
varying float vTwinkle;
void main(){
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vTwinkle = 0.55 + 0.45 * sin(uTime * 0.9 + aPhase);
  gl_PointSize = aSize * 16.0 * uPixelRatio / -mv.z;
  gl_Position = projectionMatrix * mv;
}`;

const DUST_FRAGMENT = /* glsl */ `
uniform vec3 uColor;
uniform float uOpacity;
varying float vTwinkle;
void main(){
  float d = length(gl_PointCoord - 0.5);
  gl_FragColor = vec4(uColor, smoothstep(0.5, 0.05, d) * vTwinkle * uOpacity);
}`;

const lerp       = (a, b, t) => a + (b - a) * t;
const clamp01    = v => Math.min(1, Math.max(0, v));
const smoothstep = (a, b, v) => { const t = clamp01((v - a) / (b - a)); return t * t * (3 - 2 * t); };

function init() {
  const canvas = document.getElementById("scene");
  if (!canvas) return;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true, powerPreference: "high-performance" });
  } catch (_) {
    document.documentElement.classList.add("no-webgl");
    return;
  }
  renderer.setClearColor(0x000000, 0);

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
  const small  = window.innerWidth < 900;

  /* ---- Aurora ---- */
  const auroraMat = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 }, uPhase: { value: 0 }, uAspect: { value: 1 }, uIntensity: { value: 1 },
      uMint: { value: MINT }, uBlue: { value: BLUE }, uViolet: { value: VIOLET },
    },
    vertexShader: AURORA_VERTEX,
    fragmentShader: AURORA_FRAGMENT,
    transparent: true, depthTest: false, depthWrite: false,
  });
  const aurora = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), auroraMat);
  aurora.frustumCulled = false;
  aurora.renderOrder = -10;
  scene.add(aurora);

  /* ---- Wave field ---- */
  const COLS = small ? 130 : 240;
  const ROWS = small ? 80 : 130;
  const fieldPos = new Float32Array(COLS * ROWS * 3);
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const i = (r * COLS + c) * 3;
      fieldPos[i]     = lerp(-FIELD.halfX, FIELD.halfX, c / (COLS - 1));
      fieldPos[i + 1] = 0;
      fieldPos[i + 2] = lerp(FIELD.nearZ, FIELD.farZ, r / (ROWS - 1));
    }
  }
  const fieldGeo = new THREE.BufferGeometry();
  fieldGeo.setAttribute("position", new THREE.BufferAttribute(fieldPos, 3));
  const fieldMat = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 }, uTravel: { value: 0 }, uShift: { value: 0 }, uAmp: { value: 1 }, uMask: { value: 1 },
      uSize: { value: small ? 13 : 15 }, uPixelRatio: { value: 1 }, uHalfX: { value: FIELD.halfX },
      uColorA: { value: MINT }, uColorB: { value: BLUE }, uOpacity: { value: 1 },
    },
    vertexShader: FIELD_VERTEX,
    fragmentShader: FIELD_FRAGMENT,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  });
  const points = new THREE.Points(fieldGeo, fieldMat);
  points.frustumCulled = false;

  const rowIndex = new Uint16Array(ROWS * (COLS - 1) * 2);
  for (let r = 0, k = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS - 1; c++) {
      rowIndex[k++] = r * COLS + c;
      rowIndex[k++] = r * COLS + c + 1;
    }
  }
  const lineGeo = new THREE.BufferGeometry();
  lineGeo.setAttribute("position", fieldGeo.attributes.position);
  lineGeo.setIndex(new THREE.BufferAttribute(rowIndex, 1));
  const lineMat = new THREE.ShaderMaterial({
    uniforms: fieldMat.uniforms,                       // shared, so both stay in sync
    vertexShader: FIELD_VERTEX,
    fragmentShader: FIELD_LINE_FRAGMENT,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  });
  const lines = new THREE.LineSegments(lineGeo, lineMat);
  lines.frustumCulled = false;

  const field = new THREE.Group();
  field.add(lines, points);
  scene.add(field);

  /* ---- Dust ---- */
  const DUST = small ? 260 : 600;
  const dustPos = new Float32Array(DUST * 3);
  const dustSize = new Float32Array(DUST);
  const dustPhase = new Float32Array(DUST);
  for (let i = 0; i < DUST; i++) {
    dustPos[i * 3]     = (Math.random() - 0.5) * 34;
    dustPos[i * 3 + 1] = Math.random() * 16 - 1;
    dustPos[i * 3 + 2] = -Math.random() * 22 + 2;
    dustSize[i]  = 0.6 + Math.random() * 1.4;
    dustPhase[i] = Math.random() * Math.PI * 2;
  }
  const dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPos, 3));
  dustGeo.setAttribute("aSize",    new THREE.BufferAttribute(dustSize, 1));
  dustGeo.setAttribute("aPhase",   new THREE.BufferAttribute(dustPhase, 1));
  const dustMat = new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uPixelRatio: { value: 1 }, uColor: { value: new THREE.Color("#b9d6ff") }, uOpacity: { value: 0.6 } },
    vertexShader: DUST_VERTEX,
    fragmentShader: DUST_FRAGMENT,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  });
  const dust = new THREE.Points(dustGeo, dustMat);
  dust.frustumCulled = false;
  scene.add(dust);

  /* ---- Sizing ---- */
  let width = 0, height = 0;
  function resize() {
    width  = window.innerWidth;
    height = window.innerHeight;
    const ratio = Math.min(window.devicePixelRatio || 1, width < 900 ? 1.5 : 2);
    renderer.setPixelRatio(ratio);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    auroraMat.uniforms.uAspect.value = camera.aspect;
    fieldMat.uniforms.uPixelRatio.value = ratio;
    dustMat.uniforms.uPixelRatio.value = ratio;
  }
  resize();
  window.addEventListener("resize", resize);

  /* ---- Input ---- */
  const pointer = { x: 0, y: 0, sx: 0, sy: 0 };
  if (!REDUCED) {
    window.addEventListener("pointermove", e => {
      pointer.x = (e.clientX / width) * 2 - 1;
      pointer.y = (e.clientY / height) * 2 - 1;
    }, { passive: true });
  }

  /* ---- Scroll choreography ----
     One camera keyframe per page section:
     camY  camera height above the waves      lookY  where it looks (higher = horizon lower on screen)
     yaw   field rotation                     amp    wave height
     o     field opacity                      mask   1 dims the left of the screen */
  const sections = ["inicio", "sobre-mi", "experiencia", "proyectos", "skills", "educacion", "contacto"]
    .map(id => document.getElementById(id));
  const GALLERY = 3;
  const KEYS = [
    { camY: 2.6, lookY:  0.8, yaw: -0.20, amp: 1.0, o: 0.95, mask: 1 },  // hero
    { camY: 3.6, lookY:  0.0, yaw:  0.22, amp: 1.3, o: 0.42, mask: 0 },  // about
    { camY: 1.7, lookY:  1.3, yaw: -0.15, amp: 0.8, o: 0.40, mask: 0 },  // experience
    { camY: 2.2, lookY:  0.9, yaw:  0.00, amp: 1.5, o: 0.62, mask: 0 },  // projects
    { camY: 4.6, lookY: -1.2, yaw:  0.28, amp: 1.1, o: 0.36, mask: 0 },  // skills
    { camY: 2.0, lookY:  1.0, yaw: -0.25, amp: 0.9, o: 0.42, mask: 0 },  // education
    { camY: 2.4, lookY:  0.7, yaw:  0.10, amp: 1.2, o: 0.72, mask: 0 },  // contact
  ];
  const KEY_PROPS = Object.keys(KEYS[0]);
  const target = { ...KEYS[0], shift: 0 };
  const cur    = { ...target };

  /* ---- Frame ---- */
  const clock = new THREE.Clock();
  const lookAt = new THREE.Vector3();
  let time = 0;
  let energy = 0;
  let travel = 0;
  let lastScroll = window.scrollY;
  let running = true;
  let firstFrame = true;

  function frame() {
    if (!running) return;
    requestAnimationFrame(frame);

    const dt = Math.min(clock.getDelta(), 0.05);
    time += dt * (REDUCED ? 0.15 : 1);

    const fx      = window.__scrollFx || { hero: 0, gallery: 0 };
    const scrollY = window.scrollY;
    const p       = scrollY / (height || 1);          // viewports scrolled
    const wide    = camera.aspect > 1.15;

    // Scrolling fast swells the waves
    energy = lerp(energy, Math.min(Math.abs(scrollY - lastScroll) / 60, 1), 0.08);
    lastScroll = scrollY;

    pointer.sx = lerp(pointer.sx, pointer.x, 0.05);
    pointer.sy = lerp(pointer.sy, pointer.y, 0.05);

    // Which section owns the viewport centre, and how far the hand-off to the next one has gone
    const centre = height * 0.5;
    let index = 0;
    let nextTop = Infinity;
    for (let i = 0; i < sections.length; i++) {
      if (!sections[i]) continue;
      const top = sections[i].getBoundingClientRect().top;
      if (top <= centre) index = i;
      else { nextTop = top; break; }
    }
    const next = Math.min(index + 1, KEYS.length - 1);
    const mix  = next === index ? 0 : smoothstep(centre + height * 0.6, centre, nextTop);
    KEY_PROPS.forEach(k => { target[k] = lerp(KEYS[index][k], KEYS[next][k], mix); });
    target.shift = 0;
    if (!wide) { target.mask = 0; target.o *= 0.75; }

    // Pinned hero: the camera dives towards the waves
    if (index === 0) {
      const dive = smoothstep(0, 1, fx.hero) * (1 - mix);
      target.camY  = lerp(target.camY, 1.15, dive);
      target.lookY = lerp(target.lookY, 1.0, dive);
      target.amp  += 0.55 * dive;
      target.mask  = lerp(target.mask, 0, dive);
    }
    // Pinned gallery: the camera pans and the waves drift sideways with the cards
    const inGallery = index === GALLERY ? 1 - mix : next === GALLERY ? mix : 0;
    if (inGallery > 0) {
      target.yaw  += lerp(-0.28, 0.28, fx.gallery) * inGallery;
      target.shift = fx.gallery * 2.2 * inGallery;
    }

    const follow = firstFrame ? 1 : 1 - Math.exp(-dt * 4.5);
    for (const k in cur) cur[k] = lerp(cur[k], target[k], follow);
    travel = firstFrame ? p * 1.25 : lerp(travel, p * 1.25, 1 - Math.exp(-dt * 6));

    field.rotation.y = cur.yaw + pointer.sx * 0.04;
    fieldMat.uniforms.uTime.value    = time;
    fieldMat.uniforms.uTravel.value  = travel;
    fieldMat.uniforms.uShift.value   = cur.shift;
    fieldMat.uniforms.uAmp.value     = cur.amp + energy * 0.45;
    fieldMat.uniforms.uMask.value    = cur.mask;
    fieldMat.uniforms.uOpacity.value = cur.o;

    auroraMat.uniforms.uTime.value  = time;
    auroraMat.uniforms.uPhase.value = travel * 0.55;
    auroraMat.uniforms.uIntensity.value = 0.85 + cur.o * 0.35;

    dustMat.uniforms.uTime.value = time;
    dust.position.y = p * 0.35;
    dust.rotation.y = time * 0.006;

    camera.position.set(pointer.sx * 0.35, cur.camY - pointer.sy * 0.15, 6);
    lookAt.set(pointer.sx * 0.2, cur.lookY, -8);
    camera.lookAt(lookAt);

    renderer.render(scene, camera);

    if (firstFrame) { firstFrame = false; canvas.classList.add("ready"); }
  }

  document.addEventListener("visibilitychange", () => {
    const visible = document.visibilityState === "visible";
    if (visible && !running) { running = true; clock.getDelta(); frame(); }
    else if (!visible) running = false;
  });

  frame();
}

init();
