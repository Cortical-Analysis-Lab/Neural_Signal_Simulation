console.log("🔬 SynapseView loaded");

// =====================================================
// SYNAPSE VIEW — FREE CAMERA, DETAIL OVERLAY
// =====================================================
// Teaching-first zoomed synapse visualization
// • No camera control
// • Uses real synaptic clefts
// • Visual only (no new behavior)
// • Safe when no synapse is active
// =====================================================

function drawSynapseView(state) {

  // ---------------------------------------------------
  // Draw base neurons (still part of world)
  // ---------------------------------------------------
  drawNeuron1();
  drawNeuron2();

  // ---------------------------------------------------
  // Draw synapse detail at active clefts
  // ---------------------------------------------------
  if (
    !window.activeSynapticClefts ||
    window.activeSynapticClefts.length === 0
  ) {
    drawSynapseIdleHint();
    return;
  }

  // Use most recent cleft
  const cleft =
    window.activeSynapticClefts[
      window.activeSynapticClefts.length - 1
    ];

  push();
  translate(cleft.x, cleft.y);

  drawSynapticCleftHalo();
  drawPresynapticTerminalDetail();
  drawPostsynapticSpineDetail();
  drawAstrocyteEndfeetDetail();

  pop();
}

// =====================================================
// IDLE TEACHING CUE (NO SYNAPSE YET)
// =====================================================
function drawSynapseIdleHint() {
  push();
  fill(180, 180, 180, 120);
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(14);
  text(
    "Waiting for synaptic transmission…",
    camera.x,
    camera.y
  );
  pop();
}

// =====================================================
// SYNAPTIC CLEFT VISUAL
// =====================================================
function drawSynapticCleftHalo() {
  noFill();
  stroke(160, 200, 255, 120);
  strokeWeight(2);

  ellipse(0, 0, 18, 18);
}

// =====================================================
// PRESYNAPTIC TERMINAL (DETAIL)
// =====================================================
function drawPresynapticTerminalDetail() {
  push();
  translate(-24, 0);

  // Terminal body
  fill(170, 190, 255);
  noStroke();
  ellipse(0, 0, 46, 46);

  // Active zone
  fill(120, 140, 220);
  rect(18, -12, 6, 24, 3);

  // Vesicles (static pool)
  fill(240);
  for (let i = 0; i < 6; i++) {
    ellipse(
      random(-8, 8),
      random(-10, 10),
      6,
      6
    );
  }

  pop();
}

// =====================================================
// POSTSYNAPTIC SPINE (DETAIL)
// =====================================================
function drawPostsynapticSpineDetail() {
  push();
  translate(24, 0);

  // Spine head
  fill(200, 170, 170);
  noStroke();
  ellipse(0, 0, 42, 42);

  // Receptors
  stroke(110);
  strokeWeight(2);
  for (let y = -12; y <= 12; y += 6) {
    line(-20, y, -14, y);
  }

  pop();
}

// =====================================================
// ASTROCYTIC END-FEET (TRIPARTITE SYNAPSE)
// =====================================================
function drawAstrocyteEndfeetDetail() {
  noFill();
  stroke(130, 210, 170, 90);
  strokeWeight(6);

  arc(0, 0, 110, 80, PI * 0.15, PI * 0.85);
}
