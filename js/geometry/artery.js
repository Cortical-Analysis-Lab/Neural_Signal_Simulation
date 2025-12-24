// =====================================================
// ARTERY GEOMETRY (STATIC CENTERLINE + DYNAMIC WALLS)
// =====================================================
console.log("🩸 artery geometry loaded");

let arteryPath = [];

// -----------------------------------------------------
// Geometry constants
// -----------------------------------------------------
const BASE_LUMEN_RADIUS      = 20;   // 🔑 FIXED lumen for particles
const PARTICLE_LUMEN_RADIUS = 20;   // 🔑 particles NEVER vasomote

const BASE_WALL_OFFSET  = 32;

// -----------------------------------------------------
// Visual vasomotion (walls only)
// -----------------------------------------------------
const VASOMOTION_FREQ = 0.0009;
const VASOMOTION_AMP  = 0.06;
const WALL_WOBBLE_AMP = 2.5;

// -----------------------------------------------------
// Build artery centerline (screen space)
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
// Wall vasomotion scale (walls only)
// -----------------------------------------------------
function getVasomotionScale() {
  return 1.0 + VASOMOTION_AMP * sin(state.time * VASOMOTION_FREQ);
}

// -----------------------------------------------------
// Map blood particle → screen (FIXED lumen)
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

  // 🔑 FIXED radius — NO vasomotion
  return {
    x: p0.x + nx * lane * PARTICLE_LUMEN_RADIUS,
    y: p0.y + ny * lane * PARTICLE_LUMEN_RADIUS
  };
}

// -----------------------------------------------------
// Soft alpha mask (particles only)
// -----------------------------------------------------
function getLumenAlpha(lane) {
  const r = abs(lane);
  if (r < 0.75) return 1;
  return map(r, 0.75, 1.0, 1.0, 0.0, true);
}

// =====================================================
// DRAW ARTERY (WALLS ONLY MOVE)
// =====================================================
function drawArtery() {
  if (!arteryPath.length) return;

  const t = state.time;
  const vasomotion = getVasomotionScale();
  const wallOffset = BASE_WALL_OFFSET * vasomotion;

  strokeCap(ROUND);
  noFill();

  // =========================
  // BLOOD CONTENTS (STATIC LUMEN)
  // =========================
  if (typeof drawBloodContents === "function") {
    drawBloodContents();
  }

  // =========================
  // LEFT WALL
  // =========================
  stroke(getColor("arteryWall"));
  strokeWeight(8);
  beginShape();
  arteryPath.forEach(p => {
    const wobble =
      WALL_WOBBLE_AMP * sin(t * 0.002 + p.phase);

    vertex(p.x - wallOffset - wobble, p.y);
  });
  endShape();

  // =========================
  // RIGHT WALL (out of phase)
  // =========================
  beginShape();
  arteryPath.forEach(p => {
    const wobble =
      WALL_WOBBLE_AMP * sin(t * 0.002 + p.phase + PI);

    vertex(p.x + wallOffset + wobble, p.y);
  });
  endShape();

  // =========================
  // INNER HIGHLIGHT
  // =========================
  stroke(getColor("arteryHighlight", 120));
  strokeWeight(2);
  beginShape();
  arteryPath.forEach(p => {
    const wobble =
      0.6 * WALL_WOBBLE_AMP * sin(t * 0.002 + p.phase);

    vertex(p.x - wallOffset + 3 - wobble, p.y - 3);
  });
  endShape();
}
