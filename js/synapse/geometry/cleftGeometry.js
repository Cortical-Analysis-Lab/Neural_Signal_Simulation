console.log("🟢 cleftGeometry loaded — PHYSICS ENABLED");

// =====================================================
// SYNAPTIC CLEFT GEOMETRY — CONSTRAINT AUTHORITY
// =====================================================
//
// RESPONSIBILITIES:
// ✔ Define synaptic cleft shape
// ✔ Containment detection (isInsideSynapticCleft)
// ✔ Surface projection (projectToSynapticCleft)
// ✔ Debug visualization
//
// HARD RULES:
// • NEVER apply forces
// • NEVER integrate motion
// • NEVER modify NT velocity directly
// • ONLY return geometry/projection data
//
// =====================================================


// -----------------------------------------------------
// 🎛️ CLEFT POSITION & SIZE TUNING (ONLY EDIT THESE)
// -----------------------------------------------------

// Horizontal half-width of cleft
const CLEFT_HALF_WIDTH = 125;

// Vertical placement (positive = down)
const CLEFT_Y_CENTER   = 55;

// Total height
const CLEFT_HEIGHT     = 255;

// Corner rounding radius
const CLEFT_RADIUS     = 28;


// -----------------------------------------------------
// DERIVED BOUNDS (DO NOT EDIT BELOW)
// -----------------------------------------------------
const CLEFT_LEFT   = -CLEFT_HALF_WIDTH;
const CLEFT_RIGHT  = +CLEFT_HALF_WIDTH;
const CLEFT_TOP    = CLEFT_Y_CENTER - CLEFT_HEIGHT / 2;
const CLEFT_BOTTOM = CLEFT_Y_CENTER + CLEFT_HEIGHT / 2;


// -----------------------------------------------------
// 🔍 CONTAINMENT TEST — ROUNDED RECTANGLE
// -----------------------------------------------------
//
// Returns TRUE if point (x,y) is INSIDE cleft volume
//
window.isInsideSynapticCleft = function (x, y) {

  // Bounding box test (fast rejection)
  if (x < CLEFT_LEFT || x > CLEFT_RIGHT) return false;
  if (y < CLEFT_TOP  || y > CLEFT_BOTTOM) return false;

  // Interior rectangle (no corner check needed)
  if (
    x >= CLEFT_LEFT + CLEFT_RADIUS &&
    x <= CLEFT_RIGHT - CLEFT_RADIUS &&
    y >= CLEFT_TOP + CLEFT_RADIUS &&
    y <= CLEFT_BOTTOM - CLEFT_RADIUS
  ) {
    return true;
  }

  // Check rounded corners
  let cornerX, cornerY;

  // Top-left corner
  if (x < CLEFT_LEFT + CLEFT_RADIUS && y < CLEFT_TOP + CLEFT_RADIUS) {
    cornerX = CLEFT_LEFT + CLEFT_RADIUS;
    cornerY = CLEFT_TOP + CLEFT_RADIUS;
    return dist(x, y, cornerX, cornerY) <= CLEFT_RADIUS;
  }

  // Top-right corner
  if (x > CLEFT_RIGHT - CLEFT_RADIUS && y < CLEFT_TOP + CLEFT_RADIUS) {
    cornerX = CLEFT_RIGHT - CLEFT_RADIUS;
    cornerY = CLEFT_TOP + CLEFT_RADIUS;
    return dist(x, y, cornerX, cornerY) <= CLEFT_RADIUS;
  }

  // Bottom-left corner
  if (x < CLEFT_LEFT + CLEFT_RADIUS && y > CLEFT_BOTTOM - CLEFT_RADIUS) {
    cornerX = CLEFT_LEFT + CLEFT_RADIUS;
    cornerY = CLEFT_BOTTOM - CLEFT_RADIUS;
    return dist(x, y, cornerX, cornerY) <= CLEFT_RADIUS;
  }

  // Bottom-right corner
  if (x > CLEFT_RIGHT - CLEFT_RADIUS && y > CLEFT_BOTTOM - CLEFT_RADIUS) {
    cornerX = CLEFT_RIGHT - CLEFT_RADIUS;
    cornerY = CLEFT_BOTTOM - CLEFT_RADIUS;
    return dist(x, y, cornerX, cornerY) <= CLEFT_RADIUS;
  }

  // Point is in straight edge regions
  return true;
};


