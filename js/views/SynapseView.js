console.log("🔬 SynapseView loaded");

// =====================================================
// SYNAPSE VIEW — FOCUSED, INTERACTIVE SANDBOX
// =====================================================
// • Camera pre-positioned on entry
// • Functionally isolated from Overview
// • User-modifiable synaptic parameters
// =====================================================

function drawSynapseView(state) {

  if (!window.synapseFocus) {
    drawNoSynapseMessage();
    return;
  }

  const s = window.synapseFocus;

  push();
  translate(s.x, s.y);

  drawSynapticCleftHalo();
  drawPresynapticTerminalDetail(s);
  drawPostsynapticSpineDetail(s);
  drawAstrocyteEndfeetDetail(s);

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
  textSize(16);
  text(
    "No active synapse to inspect.\nTrigger a spike first.",
    camera.x,
    camera.y
  );
  pop();
}

// =====================================================
// VISUAL COMPONENTS (DETAIL LEVEL)
// =====================================================
function drawSynapticCleftHalo() {
  noFill();
  stroke(160, 210, 255, 140);
  strokeWeight(2);
  ellipse(0, 0, 20, 20);
}

function drawPresynapticTerminalDetail(s) {
  push();
  translate(-26, 0);

  fill(170, 190, 255);
  noStroke();
  ellipse(0, 0, 48, 48);

  // Active zone
  fill(120, 140, 220);
  rect(18, -14, 6, 28, 3);

  // Vesicle pool (static for now)
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

function drawPostsynapticSpineDetail(s) {
  push();
  translate(26, 0);

  fill(200, 170, 170);
  noStroke();
  ellipse(0, 0, 44, 44);

  stroke(110);
  strokeWeight(2);
  for (let y = -12; y <= 12; y += 6) {
    line(-20, y, -14, y);
  }

  pop();
}

function drawAstrocyteEndfeetDetail(s) {
  noFill();
  stroke(130, 210, 170, 100);
  strokeWeight(6);
  arc(0, 0, 120, 90, PI * 0.15, PI * 0.85);
}
