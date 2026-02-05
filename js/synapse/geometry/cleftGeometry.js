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

// Terminal positions (imported from SynapseView.js globals)
// PRE_X, POST_X, NEURON_Y are defined in SynapseView.js

// Cleft gap width (distance between membrane surfaces)
const CLEFT_WIDTH = 20;

// Vertical extent
const CLEFT_HEIGHT = 280;


// -----------------------------------------------------
// 🔍 GET MEMBRANE BOUNDARIES
// -----------------------------------------------------
//
// These functions return the membrane X position at a given Y
// in SYNAPSE-LOCAL coordinates
//
function getPresynapticBoundary(y) {
  // Get terminal position and neuron Y from SynapseView globals
  const preX = window.PRE_X ?? -130;
  const neuronY = window.NEURON_Y ?? 40;
  
  // Pre is at PRE_X (-130), rotated π, so membrane faces RIGHT (+X)
  // In synapse-local space, it's at PRE_X + membraneOffset
  const localY = y - neuronY;
  const membraneOffset = window.getSynapticMembraneX?.(localY) ?? 0;
  
  // After rotation (π), the membrane that was at +offset is now at -offset
  return preX - membraneOffset;
}

function getPostsynapticBoundary(y) {
  // Get terminal position and neuron Y from SynapseView globals
  const postX = window.POST_X ?? 130;
  const neuronY = window.NEURON_Y ?? 40;
  
  // Post is at POST_X (+130), no rotation, membrane faces LEFT (-X)
  const localY = y - neuronY;
  const membraneOffset = window.getPostSynapticMembraneX?.(localY) ?? 0;
  
  return postX - membraneOffset;
}


// -----------------------------------------------------
// 🔍 CONTAINMENT TEST — CURVED CLEFT
// -----------------------------------------------------
//
// Returns TRUE if point (x,y) is INSIDE cleft volume
//
window.isInsideSynapticCleft = function (x, y) {

  const neuronY = window.NEURON_Y ?? 40;
  const cleftYMin = neuronY - CLEFT_HEIGHT / 2;
  const cleftYMax = neuronY + CLEFT_HEIGHT / 2;

  // Vertical bounds check
  if (y < cleftYMin || y > cleftYMax) {
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

  const neuronY = window.NEURON_Y ?? 40;
  const cleftYMin = neuronY - CLEFT_HEIGHT / 2;
  const cleftYMax = neuronY + CLEFT_HEIGHT / 2;

  // Clamp Y to vertical bounds
  let py = constrain(y, cleftYMin, cleftYMax);

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
  if (y < cleftYMin) {
    py = cleftYMin;
    px = constrain(x, preMembraneX, postMembraneX);
  } else if (y > cleftYMax) {
    py = cleftYMax;
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

  const neuronY = window.NEURON_Y ?? 40;
  const cleftYMin = neuronY - CLEFT_HEIGHT / 2;
  const cleftYMax = neuronY + CLEFT_HEIGHT / 2;

  push();
  stroke(60, 255, 60, 220);   // 🟢 ACTIVE GREEN
  strokeWeight(2);
  noFill();

  const step = 3;

  // Draw presynaptic boundary (left wall)
  beginShape();
  for (let y = cleftYMin; y <= cleftYMax; y += step) {
    const x = getPresynapticBoundary(y);
    vertex(x, y);
  }
  endShape();

  // Draw postsynaptic boundary (right wall)
  beginShape();
  for (let y = cleftYMin; y <= cleftYMax; y += step) {
    const x = getPostsynapticBoundary(y);
    vertex(x, y);
  }
  endShape();

  // Draw top and bottom horizontal boundaries
  const topPreX = getPresynapticBoundary(cleftYMin);
  const topPostX = getPostsynapticBoundary(cleftYMin);
  line(topPreX, cleftYMin, topPostX, cleftYMin);

  const botPreX = getPresynapticBoundary(cleftYMax);
  const botPostX = getPostsynapticBoundary(cleftYMax);
  line(botPreX, cleftYMax, botPostX, cleftYMax);

  pop();
};


// -----------------------------------------------------
// 🔒 CONTRACT ASSERTION
// -----------------------------------------------------
if (window.DEBUG_SYNapseContracts) {
  console.log("🔒 cleftGeometry contract: CURVED GEOMETRY + PROJECTION");
}