// -----------------------------------------------------
// 📍 PROJECTION TO NEAREST CLEFT SURFACE
// -----------------------------------------------------
//
// Returns nearest valid point ON cleft boundary
// Used for elastic collision response
//
window.projectToSynapticCleft = function (x, y) {

  // Clamp to bounding box first
  let px = constrain(x, CLEFT_LEFT, CLEFT_RIGHT);
  let py = constrain(y, CLEFT_TOP, CLEFT_BOTTOM);

  // Determine which edge/corner region we're in
  const inLeftCornerZone   = x < CLEFT_LEFT + CLEFT_RADIUS;
  const inRightCornerZone  = x > CLEFT_RIGHT - CLEFT_RADIUS;
  const inTopCornerZone    = y < CLEFT_TOP + CLEFT_RADIUS;
  const inBottomCornerZone = y > CLEFT_BOTTOM - CLEFT_RADIUS;

  // ---------------------------------------------
  // CORNER PROJECTIONS (circular arcs)
  // ---------------------------------------------

  // Top-left corner
  if (inLeftCornerZone && inTopCornerZone) {
    const cx = CLEFT_LEFT + CLEFT_RADIUS;
    const cy = CLEFT_TOP + CLEFT_RADIUS;
    const d = dist(x, y, cx, cy);
    
    if (d > CLEFT_RADIUS) {
      const angle = atan2(y - cy, x - cx);
      px = cx + cos(angle) * CLEFT_RADIUS;
      py = cy + sin(angle) * CLEFT_RADIUS;
    }
    return { x: px, y: py };
  }

  // Top-right corner
  if (inRightCornerZone && inTopCornerZone) {
    const cx = CLEFT_RIGHT - CLEFT_RADIUS;
    const cy = CLEFT_TOP + CLEFT_RADIUS;
    const d = dist(x, y, cx, cy);
    
    if (d > CLEFT_RADIUS) {
      const angle = atan2(y - cy, x - cx);
      px = cx + cos(angle) * CLEFT_RADIUS;
      py = cy + sin(angle) * CLEFT_RADIUS;
    }
    return { x: px, y: py };
  }

  // Bottom-left corner
  if (inLeftCornerZone && inBottomCornerZone) {
    const cx = CLEFT_LEFT + CLEFT_RADIUS;
    const cy = CLEFT_BOTTOM - CLEFT_RADIUS;
    const d = dist(x, y, cx, cy);
    
    if (d > CLEFT_RADIUS) {
      const angle = atan2(y - cy, x - cx);
      px = cx + cos(angle) * CLEFT_RADIUS;
      py = cy + sin(angle) * CLEFT_RADIUS;
    }
    return { x: px, y: py };
  }

  // Bottom-right corner
  if (inRightCornerZone && inBottomCornerZone) {
    const cx = CLEFT_RIGHT - CLEFT_RADIUS;
    const cy = CLEFT_BOTTOM - CLEFT_RADIUS;
    const d = dist(x, y, cx, cy);
    
    if (d > CLEFT_RADIUS) {
      const angle = atan2(y - cy, x - cx);
      px = cx + cos(angle) * CLEFT_RADIUS;
      py = cy + sin(angle) * CLEFT_RADIUS;
    }
    return { x: px, y: py };
  }

  // ---------------------------------------------
  // STRAIGHT EDGE PROJECTIONS
  // ---------------------------------------------

  // Already clamped to bounding box
  return { x: px, y: py };
};


// -----------------------------------------------------
// 🟢 DEBUG DRAW — ACTIVE CONSTRAINT VISUALIZATION
// -----------------------------------------------------
//
// Green outline indicates ACTIVE physics boundary
//
window.drawSynapticCleftDebug = function () {

  if (!window.SHOW_SYNAPSE_DEBUG) return;

  push();
  stroke(60, 255, 60, 220);   // 🟢 ACTIVE GREEN
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


// -----------------------------------------------------
// 🔒 CONTRACT ASSERTION
// -----------------------------------------------------
if (window.DEBUG_SYNapseContracts) {
  console.log("🔒 cleftGeometry contract: GEOMETRY + PROJECTION ONLY");
}
