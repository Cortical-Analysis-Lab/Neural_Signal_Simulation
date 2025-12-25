console.log("🔬 SynapseView — BIOLOGICAL TRIPARTITE SYNAPSE (v1) loaded");

// =====================================================
// SYNAPSE VIEW — TRUE BIOLOGICAL RECONSTRUCTION
// =====================================================
// • Vertical polarity (pre → cleft → post)
// • Active zone aligned to PSD
// • Astrocytic ensheathment from ABOVE + SIDES
// • No reuse of overview glyphs
// =====================================================

function drawSynapseView(state) {

  if (!window.synapseFocus) {
    drawNoSynapseMessage();
    return;
  }

  const s = window.synapseFocus;

  push();
  translate(s.x, s.y);

  drawAstrocyticSheath();
  drawPresynapticTerminal();
  drawSynapticCleft();
  drawPostsynapticSpine();

  pop();
}

// =====================================================
// FALLBACK
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
// PRESYNAPTIC TERMINAL (TOP)
// =====================================================
function drawPresynapticTerminal() {

  const y = -120;

  // Terminal body
  fill(150, 180, 255);
  stroke(90, 120, 200);
  strokeWeight(3);
  ellipse(0, y, 220, 160);

  // Vesicle pool
  fill(245);
  noStroke();
  for (let i = 0; i < 14; i++) {
    ellipse(
      random(-60, 60),
      random(y - 40, y + 40),
      10,
      10
    );
  }

  // Active zone (flat membrane)
  fill(100, 120, 200);
  rect(-60, y + 60, 120, 10, 6);

  // Docked vesicles
  fill(255, 220, 220);
  for (let x = -40; x <= 40; x += 20) {
    ellipse(x, y + 55, 10, 10);
  }

  label("Presynaptic terminal", 0, y - 95);
}

// =====================================================
// SYNAPTIC CLEFT (THIN PLANE)
// =====================================================
function drawSynapticCleft() {

  const y = -20;

  fill(120, 140, 160, 120);
  noStroke();
  rect(-90, y, 180, 14, 8);

  // Neurotransmitter molecules
  fill(240);
  for (let i = 0; i < 20; i++) {
    ellipse(
      random(-70, 70),
      random(y + 2, y + 12),
      4,
      4
    );
  }

  label("Synaptic cleft", 0, y + 28);
}

// =====================================================
// POSTSYNAPTIC SPINE (BOTTOM)
// =====================================================
function drawPostsynapticSpine() {

  const y = 90;

  // Spine head
  fill(200, 170, 170);
  stroke(140, 110, 110);
  strokeWeight(3);
  ellipse(0, y, 200, 150);

  // Postsynaptic density
  fill(120, 90, 90);
  rect(-70, y - 80, 140, 12, 6);

  // Receptors
  stroke(40);
  strokeWeight(4);
  for (let x = -50; x <= 50; x += 25) {
    line(x, y - 78, x, y - 58);
  }

  label("Postsynaptic spine", 0, y + 95);
}

// =====================================================
// ASTROCYTIC ENSHEATHMENT (ABOVE + SIDES)
// =====================================================
function drawAstrocyticSheath() {

  noFill();
  stroke(120, 210, 170, 180);
  strokeWeight(14);

  // Left and right processes
  arc(-140, -20, 160, 260, -PI / 2, PI / 2);
  arc(140, -20, 160, 260, PI / 2, (3 * PI) / 2);

  // Overhead process
  arc(0, -160, 300, 140, 0, PI);

  // Ca²⁺ microdomain
  fill(140, 255, 200, 180);
  noStroke();
  ellipse(0, -140, 22, 22);

  label("Astrocytic process", 0, -200);
}

// =====================================================
// LABEL HELPER
// =====================================================
function label(txt, x, y) {
  fill(200);
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(12);
  text(txt, x, y);
}
