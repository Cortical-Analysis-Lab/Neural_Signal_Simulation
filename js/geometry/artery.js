// =====================================================
// ARTERY GEOMETRY (STATIC, LEFT-SIDE, TUBULAR)
// =====================================================
console.log("🩸 artery geometry loaded");

let arteryPath = [];

// -----------------------------------------------------
// Vasomotion parameters (biologically realistic)
// -----------------------------------------------------
const BASE_LUMEN_RADIUS = 20;
const BASE_WALL_OFFSET  = 32;

// Slow oscillation (~0.15 Hz)
const VASOMOTION_FREQ = 0.0009;     // radians per ms
const VASOMOTION_AMP  = 0.06;       // ±6% radius change

// -----------------------------------------------------
// Build artery centerline (screen space)
// -----------------------------------------------------
function initArtery() {
  arteryPath = [];

  const marginLeft = 260;
  const topY = -300;
  const bottomY = height + 300;

  const ctrl1 = {
    x: marginLeft - 60,
    y: height * 0.25
  };

  const ctrl2 = {
    x: marginLeft - 120,
    y: height * 0.6
  };

  const steps = 80;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;

    const x = bezierPoint(
      marginLeft,
      ctrl1.x,
      ctrl2.x,
      marginLeft - 40,
      t
    );

    const y = lerp(topY, bottomY, t);
    arteryPath.push({ x, y });
  }

  // Initialize blood AFTER geometry exists
  if (typeof initBloodContents === "function") {
    initBloodContents();
  }
}

// =====================================================
// Current vasomotion scale factor
// =====================================================
function getVasomotionScale() {
  return 1.0 + VASOMOTION_AMP * sin(state.time * VASOMOTION_FREQ);
}

// =====================================================
// MAP NORMALIZED BLOOD POSITION → SCREEN SPACE
// =====================================================
function getArteryPoint(t, lane = 0) {
  if (!arteryPath.length) return null;

  t = constrain(t, 0, 1);

  const idx = floor(t * (arteryPath.length - 1));
  const p0 = arteryPath[idx];
  const p1 = arteryPath[min(idx + 1, arteryPath.length - 1)];

  // Tangent
  const dx = p1.x - p0.x;
  const dy = p1.y - p0.y;
  const len = sqrt(dx * dx + dy * dy) || 1;

  // Normal
  const nx = -dy / len;
  const ny =  dx / len;

  const vasomotion = getVasomotionScale();
  const lumenRadius = BASE_LUMEN_RADIUS * vasomotion;

  return {
    x: p0.x + nx * lane * lumenRadius,
    y: p0.y + ny * lane * lumenRadius
  };
}

// =====================================================
// SOFT LUMEN MASK (RADIAL ALPHA FALLOFF)
// =====================================================
function getLumenAlpha(lane) {
  const r = abs(lane);
  const fadeStart = 0.75;

  if (r <= fadeStart) return 1.0;

  return map(r, fadeStart, 1.0, 1.0, 0.0, true);
}

// =====================================================
// DRAW ARTERY (STATIC, SCREEN SPACE)
// =====================================================
function drawArtery() {
  if (!arteryPath.length) return;

  const vasomotion = getVasomotionScale();

  const LUMEN_WIDTH = BASE_LUMEN_RADIUS * 2 * vasomotion;
  const WALL_OFFSET = BASE_WALL_OFFSET * vasomotion;

  strokeCap(ROUND);
  noFill();

  // ---- LUMEN ----
  stroke(getColor("arteryLumen"));
  strokeWeight(LUMEN_WIDTH);
  beginShape();
  arteryPath.forEach(p => vertex(p.x, p.y));
  endShape();

  // ---- BLOOD CONTENTS ----
  if (typeof drawBloodContents === "function") {
    drawBloodContents();
  }

  // ---- LEFT WALL ----
  stroke(getColor("arteryWall"));
  strokeWeight(8);
  beginShape();
  arteryPath.forEach(p => vertex(p.x - WALL_OFFSET, p.y));
  endShape();

  // ---- RIGHT WALL ----
  beginShape();
  arteryPath.forEach(p => vertex(p.x + WALL_OFFSET, p.y));
  endShape();

  // ---- SPECULAR HIGHLIGHT ----
  stroke(getColor("arteryHighlight", 160));
  strokeWeight(3);
  beginShape();
  arteryPath.forEach(p =>
    vertex(p.x - WALL_OFFSET + 4, p.y - 4)
  );
  endShape();
}
