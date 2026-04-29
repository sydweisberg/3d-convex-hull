// ======================
// RENDERER
// ======================

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// ======================
// SCENES + CAMERAS
// ======================

const sceneL = new THREE.Scene();
const sceneR = new THREE.Scene();

sceneL.background = new THREE.Color(0x36454F);
sceneR.background = new THREE.Color(0x36454F);

const cameraL = new THREE.PerspectiveCamera(75, window.innerWidth/2/window.innerHeight, 0.1, 1000);
const cameraR = new THREE.PerspectiveCamera(75, window.innerWidth/2/window.innerHeight, 0.1, 1000);

cameraL.position.set(0, 0, 10);
cameraR.position.set(0, 0, 10);

// ======================
// GROUPS
// ======================

const groupL = new THREE.Group();
const groupR = new THREE.Group();

sceneL.add(groupL);
sceneR.add(groupR);

// ======================
// GRIDS
// ======================

function makeGrid() {
  const g = new THREE.GridHelper(20, 20, 0x4a6a5a, 0x2a3a32);
  g.position.y = -4;
  return g;
}

sceneL.add(makeGrid());
sceneR.add(makeGrid());

// ======================
// STATE
// ======================

let pointsL = [];
let pointsR = [];

let meshesL = [];
let meshesR = [];

let hullL = null;
let hullR = null;

let activeSide = "L";
let editMode = true;

let overlapT = 0;

// ======================
// UI
// ======================

document.getElementById("toggleSide").addEventListener("click", () => {
  activeSide = activeSide === "L" ? "R" : "L";
  document.getElementById("toggleSide").innerText =
    `Active: ${activeSide === "L" ? "LEFT" : "RIGHT"}`;
});

document.getElementById("toggleEdit").addEventListener("click", () => {
  editMode = !editMode;
  document.getElementById("toggleEdit").innerText =
    `Edit Mode: ${editMode ? "ON" : "OFF"}`;
});

document.getElementById("addBtn").addEventListener("click", () => {
  if (!editMode) return;

  const x = parseFloat(document.getElementById("x").value);
  const y = parseFloat(document.getElementById("y").value);
  const z = parseFloat(document.getElementById("z").value);

  addPoint(x, y, z);
});

document.getElementById("overlapSlider").addEventListener("input", (e) => {
  overlapT = parseFloat(e.target.value);
});

document.getElementById("resetView").addEventListener("click", () => {
  theta = 0;
  phi = 0;
  radius = 10;
});

// ======================
// ADD POINT
// ======================

function addPoint(x, y, z) {
  const group = activeSide === "L" ? groupL : groupR;
  const points = activeSide === "L" ? pointsL : pointsR;
  const meshes = activeSide === "L" ? meshesL : meshesR;

  const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(0.12),
    new THREE.MeshBasicMaterial({ color: "white" })
  );

  sphere.position.set(x, y, z);
  group.add(sphere);

  meshes.push(sphere);
  points.push([x, y, z]);

  updateHull(activeSide);
}

// ======================
// CONVEX HULL (JS)
// ======================

function computeConvexHull(rawPoints) {
  const seen = new Set();
  const pts = [];
  for (const p of rawPoints) {
    const k = `${p[0].toFixed(8)},${p[1].toFixed(8)},${p[2].toFixed(8)}`;
    if (!seen.has(k)) { seen.add(k); pts.push([p[0], p[1], p[2]]); }
  }
  if (pts.length < 4) return null;

  const sub   = (a, b) => [a[0]-b[0], a[1]-b[1], a[2]-b[2]];
  const cross = (a, b) => [a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]];
  const dot   = (a, b) => a[0]*b[0] + a[1]*b[1] + a[2]*b[2];
  const norm  = v => { const l = Math.sqrt(dot(v,v)); return l < 1e-12 ? null : [v[0]/l, v[1]/l, v[2]/l]; };

  function makeFace(i0, i1, i2, insideIdx) {
    const n = cross(sub(pts[i1], pts[i0]), sub(pts[i2], pts[i0]));
    const nn = norm(n);
    if (!nn) return null;
    const off = dot(nn, pts[i0]);
    const d = dot(nn, pts[insideIdx]) - off;
    if (d > 0) return { verts: [i0, i2, i1], normal: [-nn[0],-nn[1],-nn[2]], offset: -off };
    return           { verts: [i0, i1, i2], normal: nn, offset: off };
  }

  let seed = null;
  outer:
  for (let a = 0; a < pts.length; a++)
  for (let b = a+1; b < pts.length; b++)
  for (let c = b+1; c < pts.length; c++) {
    const n = cross(sub(pts[b], pts[a]), sub(pts[c], pts[a]));
    if (dot(n,n) < 1e-14) continue;
    const nn = norm(n), off = dot(nn, pts[a]);
    for (let d = c+1; d < pts.length; d++) {
      if (Math.abs(dot(nn, pts[d]) - off) > 1e-8) { seed = [a,b,c,d]; break outer; }
    }
  }
  if (!seed) return null;

  const [s0,s1,s2,s3] = seed;
  let faces = [
    makeFace(s0,s1,s2,s3), makeFace(s0,s1,s3,s2),
    makeFace(s0,s2,s3,s1), makeFace(s1,s2,s3,s0),
  ].filter(Boolean);

  for (let pi = 0; pi < pts.length; pi++) {
    if (seed.includes(pi)) continue;
    const p = pts[pi];

    const visible = faces.filter(f => dot(f.normal, p) - f.offset > 1e-8);
    if (visible.length === 0) continue;

    const edgeCount = new Map();
    for (const f of visible) {
      const v = f.verts;
      for (const [a, b] of [[v[0],v[1]], [v[1],v[2]], [v[2],v[0]]]) {
        const key = a < b ? `${a},${b}` : `${b},${a}`;
        edgeCount.set(key, (edgeCount.get(key) || 0) + 1);
      }
    }
    const horizon = [];
    for (const [key, cnt] of edgeCount)
      if (cnt === 1) horizon.push(key.split(',').map(Number));

    faces = faces.filter(f => !visible.includes(f));

    let cx = 0, cy = 0, cz = 0, n = 0;
    for (const f of faces) for (const vi of f.verts) {
      cx += pts[vi][0]; cy += pts[vi][1]; cz += pts[vi][2]; n++;
    }
    if (n === 0) continue;
    const interior = [cx/n, cy/n, cz/n];

    for (const [a, b] of horizon) {
      const nf = makeFace(pi, a, b, -1);
      if (!nf) continue;
      if (dot(nf.normal, interior) - nf.offset > 0) {
        nf.verts  = [nf.verts[0], nf.verts[2], nf.verts[1]];
        nf.normal = [-nf.normal[0], -nf.normal[1], -nf.normal[2]];
        nf.offset = -nf.offset;
      }
      faces.push(nf);
    }
  }

  return { vertices: pts, simplices: faces.map(f => f.verts) };
}

