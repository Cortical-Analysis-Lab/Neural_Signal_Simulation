console.log("🟢 cleftGeometry loaded — CURVED CLEFT PHYSICS ENABLED");

// =====================================================
// SYNAPTIC CLEFT GEOMETRY — CURVED CONSTRAINT AUTHORITY
// =====================================================
//
// RESPONSIBILITIES:
// ✔ Define curved synaptic cleft shape between membranes
// ✔ Containment detection (isInsideSynapticCleft)
// ✔ Surface projection (projectToSynapticCleft)
// ✔ Debug visualization
//
// CLEFT SHAPE:
// • Bounded by curved presynaptic membrane (left)
// • Bounded by curved postsynaptic membrane (right)
// • Width = physical gap between terminals
//
// =====================================================


// -----------------------------------------------------
// 🎛️ CLEFT GEOMETRY PARAMETERS
// -----------------------------------------------------

// Terminal positions (from SynapseView.js)
const PRE_X  = -130;
const POST_X = +130;
const NEURON_Y = 40;

// Cleft gap width (distance between membrane surfaces)
const CLEFT_WIDTH = 20;

// Vertical extent
const CLEFT_HEIGHT = 280;
const CLEFT_Y_MIN = NEURON_Y - CLEFT_HEIGHT / 2;
const CLEFT_Y_MAX = NEURON_Y + CLEFT_HEIGHT / 2;


// -----------------------------------------------------
// 🔍 GET MEMBRANE BOUNDARIES
// -----------------------------------------------------
//
// These functions return the membrane X position at a given Y
// in SYNAPSE-LOCAL coordinates
//
function getPresynapticBoundary(y) {
  // Pre is at PRE_X (-130), rotated π, so membrane faces RIGHT (+X)
  // In synapse-local space, it's at PRE_X + membraneOffset
  const localY = y - NEURON_Y;
  const membraneOffset = window.getSynapticMembraneX?.(localY) ?? 0;
  
  // After rotation (π), the membrane that was at +offset is now at -offset
  return PRE_X - membraneOffset;
}

function getPostsynapticBoundary(y) {
  // Post is at POST_X (+130), no rotation, membrane faces LEFT (-X)
  const localY = y - NEURON_Y;
  const membraneOffset = window.getPostSynapticMembraneX?.(localY) ?? 0;
  
  return POST_X - membraneOffset;
}


// -----------------------------------------------------
// 🔍 CONTAINMENT TEST — CURVED CLEFT
// -----------------------------------------------------
//
// Returns TRUE if point (x,y) is INSIDE cleft volume
//
window.isInsideSynapticCleft = function (x, y) {

  // Vertical bounds check
  if (y < CLEFT_Y_MIN || y > CLEFT_Y_MAX) {
    return false;
  }

  // Get membrane boundaries at this Y
  const preMembraneX = getPresynapticBoundary(y);
  const postMembraneX = getPostsynapticBoundary(y);

  // Point must be between the two membranes
  return x > preMembraneX && x < postMembraneX;
};


// -----------------------------------------------------
// 📍 PROJECTION TO NEAREST CLEFT SURFACE
// -----------------------------------------------------
//
// Returns nearest valid point ON cleft boundary
// Used for elastic collision response
//
window.projectToSynapticCleft = function (x, y) {

  // Clamp Y to vertical bounds
  let py = constrain(y, CLEFT_Y_MIN, CLEFT_Y_MAX);

  // Get membrane boundaries at this Y
  const preMembraneX = getPresynapticBoundary(py);
  const postMembraneX = getPostsynapticBoundary(py);

  let px = x;

  // Project to nearest wall
  if (x <= preMembraneX) {
    // Too far left - project to presynaptic membrane
    px = preMembraneX;
  } else if (x >= postMembraneX) {
    // Too far right - project to postsynaptic membrane
    px = postMembraneX;
  }

  // Handle vertical boundaries (top/bottom)
  if (y < CLEFT_Y_MIN) {
    py = CLEFT_Y_MIN;
    px = constrain(x, preMembraneX, postMembraneX);
  } else if (y > CLEFT_Y_MAX) {
    py = CLEFT_Y_MAX;
    px = constrain(x, preMembraneX, postMembraneX);
  }

  return { x: px, y: py };
};


// -----------------------------------------------------
// 🟢 DEBUG DRAW — ACTIVE CONSTRAINT VISUALIZATION
// -----------------------------------------------------
//
// Draws the curved cleft boundaries
//
window.drawSynapticCleftDebug = function () {

  if (!window.SHOW_SYNAPSE_DEBUG) return;

  push();
  stroke(60, 255, 60, 220);   // 🟢 ACTIVE GREEN
  strokeWeight(2);
  noFill();

  const step = 3;

  // Draw presynaptic boundary (left wall)
  beginShape();
  for (let y = CLEFT_Y_MIN; y <= CLEFT_Y_MAX; y += step) {
    const x = getPresynapticBoundary(y);
    vertex(x, y);
  }
  endShape();

  // Draw postsynaptic boundary (right wall)
  beginShape();
  for (let y = CLEFT_Y_MIN; y <= CLEFT_Y_MAX; y += step) {
    const x = getPostsynapticBoundary(y);
    vertex(x, y);
  }
  endShape();

  // Draw top and bottom horizontal boundaries
  const topPreX = getPresynapticBoundary(CLEFT_Y_MIN);
  const topPostX = getPostsynapticBoundary(CLEFT_Y_MIN);
  line(topPreX, CLEFT_Y_MIN, topPostX, CLEFT_Y_MIN);

  const botPreX = getPresynapticBoundary(CLEFT_Y_MAX);
  const botPostX = getPostsynapticBoundary(CLEFT_Y_MAX);
  line(botPreX, CLEFT_Y_MAX, botPostX, CLEFT_Y_MAX);

  pop();
};


// -----------------------------------------------------
// 🔒 CONTRACT ASSERTION
// -----------------------------------------------------
if (window.DEBUG_SYNapseContracts) {
  console.log("🔒 cleftGeometry contract: CURVED GEOMETRY + PROJECTION");
}
