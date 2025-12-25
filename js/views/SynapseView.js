console.log("🔬 SynapseView loaded");

// =====================================================
// SYNAPSE VIEW — FOCUSED, INTERACTIVE SANDBOX
// =====================================================
// • Camera positioning handled externally (main.js)
// • Uses synapseFocus (event-based OR user-selected)
// • Functionally isolated from Overview
// • Ready for user manipulation of synaptic parameters
// =====================================================

function drawSynapseView(state) {

  // ---------------------------------------------------
  // No synapse selected yet
  // ---------------------------------------------------
  if (!window.synapseFocus) {
    drawNoSynapseMessage();
    return;
  }

  const s = window.synapseFocus;

  push();
  translate(s.x, s.y);

  drawSynapticCleftHalo(s);
  drawPresynapticTerminalDetail(s);
  drawPostsynapticSpineDetail(s);
  drawAstrocyteEndfeetDetail(s);

  pop();
}

// =====================================================
// FALLBACK MESSAGE (NO SYNAPSE SELECTED)
// =====================================================
function drawNoSynapseMessage() {
  push();
  fill(180);
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(16);
  text(
    "Click a synapse to inspect\nor trigger a spike first",
    camera.x,
    camera.y
  );
  pop();
}

// =====================================================
// SYNAPTIC CLEFT VISUAL
// =====================================================
function drawSynapticCleftHalo(s) {
  noFill();
  stroke(160, 210, 255, 150);
  strokeWeight(2);

  ellipse(0, 0, 22, 22);

  // Teaching cue: label
  fill(160, 210, 255);
  noStroke();
  textSize(10);
  textAlign(CENTER, TOP);
  text("Synaptic cleft", 0, 16);
}

// =====================================================
// PRESYNAPTIC TERMINAL (DETAIL)
// =====================================================
function drawPresynapticTerminalDetail(s) {
  push();
  translate(-28, 0);

  // Terminal body
  fill(170, 190, 255);
  noStroke();
  ellipse(0, 0, 50, 50);

  // Active zone
  fill(120, 140, 220);
  rect(20, -14, 6, 28, 3);

  // Vesicle pool (static for now)
  fill(240);
  for (let i = 0; i < 6; i++) {
    ellipse(
      random(-9, 9),
      random(-11, 11),
      6,
      6
    );
  }

  // Label
  fill(200);
  textSize(9);
  textAlign(CENTER, TOP);
  text("Presynaptic\nterminal", 0, 28);

  pop();
}

// =====================================================
// POSTSYNAPTIC SPINE (DETAIL)
// =====================================================
function drawPostsynapticSpineDetail(s) {
  push();
  translate(28, 0);

  // Spine head
  fill(200, 170, 170);
  noStroke();
  ellipse(0, 0, 46, 46);

  // Receptors
  stroke(110);
  strokeWeight(2);
  for (let y = -14; y <= 14; y += 7) {
    line(-22, y, -15, y);
  }

  // Label
  fill(200);
  noStroke();
  textSize(9);
  textAlign(CENTER, TOP);
  text("Postsynaptic\nspine", 0, 28);

  pop();
}

// =====================================================
// ASTROCYTIC END-FEET (TRIPARTITE SYNAPSE)
// =====================================================
function drawAstrocyteEndfeetDetail(s) {

  noFill();
  stroke(130, 210, 170, 110);
  strokeWeight(6);

  arc(0, 0, 130, 95, PI * 0.15, PI * 0.85);

  // Label
  fill(170, 230, 200);
  noStroke();
  textSize(9);
  textAlign(CENTER, BOTTOM);
  text("Astrocytic endfeet", 0, -52);
}
