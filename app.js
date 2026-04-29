// ======================
// CONFIG
// ======================

const API = "http://localhost:5000";

// ======================
// RENDERER
// ======================

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document.body.appendChild(renderer.domElement);

window.addEventListener("resize", () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});

// ======================
// SCENE + CAMERA
// ======================

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111827);

const camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 14);

// ======================
// LIGHTS
// ======================

scene.add(new THREE.AmbientLight(0xffffff, 0.4));
const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
dirLight.position.set(5, 10, 7);
scene.add(dirLight);

// ======================
// GRID
// ======================

const grid = new THREE.GridHelper(30, 30, 0x1e3a5f, 0x162030);
grid.position.y = -5;
scene.add(grid);

// ======================
// GROUPS
// ======================

const groupL = new THREE.Group();
const groupR = new THREE.Group();
scene.add(groupL);
scene.add(groupR);

// ======================
// STATE
// ======================

let pointsL = [];
let pointsR = [];

let hullL = null;
let hullR = null;

let activeSide = "L";
let editMode   = true;

let offsetL = 0;
let offsetR = 0;

let gjkDebounce = null;

// ======================
// COLORS
// ======================

const COLOR_L   = new THREE.Color(0x4fc3f7);
const COLOR_R   = new THREE.Color(0xf48fb1);
const COLOR_COL = new THREE.Color(0xff6e6e);

// ======================
// UI
// ======================

const btnToggleSide = document.getElementById("toggleSide");
const btnToggleEdit = document.getElementById("toggleEdit");
const btnAdd        = document.getElementById("addBtn");
const btnReset      = document.getElementById("resetView");
const slider        = document.getElementById("overlapSlider");
const editRow       = document.getElementById("edit-row");
const sliderRow     = document.getElementById("slider-row");
const statusBadge   = document.getElementById("collision-status");
const dragHint      = document.getElementById("drag-hint");

btnToggleSide.addEventListener("click", () => {
  activeSide = activeSide === "L" ? "R" : "L";
  btnToggleSide.innerText = `Active: ${activeSide === "L" ? "LEFT" : "RIGHT"}`;
  btnToggleSide.className = activeSide === "L" ? "active-l" : "active-r";
});

btnToggleEdit.addEventListener("click", () => {
  editMode = !editMode;
  btnToggleEdit.innerText = `Edit Mode: ${editMode ? "ON" : "OFF"}`;
  btnToggleEdit.className = editMode ? "edit-on" : "edit-off";
  editRow.style.display   = editMode ? "flex"   : "none";
  sliderRow.style.display = editMode ? "none"   : "flex";
  dragHint.style.display  = editMode ? "none"   : "block";

  if (!editMode) {
    offsetL = -5;
    offsetR =  5;
    updateGroupPositions();
    statusBadge.className = "idle";
    statusBadge.innerText = "—";
  } else {
    offsetL = 0;
    offsetR = 0;
    updateGroupPositions();
  }
});

btnAdd.addEventListener("click", () => {
  if (!editMode) return;
  const x = parseFloat(document.getElementById("x").value) || 0;
  const y = parseFloat(document.getElementById("y").value) || 0;
  const z = parseFloat(document.getElementById("z").value) || 0;
  addPoint(x, y, z);
});

btnReset.addEventListener("click", () => {
  theta = 0; phi = 0.2; radius = 14;
});

slider.addEventListener("input", () => {
  if (editMode) return;
  const t = parseFloat(slider.value); // 0 = far apart, 1 = fully overlapping
  // t=0 → ±10 apart, t=0.5 → touching at origin, t=1 → ±2 overlapping
  offsetL = -10 + t * 12;
  offsetR =  10 - t * 12;
  updateGroupPositions();
  scheduleGjk();
});

// ======================
// ADD POINT
// ======================

