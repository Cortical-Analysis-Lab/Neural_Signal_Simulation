console.log("🧬 psdReceptors.js loaded");

// =====================================================
// POSTSYNAPTIC DENSITY — RECEPTORS
// =====================================================

// ---- Color scheme (physiology-aligned) ----
const AMPA_COLOR = [80, 180, 255];   // AMPAR — fast ionotropic
const NMDA_COLOR = [255, 90, 90];    // NMDAR — coincidence detector
const GPCR_COLOR = [120, 220, 120];  // GPCR — metabotropic

// =====================================================
// MAIN ENTRY
// Draws receptors on postsynaptic membrane
// =====================================================
function drawPSDReceptors() {
  push();

  // Offset slightly into cleft so stroke doesn't collide
  translate(-6, 0);

  noStroke();

  drawAMPAR();
  drawNMDAR();
  drawGPCR();

  pop();
}

// =====================================================
// AMPA RECEPTOR (FAST)
// =====================================================
function drawAMPAR() {
  push();
  fill(...AMPA_COLOR);

  // Slightly elongated ellipse
  ellipse(0, -42, 14, 22);

  pop();
}

// =====================================================
// NMDA RECEPTOR (VOLTAGE-DEPENDENT)
// =====================================================
function drawNMDAR() {
  push();
  fill(...NMDA_COLOR);
  rectMode(CENTER);

  // Taller body to imply channel complexity
  rect(0, 0, 16, 28, 6);

  pop();
}

// =====================================================
// GPCR (METABOTROPIC)
// =====================================================
function drawGPCR() {
  push();
  fill(...GPCR_COLOR);

  // Rounded signaling receptor
  ellipse(0, 42, 18, 18);

  pop();
}
