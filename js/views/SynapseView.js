console.log("🔬 SynapseView loaded");

// =====================================================
// SYNAPSE VIEW — OVERVIEW-CONSISTENT TRIPARTITE SYNAPSE
// =====================================================
// • Spatial layout matches Overview synapse exactly
// • Higher biological detail
// • No dynamics yet (structure only)
// =====================================================

function drawSynapseView(state) {

  if (!window.synapseFocus) {
    drawNoSynapseMessage();
    return;
  }

  const s = window.synapseFocus;

  push();
  translate(s.x, s.y);

  drawAstrocyteBackdrop();
  drawPresynapticBouton_OV();
  drawSynapticCleft_OV();
  drawPostsynapticSpine_OV();

  pop();
}

// =====================================================
// FALLBACK MESSAGE
// =====================================================
function drawNoSynapseMessage() {
  push();
  fill(180);
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(18);
  text("No synapse selected", camera.x, camera.y);
  pop();
}

// =====================================================
// ASTROCYTE — PERIPHERAL ENSHEATHMENT (MATCHES OVERVIEW)
// =====================================================
function drawAstrocyteBackdrop() {
  noFill();
  stroke(90, 160, 130, 140);
  strokeWeight(16);

  arc(-40, -10, 220, 180, PI * 0.55, PI * 0.9);
  arc( 40,  10, 220, 180, PI * 1.1,  PI * 1.45);
}

// =====================================================
// PRESYNAPTIC BOUTON (MATCH OVERVIEW GEOMETRY)
// =====================================================
function drawPresynapticBouton_OV() {
  push();
  translate(-120, 0);

  // Bouton body
  fill(170, 195, 255);
  stroke(110, 140, 220);
  strokeWeight(3);
  ellipse(0, 0, 180, 150);

  // Active zone (right-facing)
  noStroke();
  fill(120, 140, 230);
  rect(78, -38, 16, 76, 8);

  // Docked vesicles
  fill(245);
  for (let y = -24; y <= 24; y += 12) {
    ellipse(62, y, 10, 10);
  }

  // Reserve pool
  for (let i = 0; i < 14; i++) {
    ellipse(
      random(-40, 40),
      random(-45, 45),
      9,
      9
    );
  }

  // Label
  fill(220);
  noStroke();
  textSize(16);
  textAlign(CENTER, TOP);
  text("Presynaptic bouton", 0, 90);

  pop();
}

// =====================================================
// SYNAPTIC CLEFT (VERTICAL SLAB — MATCHES OVERVIEW)
// =====================================================
function drawSynapticCleft_OV() {
  push();

  noStroke();
  fill(160, 180, 190);
  rect(-12, -55, 24, 110, 12);

  fill(200);
  textSize(16);
  textAlign(CENTER, TOP);
  text("Cleft", 0, 65);

  pop();
}

// =====================================================
// POSTSYNAPTIC SPINE (MATCH OVERVIEW GEOMETRY)
// =====================================================
function drawPostsynapticSpine_OV() {
  push();
  translate(120, 0);

  // Spine head
  fill(210, 170, 170);
  stroke(150, 110, 110);
  strokeWeight(3);
  ellipse(0, 0, 140, 140);

  // Spine neck
  noStroke();
  fill(170, 130, 130);
  rect(-88, -18, 40, 36, 18);

  // Postsynaptic density (PSD)
  fill(120, 90, 90);
  rect(-72, -42, 14, 84, 8);

  // Receptors
  stroke(40);
  strokeWeight(4);
  for (let y = -30; y <= 30; y += 15) {
    line(-66, y, -56, y);
  }

  // Label
  fill(220);
  noStroke();
  textSize(16);
  textAlign(CENTER, TOP);
  text("Postsynaptic spine", 0, 90);

  pop();
}
