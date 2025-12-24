// =====================================================
// ARTERY GEOMETRY + NEUROVASCULAR UNIT (NVU)
// =====================================================
console.log("🩸 artery geometry loaded");

let arteryPath = [];

// -----------------------------------------------------
// Geometry constants
// -----------------------------------------------------
const BASE_LUMEN_RADIUS      = 20;
const PARTICLE_LUMEN_RADIUS = 20;
const BASE_WALL_OFFSET      = 32 * (4 / 3);

// -----------------------------------------------------
// Visual vasomotion (WALLS ONLY)
// -----------------------------------------------------
const VASOMOTION_FREQ = 0.0009;
const VASOMOTION_AMP  = 0.03;
const WALL_WOBBLE_AMP = 1.5;

// -----------------------------------------------------
// Build artery centerline
// -----------------------------------------------------
function initArtery() {
  arteryPath = [];

  const marginLeft = 260;
  const topY = -300;
  const bottomY = height + 300;

  const ctrl1 = { x: marginLeft - 60,  y: height * 0.25 };
  const ctrl2 = { x: marginLeft - 120, y: height * 0.6 };

  const steps = 80;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;

    arteryPath.push({
      x: bezierPoint(
        marginLeft,
        ctrl1.x,
        ctrl2.x,
        marginLeft - 40,
        t
      ),
      y: lerp(topY, bottomY, t),
      phase: t * TWO_PI
    });
  }

  if (typeof initBloodContents === "function") {
    initBloodContents();
  }
}

// -----------------------------------------------------
// Vasomotion scale (walls only)
// -----------------------------------------------------
function getVasomotionScale() {
  return 1.0 + VASOMOTION_AMP * sin(state.time * VASOMOTION_FREQ);
}

// -----------------------------------------------------
// Vessel local frame
// -----------------------------------------------------
function getVesselFrame(i) {
  const p0 = arteryPath[i];
  const p1 = arteryPath[min(i + 1, arteryPath.length - 1)];

  const dx = p1.x - p0.x;
  const dy = p1.y - p0.y;
  const len = sqrt(dx * dx + dy * dy) || 1;

  return {
    x: p0.x,
    y: p0.y,
    tx: dx / len,
    ty: dy / len,
    nx: -dy / len,
    ny:  dx / len,
    phase: p0.phase
  };
}

// -----------------------------------------------------
// Lumen mapping (particles only)
// -----------------------------------------------------
function getArteryPoint(t, lane = 0) {
  if (!arteryPath.length) return null;

  t = constrain(t, 0, 1);
  const i = floor(t * (arteryPath.length - 1));
  const f = getVesselFrame(i);

  return {
    x: f.x + f.nx * lane * PARTICLE_LUMEN_RADIUS,
    y: f.y + f.ny * lane * PARTICLE_LUMEN_RADIUS
  };
}

