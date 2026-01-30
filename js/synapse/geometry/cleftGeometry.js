console.log("🟥 cleftGeometry loaded — CLEFT DOMAIN AUTHORITY");

// =====================================================
// SYNAPTIC CLEFT GEOMETRY — SINGLE CONSTRAINT SOURCE
// =====================================================
//
// ✔ Defines NT confinement volume
// ✔ Filled rounded-rectangle (capsule-like)
// ✔ Synapse-local world coordinates
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
const CLEFT_HALF_WIDTH = 125;   // ⬅ wider = increase

// Vertical placement
const CLEFT_Y_CENTER   = 55;    // ⬅ down = increase
const CLEFT_HEIGHT     = 255;   // ⬅ taller = increase

// Corner rounding
const CLEFT_RADIUS     = 28;    // ⬅ smoothness


// -----------------------------------------------------
// DERIVED BOUNDS (DO NOT EDIT BELOW)
// -----------------------------------------------------
const CLEFT_LEFT   = -CLEFT_HALF_WIDTH;
const CLEFT_RIGHT  = +CLEFT_HALF_WIDTH;

const CLEFT_TOP    = CLEFT_Y_CENTER - CLEFT_HEIGHT / 2;
const CLEFT_BOTTOM = CLEFT_Y_CENTER + CLEFT_HEIGHT / 2;


// -----------------------------------------------------
// 🔑 FILLED POINT-IN-CLEFT TEST (PHYSICS TRUTH)
// -----------------------------------------------------
window.isInsideSynapticCleft = function (x, y) {

  // Central rectangle
  if (
    x >= CLEFT_LEFT + CLEFT_RADIUS &&
    x <= CLEFT_RIGHT - CLEFT_RADIUS &&
    y >= CLEFT_TOP &&
    y <= CLEFT_BOTTOM
  ) return true;

  // Vertical side rectangles
  if (
    x >= CLEFT_LEFT &&
    x <= CLEFT_RIGHT &&
    y >= CLEFT_TOP + CLEFT_RADIUS &&
    y <= CLEFT_BOTTOM - CLEFT_RADIUS
  ) return true;

  // Corner quarter-circles
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
window.projectToSynapticCleft = function (x, y) {

  // Clamp into inner rectangle
  let px = Math.min(
    Math.max(x, CLEFT_LEFT + CLEFT_RADIUS),
    CLEFT_RIGHT - CLEFT_RADIUS
  );

  let py = Math.min(
    Math.max(y, CLEFT_TOP + CLEFT_RADIUS),
    CLEFT_BOTTOM - CLEFT_RADIUS
  );

  // Nearest corner center
  const cx = x < px ? CLEFT_LEFT + CLEFT_RADIUS :
             x > px ? CLEFT_RIGHT - CLEFT_RADIUS : px;

  const cy = y < py ? CLEFT_TOP + CLEFT_RADIUS :
             y > py ? CLEFT_BOTTOM - CLEFT_RADIUS : py;

  const dx = x - cx;
  const dy = y - cy;

  const d2 = dx * dx + dy * dy;

  if (d2 === 0) return { x: px, y: py };

  const d = Math.sqrt(d2);
  const k = CLEFT_RADIUS / d;

  return {
    x: cx + dx * k,
    y: cy + dy * k
  };
};


// -----------------------------------------------------
// 🔴 DEBUG DRAW — EXACT PHYSICS GEOMETRY
// -----------------------------------------------------
//
// This outline is generated from the SAME math
// used by isInsideSynapticCleft().
//
window.drawSynapticCleftDebug = function () {

  if (!window.SHOW_SYNAPSE_DEBUG) return;

  push();
  stroke(255, 60, 60, 220);
  strokeWeight(2);
  noFill();

  // Central rectangle
  rect(
    CLEFT_LEFT + CLEFT_RADIUS,
    CLEFT_TOP,
    (CLEFT_RIGHT - CLEFT_LEFT) - 2 * CLEFT_RADIUS,
    CLEFT_BOTTOM - CLEFT_TOP
  );

  // Vertical rectangle
  rect(
    CLEFT_LEFT,
    CLEFT_TOP + CLEFT_RADIUS,
    CLEFT_RIGHT - CLEFT_LEFT,
    (CLEFT_BOTTOM - CLEFT_TOP) - 2 * CLEFT_RADIUS
  );

  // Corner arcs
  const r = CLEFT_RADIUS * 2;

  arc(CLEFT_LEFT  + CLEFT_RADIUS, CLEFT_TOP    + CLEFT_RADIUS, r, r, PI, PI + HALF_PI);
  arc(CLEFT_RIGHT - CLEFT_RADIUS, CLEFT_TOP    + CLEFT_RADIUS, r, r, PI + HALF_PI, TWO_PI);
  arc(CLEFT_RIGHT - CLEFT_RADIUS, CLEFT_BOTTOM - CLEFT_RADIUS, r, r, 0, HALF_PI);
  arc(CLEFT_LEFT  + CLEFT_RADIUS, CLEFT_BOTTOM - CLEFT_RADIUS, r, r, HALF_PI, PI);

  pop();
};
