// ======================
// SETUP
// ======================

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// ======================
// TWO SCENES
// ======================

const sceneL = new THREE.Scene();
const sceneR = new THREE.Scene();

sceneL.background = new THREE.Color(0x111111);
sceneR.background = new THREE.Color(0x111111);

const cameraL = new THREE.PerspectiveCamera(
  75,
  (window.innerWidth / 2) / window.innerHeight,
  0.1,
  1000
);

const cameraR = new THREE.PerspectiveCamera(
  75,
  (window.innerWidth / 2) / window.innerHeight,
  0.1,
  1000
);

cameraL.position.set(0, 0, 10);
cameraR.position.set(0, 0, 10);

// ======================
// DATA
// ======================

let pointsL = [];
let pointsR = [];

let meshesL = [];
let meshesR = [];

let hullL = null;
let hullR = null;

// ======================
// ACTIVE SIDE
// ======================

let activeSide = "L";

document.getElementById("toggleSide").addEventListener("click", () => {
  activeSide = activeSide === "L" ? "R" : "L";
  document.getElementById("toggleSide").innerText =
    `Active: ${activeSide === "L" ? "LEFT" : "RIGHT"}`;
});

// ======================
// POINT INPUT (X Y Z UI)
// ======================

document.getElementById("addBtn").addEventListener("click", () => {
  const x = parseFloat(document.getElementById("x").value);
  const y = parseFloat(document.getElementById("y").value);
  const z = parseFloat(document.getElementById("z").value);

  if (isNaN(x) || isNaN(y) || isNaN(z)) return;

  addPoint(x, y, z);
});

// ======================
// ADD POINT
// ======================

function addPoint(x, y, z) {
  const scene = activeSide === "L" ? sceneL : sceneR;
  const points = activeSide === "L" ? pointsL : pointsR;
  const meshes = activeSide === "L" ? meshesL : meshesR;

  const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(0.12),
    new THREE.MeshBasicMaterial({ color: "white" })
  );

  sphere.position.set(x, y, z);
  scene.add(sphere);

  meshes.push(sphere);
  points.push([x, y, z]);

  updateHull(activeSide);
}

// ======================
// BACKEND CALL
// ======================

async function updateHull(side) {
  const points = side === "L" ? pointsL : pointsR;

  if (points.length < 4) return;

  const res = await fetch("http://127.0.0.1:5000/hull", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ points })
  });

  const data = await res.json();

  drawHull(side, data);
}

// ======================
// DRAW HULL (COLORED FACES)
// ======================

function drawHull(side, data) {
  if (!data || !data.simplices) return;

  const scene = side === "L" ? sceneL : sceneR;

  if (side === "L" && hullL) scene.remove(hullL);
  if (side === "R" && hullR) scene.remove(hullR);

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

  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3)
  );

  geometry.setAttribute(
    "color",
    new THREE.Float32BufferAttribute(colors, 3)
  );

  const mesh = new THREE.Mesh(
    geometry,
    new THREE.MeshBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      side: THREE.DoubleSide
    })
  );

  scene.add(mesh);

  if (side === "L") hullL = mesh;
  else hullR = mesh;
}

// ======================
// RIGHT CLICK ORBIT (BOTH CAMERAS SHARED LOGIC)
// ======================

let isRightMouseDown = false;
let theta = 0;
let phi = 0;
let radius = 10;

let lastMouse = { x: 0, y: 0 };

window.addEventListener("contextmenu", e => e.preventDefault());

window.addEventListener("mousedown", (e) => {
  if (e.button === 2) {
    isRightMouseDown = true;
    lastMouse.x = e.clientX;
    lastMouse.y = e.clientY;
  }
});

window.addEventListener("mouseup", (e) => {
  if (e.button === 2) {
    isRightMouseDown = false;
  }
});

window.addEventListener("mousemove", (e) => {
  if (!isRightMouseDown) return;

  const dx = e.clientX - lastMouse.x;
  const dy = e.clientY - lastMouse.y;

  lastMouse.x = e.clientX;
  lastMouse.y = e.clientY;

  const sensitivity = 0.005;

  theta -= dx * sensitivity;
  phi -= dy * sensitivity;

  phi = Math.max(-1.5, Math.min(1.5, phi));
});

window.addEventListener("wheel", (e) => {
  radius += e.deltaY * 0.01;

  // clamp zoom so you don't break the scene
  radius = Math.max(2, Math.min(50, radius));
});

// ======================
// RENDER LOOP (SPLIT SCREEN)
// ======================

function animate() {
  requestAnimationFrame(animate);

  const width = window.innerWidth;
  const height = window.innerHeight;

  const x = radius * Math.cos(phi) * Math.sin(theta);
  const y = radius * Math.sin(phi);
  const z = radius * Math.cos(phi) * Math.cos(theta);

  // LEFT CAMERA
  cameraL.position.set(x, y, z);
  cameraL.lookAt(0, 0, 0);

  // RIGHT CAMERA
  cameraR.position.set(x, y, z);
  cameraR.lookAt(0, 0, 0);

  renderer.setScissorTest(true);

  // LEFT VIEW
  renderer.setViewport(0, 0, width / 2, height);
  renderer.setScissor(0, 0, width / 2, height);
  renderer.render(sceneL, cameraL);

  // RIGHT VIEW
  renderer.setViewport(width / 2, 0, width / 2, height);
  renderer.setScissor(width / 2, 0, width / 2, height);
  renderer.render(sceneR, cameraR);

  renderer.setScissorTest(false);
}

animate();