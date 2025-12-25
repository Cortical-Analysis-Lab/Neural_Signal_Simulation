console.log("🔬 SynapseView — STRUCTURAL TRIPARTITE OUTLINE loaded");

// =====================================================
// SYNAPSE VIEW — STRUCTURE ONLY (NO DYNAMICS)
// =====================================================
// Goal:
// • Match canonical tripartite synapse diagram (image 3)
// • Vertical orientation
// • Outlines only
// • No particles, no animation, no labels
// =====================================================

function drawSynapseView(state) {

  if (!window.synapseFocus) {
    drawNoSynapseMessage();
    return;
  }

  const s = window.synapseFocus;

  push();
  translate(s.x, s.y);

  drawAstrocyticProcessOutline();
  drawPresynapticOutline();
  drawSynapticCleftOutline();
  drawPostsynapticOutline();

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
function drawPresynapticOutline() {

  const y = -140;

  noFill();
  stroke(140, 170, 230);
  strokeWeight(4);

  // Bouton body
  ellipse(0, y, 240, 170);

  // Active zone (flat membrane)
  strokeWeight(6);
  line(-70, y + 70, 70, y + 70);
}

// =====================================================
// SYNAPTIC CLEFT (THIN GAP)
// =====================================================
function drawSynapticCleftOutline() {

  const y = -30;

  noFill();
  stroke(120);
  strokeWeight(3);

  rect(-90, y, 180, 12, 6);
}

// =====================================================
// POSTSYNAPTIC SPINE (BOTTOM)
// =====================================================
function drawPostsynapticOutline() {

  const y = 110;

  noFill();
  stroke(190, 150, 150);
  strokeWeight(4);

  // Spine head
  ellipse(0, y, 210, 150);

  // Postsynaptic density (PSD)
  strokeWeight(6);
  line(-70, y - 75, 70, y - 75);
}

// =====================================================
// ASTROCYTIC PROCESS (ABOVE + WRAPPING)
// =====================================================
function drawAstrocyticProcessOutline() {

  noFill();
  stroke(120, 200, 160);
  strokeWeight(6);

  // Overhead astrocytic process
  arc(0, -210, 320, 160, 0, PI);

  // Lateral processes (ensheathment)
  arc(-150, -30, 180, 280, -HALF_PI, HALF_PI);
  arc(150, -30, 180, 280, HALF_PI, PI + HALF_PI);
}