// =====================================================
// DRAW ARTERY + NVU
// =====================================================
function drawArtery() {
  if (!arteryPath.length) return;

  const t = state.time;
  const wallOffset = BASE_WALL_OFFSET * getVasomotionScale();

  strokeCap(ROUND);

  // =========================
  // BLOOD
  // =========================
  if (typeof drawBloodContents === "function") {
    drawBloodContents();
  }

  // =========================
  // ENDOTHELIUM (UNCHANGED)
  // =========================
  push();
  stroke(getColor("endothelium"));
  strokeWeight(6);
  noFill();

  for (let i = 0; i < arteryPath.length - 4; i += 4) {
    const f = getVesselFrame(i);
    const wob = WALL_WOBBLE_AMP * sin(t * 0.002 + f.phase);

    const ox = f.nx * (wallOffset - 6 + wob);
    const oy = f.ny * (wallOffset - 6 + wob);

    line(
      f.x + ox,
      f.y + oy,
      f.x + ox + f.tx * 55,
      f.y + oy + f.ty * 55
    );

    line(
      f.x - ox,
      f.y - oy,
      f.x - ox + f.tx * 55,
      f.y - oy + f.ty * 55
    );
    // ---- GLUT1 transporters (endothelium) ----
    push();
    noStroke();
    fill(getColor("glucose"));
    
    translate(
      f.x + ox + f.tx * 28,
      f.y + oy + f.ty * 28
    );
    rotate(atan2(f.ty, f.tx));
    rectMode(CENTER);
    rect(0, 0, 8, 4); // GLUT1 block
    pop();
    
    push();
    noStroke();
    fill(getColor("glucose"));
    
    translate(
      f.x - ox + f.tx * 28,
      f.y - oy + f.ty * 28
    );
    rotate(atan2(f.ty, f.tx));
    rectMode(CENTER);
    rect(0, 0, 8, 4);
    pop();

  }
  pop();

  // =========================
  // ARTERY WALL
  // =========================
  push();
  stroke(getColor("arteryWall"));
  strokeWeight(8);
  noFill();

  beginShape();
  arteryPath.forEach(p => {
    vertex(
      p.x - wallOffset -
        WALL_WOBBLE_AMP * sin(t * 0.002 + p.phase),
      p.y
    );
  });
  endShape();

  beginShape();
  arteryPath.forEach(p => {
    vertex(
      p.x + wallOffset +
        WALL_WOBBLE_AMP * sin(t * 0.002 + p.phase + PI),
      p.y
    );
  });
  endShape();
  pop();

  // =========================
  // PERICYTES (UNCHANGED)
  // =========================
  push();
  noStroke();
  fill(getColor("pericyte"));

  for (let i = 4; i < arteryPath.length; i += 8) {
    const f = getVesselFrame(i);
    const wob = WALL_WOBBLE_AMP * sin(t * 0.002 + f.phase);

    const ox = f.nx * (wallOffset + 6 + wob);
    const oy = f.ny * (wallOffset + 6 + wob);

    push();
    translate(f.x + ox, f.y + oy);
    rotate(atan2(f.ty, f.tx));
    ellipse(0, 0, 90, 18);
    pop();

    push();
    translate(f.x - ox, f.y - oy);
    rotate(atan2(f.ty, f.tx));
    ellipse(0, 0, 90, 18);
    pop();
  }
  pop();

// =========================
// ASTROCYTES (PLACEMENT-FIXED, SIZE UNCHANGED)
// =========================
for (let i = 12; i < arteryPath.length - 12; i += 16) {

  // pericytes are at i-8, i, i+8 (matches pericyte stride)
  const pLeft  = arteryPath[i - 8];
  const pMid   = arteryPath[i];
  const pRight = arteryPath[i + 8];

  if (!pLeft || !pMid || !pRight) continue;

  const wob = WALL_WOBBLE_AMP * sin(t * 0.002 + pMid.phase);

  for (let side of [-1, 1]) {

    // -------------------------------------------------
    // Soma (UNCHANGED)
    // -------------------------------------------------
    const somaX = pMid.x + side * (wallOffset + 65);
    const somaY = pMid.y + 18 * sin(pMid.phase);

    push();
    noStroke();
    fill(getColor("astrocyte"));
    ellipse(somaX, somaY, 28, 28);
    pop();

    // -------------------------------------------------
    // ARM → upstream gap (between pLeft and pMid)
    // -------------------------------------------------
    const upX = (pLeft.x + pMid.x) / 2;
    const upY = (pLeft.y + pMid.y) / 2;

    push();
    stroke(getColor("astrocyte"));
    strokeWeight(4);
    line(
      somaX,
      somaY,
      upX + side * (wallOffset + 14),
      upY
    );
    pop();

    push();
    noStroke();
    fill(getColor("astrocyte"));
    translate(
      upX + side * (wallOffset + 14 + wob),
      upY
    );
    rotate(atan2(pMid.y - pLeft.y, pMid.x - pLeft.x));
    ellipse(0, 0, 38, 10); // SAME SIZE AS BEFORE
    // ---- AQP4 channels (astrocyte endfeet) ----
    push();
    noStroke();
    fill(getColor("water"));
    
    for (let k = -1; k <= 1; k++) {
      circle(k * 6, 0, 4); // small clustered channels
    }
    pop();


    // -------------------------------------------------
    // ARM → downstream gap (between pMid and pRight)
    // -------------------------------------------------
    const downX = (pMid.x + pRight.x) / 2;
    const downY = (pMid.y + pRight.y) / 2;

    push();
    stroke(getColor("astrocyte"));
    strokeWeight(4);
    line(
      somaX,
      somaY,
      downX + side * (wallOffset + 14),
      downY
    );
    pop();

    push();
    noStroke();
    fill(getColor("astrocyte"));
    translate(
      downX + side * (wallOffset + 14 + wob),
      downY
    );
    rotate(atan2(pRight.y - pMid.y, pRight.x - pMid.x));
    ellipse(0, 0, 38, 10); // SAME SIZE
    // ---- AQP4 channels (astrocyte endfeet) ----
    push();
    noStroke();
    fill(getColor("water"));
    
    for (let k = -1; k <= 1; k++) {
      circle(k * 6, 0, 4); // small clustered channels
    }
    pop();

  }
}


  // =========================
  // INNER HIGHLIGHT
  // =========================
  push();
  stroke(getColor("arteryHighlight", 120));
  strokeWeight(2);
  noFill();

  beginShape();
  arteryPath.forEach(p => {
    vertex(
      p.x - wallOffset + 3 -
        WALL_WOBBLE_AMP * 0.6 * sin(t * 0.002 + p.phase),
      p.y - 3
    );
  });
  endShape();
  pop();
}
