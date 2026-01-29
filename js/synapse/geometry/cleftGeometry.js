console.log("🟥 cleftGeometry loaded — CLEFT DOMAIN AUTHORITY");

// =====================================================
// SYNAPTIC CLEFT GEOMETRY — SINGLE CONSTRAINT SOURCE
// =====================================================
//
// ✔ Defines NT confinement volume
// ✔ FILLED rounded rectangle (capsule-like)
// ✔ World-space (synapse-local coordinates)
// ✔ NO forces
// ✔ NO motion
//
// 🔒 Geometry-only authority
//
// =====================================================


// -----------------------------------------------------
// 🎛️ CLEFT POSITION & SIZE TUNING (ONLY EDIT THESE)
// -----------------------------------------------------

// Horizontal size (controls cleft width)
const CLEFT_HALF_WIDTH = 115;   // ⬅️ increase = wider cleft

// Vertical placement
const CLEFT_Y_CENTER   = 55;    // ⬅️ increase = move cleft DOWN
const CLEFT_HEIGHT     = 250;   // ⬅️ increase = taller cleft

// Corner rounding
const CLEFT_RADIUS     = 28;    // ⬅️ smoothness of capsule corners


// -----------------------------------------------------
// DERIVED BOUNDS (DO NOT TUNE BELOW)
// -----------------------------------------------------
const CLEFT_LEFT   = -CLEFT_HALF_WIDTH;
const CLEFT_RIGHT  = +CLEFT_HALF_WIDTH;

const CLEFT_TOP    = CLEFT_Y_CENTER - CLEFT_HEIGHT / 2;
const CLEFT_BOTTOM = CLEFT_Y_CENTER + CLEFT_HEIGHT / 2;


// -----------------------------------------------------
// 🔑 FILLED POINT-IN-CLEFT TEST (AUTHORITATIVE)
// -----------------------------------------------------
//
// A point is inside if it lies within:
//   1) Central rectangle
//   2) Vertical side rectangles
//   3) One of four quarter-circles
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
// Returns closest legal boundary point.
//
window.projectToSynapticCleft = function (x, y) {

  // Clamp into core rectangle
  let px = Math.min(
    Math.max(x, CLEFT_LEFT + CLEFT_RADIUS),
    CLEFT_RIGHT - CLEFT_RADIUS
  );

  let py = Math.min(
    Math.max(y, CLEFT_TOP + CLEFT_RADIUS),
    CLEFT_BOTTOM - CLEFT_RADIUS
  );

  // Determine nearest corner center
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
// This red outline is the *exact volume*
// NTs are allowed to occupy.
//
window.drawSynapticCleftDebug = function () {

  if (!window.SHOW_SYNAPSE_DEBUG) return;

  push();
  stroke(255, 60, 60, 220);   // 🔴 PHYSICS TRUTH
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
