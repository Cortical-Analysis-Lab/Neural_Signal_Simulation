console.log("🔬 SynapseView loaded");

// =====================================================
// SYNAPSE VIEW — BIOLOGICAL TRIPARTITE RECONSTRUCTION
// =====================================================
// • Camera positioning handled externally (main.js)
// • Structural (not dynamic) reconstruction
// • Anatomically faithful layout
// • Teaching-first, physiology-ready
// =====================================================

function drawSynapseView(state) {

  if (!window.synapseFocus) {
    drawNoSynapseMessage();
    return;
  }

  const s = window.synapseFocus;

  push();
  translate(s.x, s.y);

  drawExtracellularSpace();
  drawPresynapticBouton();
  drawSynapticCleft();
  drawPostsynapticSpine();
  drawAstrocyticEnsheathment();

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
    "No synapse selected",
    camera.x,
    camera.y
  );
  pop();
}

// =====================================================
// EXTRACELLULAR SPACE (BACKGROUND CONTEXT)
// =====================================================
function drawExtracellularSpace() {
  noStroke();
  fill(60, 80, 90, 40);
  ellipse(0, 0, 220, 160);
}

// =====================================================
// PRESYNAPTIC BOUTON
// =====================================================
function drawPresynapticBouton() {
  push();
  translate(-45, 0);

  // Bouton membrane
  fill(160, 185, 255);
  stroke(90, 120, 200);
  strokeWeight(1.5);
  ellipse(0, 0, 70, 60);

  // Active zone (membrane specialization)
  noStroke();
  fill(110, 130, 220);
  rect(30, -12, 6, 24, 3);

  // Docked vesicles (ready releasable pool)
  fill(245);
  ellipse(22, -8, 7, 7);
  ellipse(22,  0, 7, 7);
  ellipse(22,  8, 7, 7);

  // Reserve vesicle pool
  for (let i = 0; i < 8; i++) {
    ellipse(
      random(-15, 10),
      random(-18, 18),
      6,
      6
    );
  }

  // Label
  noStroke();
  fill(220);
  textSize(9);
  textAlign(CENTER, TOP);
  text("Presynaptic bouton", 0, 36);

  pop();
}

// =====================================================
// SYNAPTIC CLEFT (EXTRACELLULAR GAP)
// =====================================================
function drawSynapticCleft() {
  push();

  // Cleft space (very thin)
  noStroke();
  fill(200, 230, 255, 120);
  rect(-5, -18, 10, 36, 5);

  // Label
  fill(200, 230, 255);
  textSize(9);
  textAlign(CENTER, TOP);
  text("Cleft", 0, 20);

  pop();
}

// =====================================================
// POSTSYNAPTIC SPINE (NECK + HEAD)
// =====================================================
function drawPostsynapticSpine() {
  push();
  translate(45, 0);

  // Spine neck
  stroke(140, 110, 110);
  strokeWeight(6);
  line(-18, 0, -2, 0);

  // Spine head
  noStroke();
  fill(200, 160, 160);
  ellipse(12, 0, 46, 42);

  // Postsynaptic density (PSD)
  fill(120, 90, 90);
  rect(-2, -10, 6, 20, 3);

  // Receptors embedded in PSD
  stroke(60);
  strokeWeight(2);
  for (let y = -8; y <= 8; y += 6) {
    line(-6, y, -2, y);
  }

  // Label
  noStroke();
  fill(220);
  textSize(9);
  textAlign(CENTER, TOP);
  text("Postsynaptic spine", 12, 28);

  pop();
}

// =====================================================
// ASTROCYTIC END-FEET (PARTIAL ENSHEATHMENT)
// =====================================================
function drawAstrocyticEnsheathment() {

  noFill();
  stroke(120, 210, 170, 120);
  strokeWeight(7);

  // Astrocyte processes wrap around — not sealing
  arc(0, 0, 200, 140, PI * 0.2, PI * 0.6);
  arc(0, 0, 200, 140, PI * 0.8, PI * 1.2);

  // Label
  noStroke();
  fill(170, 240, 200);
  textSize(9);
  textAlign(CENTER, BOTTOM);
  text("Astrocytic endfeet", 0, -80);
}
