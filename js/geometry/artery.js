// =====================================================
// ARTERY GEOMETRY (STATIC, LEFT-SIDE, TUBULAR)
// =====================================================
console.log("🩸 artery geometry loaded");

let arteryPath = [];

// -----------------------------------------------------
// Vasomotion parameters
// -----------------------------------------------------
const BASE_LUMEN_RADIUS = 20;
const BASE_WALL_OFFSET  = 32;

const VASOMOTION_FREQ = 0.0009; // slow (~0.15 Hz)
const VASOMOTION_AMP  = 0.06;

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
      x: bezierPoint(marginLeft, ctrl1.x, ctrl2.x, marginLeft - 40, t),
      y: lerp(topY, bottomY, t)
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
// Map blood particle → screen
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

  const lumenRadius = BASE_LUMEN_RADIUS * getVasomotionScale();

  return {
    x: p0.x + nx * lane * lumenRadius,
    y: p0.y + ny * lane * lumenRadius
  };
}

// -----------------------------------------------------
// Soft lumen alpha mask (for particles only)
// -----------------------------------------------------
function getLumenAlpha(lane) {
  const r = abs(lane);
  if (r < 0.75) return 1;
  return map(r, 0.75, 1.0, 1.0, 0.0, true);
}

// =====================================================
// DRAW ARTERY (NO FILLED LUMEN)
// =====================================================
function drawArtery() {
  if (!arteryPath.length) return;

  const vasomotion = getVasomotionScale();
  const wallOffset = BASE_WALL_OFFSET * vasomotion;

  strokeCap(ROUND);
  noFill();

  // =========================
  // BLOOD CONTENTS FIRST
  // =========================
  if (typeof drawBloodContents === "function") {
    drawBloodContents();
  }

  // =========================
  // VESSEL WALLS
  // =========================
  stroke(getColor("arteryWall"));
  strokeWeight(8);

  // Left wall
  beginShape();
  arteryPath.forEach(p => vertex(p.x - wallOffset, p.y));
  endShape();

  // Right wall
  beginShape();
  arteryPath.forEach(p => vertex(p.x + wallOffset, p.y));
  endShape();

  // =========================
  // SUBTLE INNER HIGHLIGHT
  // =========================
  stroke(getColor("arteryHighlight", 120));
  strokeWeight(2);
  beginShape();
  arteryPath.forEach(p =>
    vertex(p.x - wallOffset + 3, p.y - 3)
  );
  endShape();
}
