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
const VASOMOTION_AMP  = 0.06;
const WALL_WOBBLE_AMP = 2.5;

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
      x: bezierPoint(marginLeft, ctrl1.x, ctrl2.x, marginLeft - 40, t),
      y: lerp(topY, bottomY, t),
      phase: t * TWO_PI
    });
  }

  if (typeof initBloodContents === "function") {
    initBloodContents();
  }
}

// -----------------------------------------------------
// Vasomotion scale
// -----------------------------------------------------
function getVasomotionScale() {
  return 1.0 + VASOMOTION_AMP * sin(state.time * VASOMOTION_FREQ);
}

// -----------------------------------------------------
// Lumen mapping
// -----------------------------------------------------
function getArteryPoint(t, lane = 0) {
  if (!arteryPath.length) return null;

  t = constrain(t, 0, 1);
  const i = floor(t * (arteryPath.length - 1));
  const p0 = arteryPath[i];
  const p1 = arteryPath[min(i + 1, arteryPath.length - 1)];

  const dx = p1.x - p0.x;
  const dy = p1.y - p0.y;
  const len = sqrt(dx * dx + dy * dy) || 1;

  const nx = -dy / len;
  const ny =  dx / len;

  return {
    x: p0.x + nx * lane * PARTICLE_LUMEN_RADIUS,
    y: p0.y + ny * lane * PARTICLE_LUMEN_RADIUS
  };
}

// =====================================================
// DRAW ARTERY + BBB + NVU
// =====================================================
function drawArtery() {
  if (!arteryPath.length) return;

  const t = state.time;
  const wallOffset = BASE_WALL_OFFSET * getVasomotionScale();

  strokeCap(ROUND);
  noFill();

  // -------------------------
  // BLOOD
  // -------------------------
  if (typeof drawBloodContents === "function") {
    drawBloodContents();
  }

  // -------------------------
  // ENDOTHELIUM (CONTINUOUS)
  // -------------------------
  stroke(getColor("endothelium", 220));
  strokeWeight(5);

  for (let i = 0; i < arteryPath.length - 1; i += 3) {
    const p0 = arteryPath[i];
    const p1 = arteryPath[i + 1];
    const wobL = WALL_WOBBLE_AMP * sin(t * 0.002 + p0.phase);
    const wobR = WALL_WOBBLE_AMP * sin(t * 0.002 + p0.phase + PI);

    line(p0.x - wallOffset + 6 - wobL, p0.y, p1.x - wallOffset + 6 - wobL, p1.y);
    line(p0.x + wallOffset - 6 + wobR, p0.y, p1.x + wallOffset - 6 + wobR, p1.y);
  }

  // -------------------------
  // PERICYTES (DISCRETE)
  // -------------------------
  noStroke();
  fill(getColor("pericyte", 220));

  for (let i = 0; i < arteryPath.length; i += 12) {
    const p = arteryPath[i];
    const wob = WALL_WOBBLE_AMP * sin(t * 0.002 + p.phase);

    ellipse(p.x - wallOffset - wob, p.y, 10, 6);
    ellipse(p.x + wallOffset + wob, p.y, 10, 6);
  }

  // -------------------------
  // ARTERY WALL
  // -------------------------
  stroke(getColor("arteryWall"));
  strokeWeight(8);

  beginShape();
  arteryPath.forEach(p => {
    vertex(p.x - wallOffset - WALL_WOBBLE_AMP * sin(t * 0.002 + p.phase), p.y);
  });
  endShape();

  beginShape();
  arteryPath.forEach(p => {
    vertex(p.x + wallOffset + WALL_WOBBLE_AMP * sin(t * 0.002 + p.phase + PI), p.y);
  });
  endShape();

  // -------------------------
  // ASTROCYTES (FULL CELLS)
  // -------------------------
  for (let i = 6; i < arteryPath.length; i += 14) {
    const p = arteryPath[i];

    const somaX = p.x - wallOffset - 55;
    const somaY = p.y + 20 * sin(p.phase);

    // soma
    noStroke();
    fill(getColor("astrocyte", 200));
    ellipse(somaX, somaY, 18, 18);

    // processes
    stroke(getColor("astrocyte", 160));
    strokeWeight(2);

    for (let k = 0; k < 4; k++) {
      const a = p.phase + k * PI / 2;
      line(
        somaX,
        somaY,
        p.x - wallOffset - 14,
        p.y + 6 * sin(a)
      );
    }

    // endfoot pad
    noStroke();
    ellipse(p.x - wallOffset - 12, p.y, 12, 4);
  }

  // -------------------------
  // INNER HIGHLIGHT
  // -------------------------
  stroke(getColor("arteryHighlight", 120));
  strokeWeight(2);

  beginShape();
  arteryPath.forEach(p => {
    vertex(p.x - wallOffset + 3 - WALL_WOBBLE_AMP * 0.6 * sin(t * 0.002 + p.phase), p.y - 3);
  });
  endShape();
}
