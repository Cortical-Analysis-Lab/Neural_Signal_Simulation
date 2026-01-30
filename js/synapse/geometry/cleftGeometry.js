console.log("🟥 cleftGeometry loaded — CLEFT DOMAIN AUTHORITY");

// =====================================================
// SYNAPTIC CLEFT GEOMETRY — SINGLE CONSTRAINT SOURCE
// =====================================================
//
// ✔ Defines NT confinement volume
// ✔ Rounded rectangle (capsule-like)
// ✔ Synapse-local coordinates
// ✔ NO forces
// ✔ NO motion
//
// 🔒 Physics + debug share identical geometry
//
// =====================================================


// -----------------------------------------------------
// 🎛️ CLEFT POSITION & SIZE TUNING (ONLY EDIT THESE)
// -----------------------------------------------------

// Horizontal size
const CLEFT_HALF_WIDTH = 125;

// Vertical placement
const CLEFT_Y_CENTER   = 55;
const CLEFT_HEIGHT     = 255;

// Corner rounding
const CLEFT_RADIUS     = 28;


// -----------------------------------------------------
// DERIVED BOUNDS (DO NOT EDIT BELOW)
// -----------------------------------------------------
const CLEFT_LEFT   = -CLEFT_HALF_WIDTH;
const CLEFT_RIGHT  = +CLEFT_HALF_WIDTH;

const CLEFT_TOP    = CLEFT_Y_CENTER - CLEFT_HEIGHT / 2;
const CLEFT_BOTTOM = CLEFT_Y_CENTER + CLEFT_HEIGHT / 2;


// -----------------------------------------------------
// 🔑 POINT-IN-CLEFT TEST (PHYSICS TRUTH)
// -----------------------------------------------------
window.isInsideSynapticCleft = function (x, y) {

  // Inner rectangle
  if (
    x >= CLEFT_LEFT + CLEFT_RADIUS &&
    x <= CLEFT_RIGHT - CLEFT_RADIUS &&
    y >= CLEFT_TOP &&
    y <= CLEFT_BOTTOM
  ) return true;

  if (
    x >= CLEFT_LEFT &&
    x <= CLEFT_RIGHT &&
    y >= CLEFT_TOP + CLEFT_RADIUS &&
    y <= CLEFT_BOTTOM - CLEFT_RADIUS
  ) return true;

  // Corner arcs
  const corners = [
    [CLEFT_LEFT  + CLEFT_RADIUS, CLEFT_TOP    + CLEFT_RADIUS],
    [CLEFT_RIGHT - CLEFT_RADIUS, CLEFT_TOP    + CLEFT_RADIUS],
    [CLEFT_RIGHT - CLEFT_RADIUS, CLEFT_BOTTOM - CLEFT_RADIUS],
    [CLEFT_LEFT  + CLEFT_RADIUS, CLEFT_BOTTOM - CLEFT_RADIUS]
  ];

  for (const [cx, cy] of corners) {
    const dx = x - cx;
    const dy = y - cy;
    if (dx * dx + dy * dy <= CLEFT_RADIUS * CLEFT_RADIUS) {
      return true;
    }
  }

  return false;
};


// -----------------------------------------------------
// 🔑 PROJECT POINT TO CLEFT
// -----------------------------------------------------
window.projectToSynapticCleft = function (x, y) {

  let px = constrain(
    x,
    CLEFT_LEFT + CLEFT_RADIUS,
    CLEFT_RIGHT - CLEFT_RADIUS
  );

  let py = constrain(
    y,
    CLEFT_TOP + CLEFT_RADIUS,
    CLEFT_BOTTOM - CLEFT_RADIUS
  );

  const cx = x < px ? CLEFT_LEFT + CLEFT_RADIUS :
             x > px ? CLEFT_RIGHT - CLEFT_RADIUS : px;

  const cy = y < py ? CLEFT_TOP + CLEFT_RADIUS :
             y > py ? CLEFT_BOTTOM - CLEFT_RADIUS : py;

  const dx = x - cx;
  const dy = y - cy;

  const d = Math.hypot(dx, dy);
  if (d === 0) return { x: px, y: py };

  return {
    x: cx + (dx / d) * CLEFT_RADIUS,
    y: cy + (dy / d) * CLEFT_RADIUS
  };
};


// -----------------------------------------------------
// 🔴 DEBUG DRAW — EXACT PHYSICS BOUNDARY
// -----------------------------------------------------
window.drawSynapticCleftDebug = function () {

  if (!window.SHOW_SYNAPSE_DEBUG) return;

  push();
  stroke(255, 60, 60, 220);
  strokeWeight(2);
  noFill();

  // SINGLE continuous outline — matches physics exactly
  rect(
    CLEFT_LEFT,
    CLEFT_TOP,
    CLEFT_RIGHT - CLEFT_LEFT,
    CLEFT_BOTTOM - CLEFT_TOP,
    CLEFT_RADIUS
  );

  pop();
};