function addPoint(x, y, z) {
  const group  = activeSide === "L" ? groupL  : groupR;
  const points = activeSide === "L" ? pointsL : pointsR;
  const color  = activeSide === "L" ? COLOR_L : COLOR_R;

  const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(0.14, 12, 8),
    new THREE.MeshBasicMaterial({ color })
  );
  sphere.position.set(x, y, z);
  group.add(sphere);
  points.push([x, y, z]);

  fetchAndDrawHull(activeSide);
}

// ======================
// JS CONVEX HULL (no backend needed for visuals)
// ======================

async function fetchAndDrawHull(side) {
  const points = side === "L" ? pointsL : pointsR;
  console.log(`[hull] side=${side} points=${points.length}`);
  if (points.length < 4) {
    console.log(`[hull] skipping — need at least 4, have ${points.length}`);
    return;
  }

  const url = `${API}/hull`;
  console.log(`[hull] POSTing to ${url}`, points);

  try {
    const res = await fetch(url, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ points })
    });
    console.log(`[hull] response status: ${res.status}`);
    if (!res.ok) {
      const txt = await res.text();
      console.error("[hull] non-OK response:", txt);
      return;
    }
    const data = await res.json();
    console.log(`[hull] got ${data.simplices?.length} faces`);
    drawHull(side, data);
  } catch (e) {
    console.error("[hull] fetch threw:", e);
  }
}

// ======================
// DRAW HULL
// ======================

function drawHull(side, data) {
  if (!data || !data.simplices) return;

  const group     = side === "L" ? groupL  : groupR;
  const baseColor = side === "L" ? COLOR_L : COLOR_R;

  if (side === "L" && hullL) { group.remove(hullL); hullL = null; }
  if (side === "R" && hullR) { group.remove(hullR); hullR = null; }

  const positions = [];
  const colors    = [];

  data.simplices.forEach(face => {
    const a = data.vertices[face[0]];
    const b = data.vertices[face[1]];
    const c = data.vertices[face[2]];

    const fc = baseColor.clone();
    fc.offsetHSL(0, 0, (Math.random() - 0.5) * 0.1);

    positions.push(...a, ...b, ...c);
    for (let i = 0; i < 3; i++) colors.push(fc.r, fc.g, fc.b);
  });

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute("color",    new THREE.Float32BufferAttribute(colors,    3));

  const mesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({
    vertexColors: true,
    side:         THREE.DoubleSide,
    transparent:  true,
    opacity:      0.72,
  }));

  mesh.add(new THREE.LineSegments(
    new THREE.WireframeGeometry(geo),
    new THREE.LineBasicMaterial({ color: baseColor, transparent: true, opacity: 0.4 })
  ));

  group.add(mesh);

  if (side === "L") hullL = mesh;
  else              hullR = mesh;
}

// ======================
// GROUP POSITIONS
// ======================

function updateGroupPositions() {
  groupL.position.x = offsetL;
  groupR.position.x = offsetR;
  // Y and Z are managed directly by the drag handler
}

// ======================
// GJK
// ======================

function scheduleGjk() {
  clearTimeout(gjkDebounce);
  gjkDebounce = setTimeout(runGjk, 60);
}

async function runGjk() {
  if (pointsL.length < 4 || pointsR.length < 4) return;

  try {
    const res = await fetch(`${API}/gjk`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({
        pointsL: pointsL,
        pointsR: pointsR,
        offsetL: [groupL.position.x, groupL.position.y, groupL.position.z],
        offsetR: [groupR.position.x, groupR.position.y, groupR.position.z],
      })
    });

    if (!res.ok) { console.warn("GJK error", await res.json()); return; }

    const result = await res.json();
    updateCollisionFeedback(result);
  } catch (e) {
    console.warn("GJK fetch failed:", e);
  }
}

function updateCollisionFeedback(gjk) {
  if (gjk.colliding) {
    statusBadge.className = "hit";
    statusBadge.innerText = "COLLISION";
    tintHulls(true);
  } else {
    statusBadge.className = "clear";
    statusBadge.innerText = `CLEAR  d=${gjk.distance.toFixed(2)}`;
    tintHulls(false);
  }
}

