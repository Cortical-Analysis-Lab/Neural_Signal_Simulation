console.log("🔬 SynapseView (biological rebuild) loaded");

// =====================================================
// SYNAPSE VIEW — BIOLOGICALLY STRUCTURED TRIPARTITE SYNAPSE
// =====================================================
// • Matches canonical neuroscience diagrams
// • Structural only (no dynamics yet)
// • Orientation matches Overview synapse
// • Astrocyte now positioned ABOVE synapse
// =====================================================

function drawSynapseView(state) {

  if (!window.synapseFocus) {
    drawNoSynapseMessage();
    return;
  }

  const s = window.synapseFocus;

  push();
  translate(s.x, s.y);

  drawPresynapticTerminal();
  drawSynapticCleft();
  drawPostsynapticSpine();
  drawAstrocyticProcess(); // now ABOVE cleft

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
// PRESYNAPTIC TERMINAL
// =====================================================
function drawPresynapticTerminal() {

  push();
  translate(-120, 0);

  fill(160, 190, 255);
  noStroke();
  ellipse(0, 0, 140, 110);

  noFill();
  stroke(110, 140, 220);
  strokeWeight(3);
  ellipse(0, 0, 140, 110);

  // Active zone
  fill(100, 120, 200);
  noStroke();
  rect(62, -28, 10, 56, 4);

  // Vesicle pool
  fill(245);
  for (let i = 0; i < 10; i++) {
    ellipse(
      random(-30, 30),
      random(-25, 25),
      8,
      8
    );
  }

  // Docked vesicles
  fill(255, 230, 230);
  for (let y = -20; y <= 20; y += 20) {
    ellipse(55, y, 8, 8);
  }

  fill(220);
  noStroke();
  textSize(12);
  textAlign(CENTER, TOP);
  text("Presynaptic terminal", 0, 70);

  pop();
}

// =====================================================
// SYNAPTIC CLEFT
// =====================================================
function drawSynapticCleft() {

  push();

  fill(120, 140, 160, 120);
  noStroke();
  rect(-10, -35, 20, 70, 10);

  fill(240);
  for (let i = 0; i < 12; i++) {
    ellipse(
      random(-6, 6),
      random(-25, 25),
      3,
      3
    );
  }

  fill(180);
  noStroke();
  textSize(11);
  textAlign(CENTER, TOP);
  text("Synaptic cleft", 0, 42);

  pop();
}

// =====================================================
// POSTSYNAPTIC SPINE
// =====================================================
function drawPostsynapticSpine() {

  push();
  translate(120, 0);

  fill(200, 170, 170);
  noStroke();
  ellipse(0, 0, 110, 90);

  fill(180, 150, 150);
  rect(-60, -10, 40, 20, 10);

  // PSD
  fill(120, 90, 90);
  rect(-58, -30, 10, 60, 4);

  // Receptors
  stroke(60);
  strokeWeight(3);
  for (let y = -20; y <= 20; y += 10) {
    line(-52, y, -40, y);
  }

  fill(220);
  noStroke();
  textSize(12);
  textAlign(CENTER, TOP);
  text("Postsynaptic spine", 0, 55);

  pop();
}

// =====================================================
// ASTROCYTIC PROCESS (ABOVE SYNAPSE)
// =====================================================
function drawAstrocyticProcess() {

  push();
  translate(0, -120); // 🔑 moved ABOVE cleft

  // Main perisynaptic sheath
  noFill();
  stroke(120, 200, 160);
  strokeWeight(10);
  arc(0, 60, 260, 180, PI * 1.1, PI * 1.9);

  // Fine processes
  strokeWeight(6);
  arc(-40, 60, 120, 80, PI * 1.2, PI * 1.8);
  arc(40, 60, 120, 80, PI * 1.2, PI * 1.8);

  // Ca²⁺ microdomain
  fill(140, 255, 200, 160);
  noStroke();
  ellipse(0, 35, 18, 18);

  // Label
  fill(180);
  noStroke();
  textSize(12);
  textAlign(CENTER, BOTTOM);
  text("Astrocytic process", 0, -10);

  pop();
}
