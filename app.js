// ======================
// SETUP
// ======================

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111111);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

camera.position.set(0, 0, 10);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// ======================
// DATA
// ======================

let points = [];
let pointMeshes = [];
let hullMesh = null;

// ======================
// UI EVENT
// ======================

document.getElementById("addBtn").addEventListener("click", addPoint);

function addPoint() {
  const x = parseFloat(document.getElementById("x").value);
  const y = parseFloat(document.getElementById("y").value);
  const z = parseFloat(document.getElementById("z").value);

  if (isNaN(x) || isNaN(y) || isNaN(z)) return;

  const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(0.12),
    new THREE.MeshBasicMaterial({ color: "white" })
  );

  sphere.position.set(x, y, z);
  scene.add(sphere);

  pointMeshes.push(sphere);
  points.push([x, y, z]);

  updateHull();
}

// ======================
// BACKEND CALL
// ======================

async function updateHull() {
  if (points.length < 4) return;

  const res = await fetch("http://127.0.0.1:5000/hull", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ points })
  });

  const data = await res.json();

  drawHull(data);
}

// ======================
// RENDER HULL
// ======================

function drawHull(data) {
  if (!data || !data.simplices) return;

  if (hullMesh) scene.remove(hullMesh);

  const positions = [];
  const colors = [];

  data.simplices.forEach(face => {
    const a = data.vertices[face[0]];
    const b = data.vertices[face[1]];
    const c = data.vertices[face[2]];

    // random color per face
    const color = new THREE.Color(Math.random(), Math.random(), Math.random());

    // push vertices
    positions.push(...a, ...b, ...c);

    // same color for all 3 vertices of the triangle
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

  hullMesh = new THREE.Mesh(
    geometry,
    new THREE.MeshBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide
    })
  );

  scene.add(hullMesh);
}

// ======================
// CAMERA CONTROLS
// ======================

let isRightMouseDown = false;

let theta = 0;   // horizontal angle
let phi = 0;     // vertical angle
let radius = 10; // zoom distance

let target = new THREE.Vector3(0, 0, 0);

let lastMouse = { x: 0, y: 0 };

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

  let dx = e.clientX - lastMouse.x;
  let dy = e.clientY - lastMouse.y;

  lastMouse.x = e.clientX;
  lastMouse.y = e.clientY;

  const sensitivity = 0.005;

  theta -= dx * sensitivity;
  phi -= dy * sensitivity;

  // clamp vertical rotation
  phi = Math.max(-1.5, Math.min(1.5, phi));
});

window.addEventListener("wheel", (e) => {
  radius += e.deltaY * 0.01;
  radius = Math.max(2, Math.min(50, radius));
});

// ======================
// LOOP
// ======================

function animate() {
  requestAnimationFrame(animate);

  // spherical orbit camera
  camera.position.x = target.x + radius * Math.cos(phi) * Math.sin(theta);
  camera.position.y = target.y + radius * Math.sin(phi);
  camera.position.z = target.z + radius * Math.cos(phi) * Math.cos(theta);

  camera.lookAt(target);

  renderer.render(scene, camera);
}

animate();