function tintHulls(colliding) {
  [{ hull: hullL }, { hull: hullR }].forEach(({ hull }) => {
    if (!hull) return;
    const mat = hull.material;
    mat.vertexColors = !colliding;
    mat.color        = colliding ? COLOR_COL : new THREE.Color(0xffffff);
    mat.opacity      = colliding ? 0.85 : 0.72;
    mat.needsUpdate  = true;
  });
}

// ======================
// DRAG SHAPES (move mode)
// ======================
//
// Hit detection: raycast against a bounding sphere for each group so you
// must actually click ON a shape to grab it.
//
// Movement: unproject mouse onto a plane that faces the camera and passes
// through the shape's center — this gives natural XY drag regardless of
// orbit angle, not just along the world X axis.
// ======================

let shapeDragging   = null;
let dragPlane       = new THREE.Plane();   // camera-facing plane at shape center
let dragOffset      = new THREE.Vector3(); // offset from shape center to click point
let dragGroupOffset = new THREE.Vector3(); // world position of group at drag start
let raycaster       = new THREE.Raycaster();

// Compute a bounding sphere for a group using its actual world position.
// Only considers the point spheres (SphereGeometry children), not the hull
// mesh, whose baked vertex positions inflate the radius incorrectly.
function groupBoundingSphere(group) {
  const center = group.position.clone(); // world-space center
  let maxR = 0;
  group.children.forEach(child => {
    // Point spheres are direct Mesh children with a position set to the point coord.
    // Hull meshes sit at position (0,0,0) and have huge baked geometry — skip them.
    if (child.isMesh && (child.position.x !== 0 || child.position.y !== 0 || child.position.z !== 0)) {
      maxR = Math.max(maxR, child.position.length() + 0.2); // 0.2 = sphere visual radius
    }
  });
  return { center, radius: Math.max(maxR, 1.5) };
}

// Unproject mouse to a 3D point on a given plane
function mouseOnPlane(clientX, clientY, plane) {
  const ndc = new THREE.Vector2(
    (clientX / window.innerWidth)  *  2 - 1,
    (clientY / window.innerHeight) * -2 + 1
  );
  raycaster.setFromCamera(ndc, camera);
  const hit = new THREE.Vector3();
  raycaster.ray.intersectPlane(plane, hit);
  return hit;
}

renderer.domElement.addEventListener("mousedown", (e) => {
  if (editMode || e.button !== 0) return;

  const ndc = new THREE.Vector2(
    (e.clientX / window.innerWidth)  *  2 - 1,
    (e.clientY / window.innerHeight) * -2 + 1
  );
  raycaster.setFromCamera(ndc, camera);

  // Test both shapes via bounding sphere
  const bsL = groupBoundingSphere(groupL);
  const bsR = groupBoundingSphere(groupR);

  const hitL = raycaster.ray.intersectSphere(new THREE.Sphere(bsL.center, bsL.radius), new THREE.Vector3());
  const hitR = raycaster.ray.intersectSphere(new THREE.Sphere(bsR.center, bsR.radius), new THREE.Vector3());

  if (!hitL && !hitR) return; // clicked empty space

  // Pick closer hit
  let side, center;
  if (hitL && hitR) {
    const dL = hitL.distanceTo(camera.position);
    const dR = hitR.distanceTo(camera.position);
    side   = dL <= dR ? "L" : "R";
    center = dL <= dR ? bsL.center : bsR.center;
  } else if (hitL) {
    side = "L"; center = bsL.center;
  } else {
    side = "R"; center = bsR.center;
  }

  shapeDragging = side;
  const group = side === "L" ? groupL : groupR;

  // Build a plane facing the camera, passing through the shape center
  const camDir = new THREE.Vector3();
  camera.getWorldDirection(camDir);
  dragPlane.setFromNormalAndCoplanarPoint(camDir, center);

  // Record full world position of group at drag start
  dragGroupOffset.copy(group.position);

  // Offset from shape center to the actual click point on the plane
  const clickWorld = mouseOnPlane(e.clientX, e.clientY, dragPlane);
  if (clickWorld) dragOffset.copy(clickWorld).sub(center);

  renderer.domElement.style.cursor = "grabbing";
  e.preventDefault();
});

