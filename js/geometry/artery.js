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
// ASTROCYTES (TWO ARMS, ENDFEET ALWAYS SPAN PERICYTE GAPS)
// =========================
for (let i = 10; i < arteryPath.length - 14; i += 22) {

  if (
    !arteryPath[i] ||
    !arteryPath[i - 11] ||
    !arteryPath[i + 11]
  ) continue;

  const pCenter = arteryPath[i];
  const pUp     = arteryPath[i - 11];
  const pDown   = arteryPath[i + 11];

  const wob = WALL_WOBBLE_AMP * sin(t * 0.002 + pCenter.phase);

  for (let side of [-1, 1]) {

    // -------------------------------------------------
    // Soma (unchanged)
    // -------------------------------------------------
    const somaX = pCenter.x + side * (wallOffset + 65);
    const somaY = pCenter.y + 18 * sin(pCenter.phase);

    push();
    noStroke();
    fill(getColor("astrocyte"));
    ellipse(somaX, somaY, 28, 28);
    pop();

    // =================================================
    // UPSTREAM ARM + ENDFOOT
    // =================================================
    const upMidX = (pUp.x + pCenter.x) / 2;
    const upMidY = (pUp.y + pCenter.y) / 2;

    const upGap =
      dist(pUp.x, pUp.y, pCenter.x, pCenter.y) * 0.9;

    // arm
    push();
    stroke(getColor("astrocyte"));
    strokeWeight(4);
    line(
      somaX,
      somaY,
      upMidX + side * (wallOffset + 14),
      upMidY
    );
    pop();

    // endfoot
    push();
    noStroke();
    fill(getColor("astrocyte"));
    translate(
      upMidX + side * (wallOffset + 14 + wob),
      upMidY
    );
    rotate(atan2(pCenter.y - pUp.y, pCenter.x - pUp.x));
    ellipse(0, 0, upGap, 10);
    pop();

    // =================================================
    // DOWNSTREAM ARM + ENDFOOT
    // =================================================
    const downMidX = (pCenter.x + pDown.x) / 2;
    const downMidY = (pCenter.y + pDown.y) / 2;

    const downGap =
      dist(pCenter.x, pCenter.y, pDown.x, pDown.y) * 0.9;

    // arm
    push();
    stroke(getColor("astrocyte"));
    strokeWeight(4);
    line(
      somaX,
      somaY,
      downMidX + side * (wallOffset + 14),
      downMidY
    );
    pop();

    // endfoot
    push();
    noStroke();
    fill(getColor("astrocyte"));
    translate(
      downMidX + side * (wallOffset + 14 + wob),
      downMidY
    );
    rotate(atan2(pDown.y - pCenter.y, pDown.x - pCenter.x));
    ellipse(0, 0, downGap, 10);
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
