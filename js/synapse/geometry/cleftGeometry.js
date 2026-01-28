console.log("🟥 cleftGeometry loaded — CLEFT DOMAIN AUTHORITY");

// =====================================================
// SYNAPTIC CLEFT GEOMETRY — SINGLE CONSTRAINT SOURCE
// =====================================================
//
// ✔ Defines NT confinement volume
// ✔ FILLED rounded rectangle (capsule-like)
// ✔ World-space
// ✔ NO forces
// ✔ NO motion
//
// 🔒 Geometry-only authority
//
// =====================================================


// -----------------------------------------------------
// CLEFT BOUNDS (WORLD SPACE)
// -----------------------------------------------------
const CLEFT_LEFT   = -95;   // presynaptic membrane
const CLEFT_RIGHT  = +95;   // postsynaptic membrane
const CLEFT_TOP    = -135;  // astrocyte endfoot
const CLEFT_BOTTOM = +80;   // optional floor

const CLEFT_RADIUS = 22;


// -----------------------------------------------------
// 🔑 FILLED POINT-IN-CLEFT TEST (AUTHORITATIVE)
// -----------------------------------------------------
//
// Definition:
// A point is inside the cleft if it lies inside:
//   1) The central rectangle
//   2) The left/right side rectangles
//   3) Any of the four corner quarter-circles
//
window.isInsideSynapticCleft = function (x, y) {

  // --- Central rectangle ---
  if (
    x >= CLEFT_LEFT + CLEFT_RADIUS &&
    x <= CLEFT_RIGHT - CLEFT_RADIUS &&
    y >= CLEFT_TOP &&
    y <= CLEFT_BOTTOM
  ) return true;

  // --- Vertical side rectangles ---
  if (
    x >= CLEFT_LEFT &&
    x <= CLEFT_RIGHT &&
    y >= CLEFT_TOP + CLEFT_RADIUS &&
    y <= CLEFT_BOTTOM - CLEFT_RADIUS
  ) return true;

  // --- Corner circles ---
  const corners = [
    { cx: CLEFT_LEFT  + CLEFT_RADIUS, cy: CLEFT_TOP    + CLEFT_RADIUS },
    { cx: CLEFT_RIGHT - CLEFT_RADIUS, cy: CLEFT_TOP    + CLEFT_RADIUS },
    { cx: CLEFT_LEFT  + CLEFT_RADIUS, cy: CLEFT_BOTTOM - CLEFT_RADIUS },
    { cx: CLEFT_RIGHT - CLEFT_RADIUS, cy: CLEFT_BOTTOM - CLEFT_RADIUS }
  ];

  for (const c of corners) {
    const dx = x - c.cx;
    const dy = y - c.cy;
    if (dx * dx + dy * dy <= CLEFT_RADIUS * CLEFT_RADIUS) {
      return true;
    }
  }

  return false;
};


// -----------------------------------------------------
// 🔑 PROJECT POINT TO CLEFT (MINIMAL CORRECTION)
// -----------------------------------------------------
//
// Used ONLY when NT attempts to leave cleft.
// Returns closest legal point on boundary.
//
window.projectToSynapticCleft = function (x, y) {

  // Clamp to rectangle core
  let px = Math.min(
    Math.max(x, CLEFT_LEFT + CLEFT_RADIUS),
    CLEFT_RIGHT - CLEFT_RADIUS
  );

  let py = Math.min(
    Math.max(y, CLEFT_TOP + CLEFT_RADIUS),
    CLEFT_BOTTOM - CLEFT_RADIUS
  );

  // Identify nearest corner
  const cx = x < px ? CLEFT_LEFT + CLEFT_RADIUS :
             x > px ? CLEFT_RIGHT - CLEFT_RADIUS : px;

  const cy = y < py ? CLEFT_TOP + CLEFT_RADIUS :
             y > py ? CLEFT_BOTTOM - CLEFT_RADIUS : py;

  const dx = x - cx;
  const dy = y - cy;

  const d2 = dx * dx + dy * dy;

  if (d2 === 0) {
    return { x: px, y: py };
  }

  const d = Math.sqrt(d2);
  const k = CLEFT_RADIUS / d;

  return {
    x: cx + dx * k,
    y: cy + dy * k
  };
};


// -----------------------------------------------------
// 🔴 DEBUG DRAW — CLEFT CONSTRAINT (PHYSICS TRUTH)
// -----------------------------------------------------
//
// This RED outline is the *actual volume* NTs are
// allowed to occupy.
//
// If NTs stick to this line → constraint bug
// If NTs move freely inside → correct
//
window.drawSynapticCleftDebug = function () {

  if (!window.SHOW_SYNAPSE_DEBUG) return;

  push();
  stroke(255, 60, 60, 220);   // 🔴 RED = PHYSICS TRUTH
  strokeWeight(2);
  noFill();

  rect(
    CLEFT_LEFT,
    CLEFT_TOP,
    CLEFT_RIGHT - CLEFT_LEFT,
    CLEFT_BOTTOM - CLEFT_TOP,
    CLEFT_RADIUS
  );

  pop();
};