window.addEventListener("mousemove", (e) => {
  if (!shapeDragging) {
    if (!editMode) {
      // Cursor hint: show grab when hovering over a shape
      const ndc = new THREE.Vector2(
        (e.clientX / window.innerWidth)  *  2 - 1,
        (e.clientY / window.innerHeight) * -2 + 1
      );
      raycaster.setFromCamera(ndc, camera);
      const bsL = groupBoundingSphere(groupL);
      const bsR = groupBoundingSphere(groupR);
      const onL = raycaster.ray.intersectSphere(new THREE.Sphere(bsL.center, bsL.radius), new THREE.Vector3());
      const onR = raycaster.ray.intersectSphere(new THREE.Sphere(bsR.center, bsR.radius), new THREE.Vector3());
      renderer.domElement.style.cursor = (onL || onR) ? "grab" : "default";
    }
    return;
  }

  const worldPoint = mouseOnPlane(e.clientX, e.clientY, dragPlane);
  if (!worldPoint) return;

  // New group center = mouse world pos minus the original click offset
  const newCenter = worldPoint.clone().sub(dragOffset);

  // Clamp movement to the drag plane by removing any component along the
  // camera-forward axis (prevents depth drift when the plane isn't perfectly
  // perpendicular to the ray, e.g. at grazing angles)
  const camDir = new THREE.Vector3();
  camera.getWorldDirection(camDir);
  const depthComponent = camDir.clone().multiplyScalar(newCenter.dot(camDir));
  const groupStartDepth = camDir.clone().multiplyScalar(dragGroupOffset.dot(camDir));
  newCenter.sub(depthComponent).add(groupStartDepth);

  if (shapeDragging === "L") {
    offsetL = newCenter.x;
    groupL.position.copy(newCenter);
  } else {
    offsetR = newCenter.x;
    groupR.position.copy(newCenter);
  }

  scheduleGjk();
});

window.addEventListener("mouseup", (e) => {
  if (e.button === 0) {
    shapeDragging = null;
    renderer.domElement.style.cursor = "default";
  }
});

// ======================
// ORBIT (right-drag always; left-drag in edit mode)
// ======================

let theta    = 0;
let phi      = 0.2;
let radius   = 14;
let orbiting = false;
let lastMouse = { x: 0, y: 0 };

window.addEventListener("contextmenu", e => e.preventDefault());

renderer.domElement.addEventListener("mousedown", (e) => {
  if (e.button === 2 || (e.button === 0 && editMode)) {
    orbiting = true;
    lastMouse.x = e.clientX;
    lastMouse.y = e.clientY;
  }
});

window.addEventListener("mouseup",   () => { orbiting = false; });
window.addEventListener("mousemove", (e) => {
  if (!orbiting || shapeDragging) return;
  theta -= (e.clientX - lastMouse.x) * 0.005;
  phi   -= (e.clientY - lastMouse.y) * 0.005;
  phi    = Math.max(-1.4, Math.min(1.4, phi));
  lastMouse.x = e.clientX;
  lastMouse.y = e.clientY;
});

window.addEventListener("wheel", (e) => {
  radius = Math.max(2, Math.min(50, radius + e.deltaY * 0.01));
});

// ======================
// RENDER LOOP
// ======================

function animate() {
  requestAnimationFrame(animate);

  camera.position.set(
    radius * Math.cos(phi) * Math.sin(theta),
    radius * Math.sin(phi),
    radius * Math.cos(phi) * Math.cos(theta)
  );
  camera.lookAt(0, 0, 0);

  renderer.render(scene, camera);
}

animate();
