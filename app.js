// =====================
// BACKEND CALL
// =====================

async function updateHull() {
  let res = await fetch("http://127.0.0.1:5000/hull", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ object1: pointsL, object2: pointsR })
  });

  let data = await res.json();

  draw(sceneL, data.hull1, "L");
  draw(sceneR, data.hull2, "R");
}

// =====================
// DRAW HULL
// =====================

function draw(scene, data, sideId) {
  if (!data) return;

  if (sideId === "L" && hullL) scene.remove(hullL);
  if (sideId === "R" && hullR) scene.remove(hullR);

  let verts = [];

  data.simplices.forEach(f => {
    f.forEach(i => verts.push(...data.vertices[i]));
  });

  let geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(verts, 3));

  let mesh = new THREE.Mesh(
    geo,
    new THREE.MeshBasicMaterial({
      color: "green",
      transparent: true,
      opacity: 0.5,
      side: THREE.DoubleSide
    })
  );

  scene.add(mesh);

  if (sideId === "L") hullL = mesh;
  else hullR = mesh;
}

// =====================
// RENDER LOOP
// =====================

function animate() {
  requestAnimationFrame(animate);

  let w = window.innerWidth;
  let h = window.innerHeight;

  renderer.setScissorTest(true);

  renderer.setViewport(0, 0, w/2, h);
  renderer.setScissor(0, 0, w/2, h);
  renderer.render(sceneL, cameraL);

  renderer.setViewport(w/2, 0, w/2, h);
  renderer.setScissor(w/2, 0, w/2, h);
  renderer.render(sceneR, cameraR);

  renderer.setScissorTest(false);
}

animate();