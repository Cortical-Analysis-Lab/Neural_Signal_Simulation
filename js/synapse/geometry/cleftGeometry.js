console.log("🟦 cleftGeometry loaded — CLEF DOMAIN AUTHORITY");

// =====================================================
// SYNAPTIC CLEFT GEOMETRY — SINGLE CONSTRAINT SOURCE
// =====================================================
//
// ✔ Defines NT confinement volume
// ✔ Rounded rectangle (capsule-like)
// ✔ World-space
// ✔ NO forces
// ✔ NO motion
//
// =====================================================


// -----------------------------------------------------
// CLEF BOUNDS (WORLD SPACE)
// -----------------------------------------------------
const CLEFT_LEFT   = -95;   // presynaptic membrane
const CLEFT_RIGHT  = +95;   // postsynaptic membrane
const CLEFT_TOP    = -135;  // astrocyte endfoot
const CLEFT_BOTTOM = +80;   // optional floor

const CLEFT_RADIUS = 22;


// -----------------------------------------------------
// HELPER — CLAMP
// -----------------------------------------------------
function clamp(v, a, b) {
  return Math.max(a, Math.min(b, v));
}


// -----------------------------------------------------
// 🔑 POINT-IN-CLEFT TEST
// -----------------------------------------------------
window.isInsideSynapticCleft = function (x, y) {

  const cx = clamp(x, CLEFT_LEFT, CLEFT_RIGHT);
  const cy = clamp(y, CLEFT_TOP, CLEFT_BOTTOM);

  const dx = x - cx;
  const dy = y - cy;

  return (dx * dx + dy * dy) <= (CLEFT_RADIUS * CLEFT_RADIUS);
};


// -----------------------------------------------------
// 🔑 PROJECT POINT TO CLEFT (MINIMAL CORRECTION)
// -----------------------------------------------------
window.projectToSynapticCleft = function (x, y) {

  let px = clamp(x, CLEFT_LEFT, CLEFT_RIGHT);
  let py = clamp(y, CLEFT_TOP, CLEFT_BOTTOM);

  const dx = x - px;
  const dy = y - py;

  const d2 = dx * dx + dy * dy;

  if (d2 > CLEFT_RADIUS * CLEFT_RADIUS) return { x, y };

  const d = Math.sqrt(d2) || 1;
  const k = CLEFT_RADIUS / d;

  return {
    x: px + dx * k,
    y: py + dy * k
  };
};


// -----------------------------------------------------
// 🟠 DEBUG DRAW — CLEF DOMAIN
// -----------------------------------------------------
window.drawSynapticCleftDebug = function () {

  if (!window.SHOW_SYNAPSE_DEBUG) return;

  push();
  stroke(255, 160, 40, 200);
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