// ======================
// UPDATE HULL
// ======================

function updateHull(side) {
  const points = side === "L" ? pointsL : pointsR;

  if (points.length < 4) return;

  const data = computeConvexHull(points);
  drawHull(side, data);
}

// ======================
// DRAW HULL
// ======================

function drawHull(side, data) {
  if (!data || !data.simplices) return;

  const group = side === "L" ? groupL : groupR;

  if (side === "L" && hullL) group.remove(hullL);
  if (side === "R" && hullR) group.remove(hullR);

  const positions = [];
  const colors = [];

  data.simplices.forEach(face => {
    const a = data.vertices[face[0]];
    const b = data.vertices[face[1]];
    const c = data.vertices[face[2]];

    const color = new THREE.Color(Math.random(), Math.random(), Math.random());

    positions.push(...a, ...b, ...c);

    for (let i = 0; i < 3; i++) {
      colors.push(color.r, color.g, color.b);
    }
  });

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));

  const mesh = new THREE.Mesh(
    geometry,
    new THREE.MeshBasicMaterial({
      vertexColors: true,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85
    })
  );

  group.add(mesh);

  if (side === "L") hullL = mesh;
  else hullR = mesh;
}

// ======================
// ORBIT CAMERA (SHARED)
// ======================

let theta = 0;
let phi = 0;
let radius = 10;

let dragging = false;
let lastMouse = { x: 0, y: 0 };

window.addEventListener("contextmenu", e => e.preventDefault());

window.addEventListener("mousedown", (e) => {
  if (e.button === 2) {
    dragging = true;
    lastMouse.x = e.clientX;
    lastMouse.y = e.clientY;
  }
});

window.addEventListener("mouseup", (e) => {
  if (e.button === 2) dragging = false;
});

window.addEventListener("mousemove", (e) => {
  if (!dragging) return;

  const dx = e.clientX - lastMouse.x;
  const dy = e.clientY - lastMouse.y;

  lastMouse.x = e.clientX;
  lastMouse.y = e.clientY;

  theta -= dx * 0.005;
  phi -= dy * 0.005;

  phi = Math.max(-1.5, Math.min(1.5, phi));
});

window.addEventListener("wheel", (e) => {
  radius += e.deltaY * 0.01;
  radius = Math.max(2, Math.min(50, radius));
});

// ======================
// RENDER LOOP (SPLIT SCREEN)
// ======================

function animate() {
  requestAnimationFrame(animate);

  const w = window.innerWidth;
  const h = window.innerHeight;

  const x = radius * Math.cos(phi) * Math.sin(theta);
  const y = radius * Math.sin(phi);
  const z = radius * Math.cos(phi) * Math.cos(theta);

  cameraL.position.set(x, y, z);
  cameraR.position.set(x, y, z);

  cameraL.lookAt(0, 0, 0);
  cameraR.lookAt(0, 0, 0);

  const maxDistance = 25;
  const offset = (overlapT - 0.5) * maxDistance * 2;

  groupL.position.x = -offset;
  groupR.position.x = offset;

  renderer.setScissorTest(true);

  // LEFT
  renderer.setViewport(0, 0, w/2, h);
  renderer.setScissor(0, 0, w/2, h);
  renderer.render(sceneL, cameraL);

  // RIGHT
  renderer.setViewport(w/2, 0, w/2, h);
  renderer.setScissor(w/2, 0, w/2, h);
  renderer.render(sceneR, cameraR);

  renderer.setScissorTest(false);
}

animate();