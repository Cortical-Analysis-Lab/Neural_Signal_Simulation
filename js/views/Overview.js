// =====================================================
// OVERVIEW VIEW — BIOLOGICAL, CLEAN, POLARIZED
// =====================================================

function drawOverview(state) {
  push();
  translate(0, NEURON_Y_OFFSET);   // ← SHIFT DOWN
  scale(OVERVIEW_SCALE);
  drawNeuron();
  updateSynapseHover();
  updateEPSPs();
  updateSoma();
  drawEPSPs();
  pop();
}

// -----------------------------------------------------
// Draw full neuron
// -----------------------------------------------------
function drawNeuron() {

  // =====================
  // DENDRITES (LEFT)
  // =====================
  neuron.dendrites.forEach(branch => {
    for (let i = 0; i < branch.length - 1; i++) {
      const p1 = branch[i];
      const p2 = branch[i + 1];

      stroke(235, 220, 160); // pastel yellow
      strokeWeight(p1.r * 1.6); // ↓ REDUCED thickness
      noFill();
      line(p1.x, p1.y, p2.x, p2.y);
    }
  });

  // =====================
  // SOMA (pastel yellow + Vm glow)
  // =====================
  push();

  const depol = constrain(
    map(soma.Vm, soma.rest, soma.threshold, 0, 1),
    0,
    1
  );

  const glow = lerpColor(
    color(245, 232, 170),
    color(255, 245, 200),
    depol
  );

  stroke(190, 165, 90);
  strokeWeight(3);
  fill(glow);

  ellipse(
    0,
    0,
    neuron.somaRadius * 2.1,
    neuron.somaRadius * 1.8
  );

  // Vm display
  fill(60);
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(14);
  text(`${soma.Vm.toFixed(1)} mV`, 0, 2);

  pop();

  // =====================
  // AXON HILLOCK (ROUNDED CYLINDER)
  // =====================
  push();
  noStroke();
  fill(235, 220, 160);
  
  const hx = neuron.somaRadius + 8;
  const hw = 14;
  const hh = 8;
  
  rectMode(CENTER);
  rect(hx, 0, hw, hh, hh / 2); // rounded cylinder
  pop();

  // =====================
  // AXON (RIGHT — THICK)
  // =====================
  stroke(235, 220, 160);
  strokeWeight(5); // ← MATCH DENDRITES
  noFill();
  beginShape();
  vertex(neuron.somaRadius + 10, 0);
  bezierVertex(
    neuron.somaRadius + 70, 14,
    neuron.somaRadius + 120, -14,
    neuron.somaRadius + neuron.axon.length, 0
  );
  endShape();

  // =====================
  // ACTION POTENTIAL FLASH
  // =====================
  if (isFiring) {
    push();
    noStroke();
    fill(0, 255, 120); // AP green
    ellipse(
      neuron.somaRadius + 18,
      0,
      14,
      14
    );
    pop();
  }

  // =====================
  // SYNAPTIC BOUTONS + CONTROLS
  // =====================
  neuron.synapses.forEach(s => {
  push();
  noStroke();

  if (s.type === "exc") {
    fill(s.hovered ? color(160,255,180) : color(80,220,120));
  } else {
    fill(s.hovered ? color(255,170,170) : color(220,80,80));
  }

  ellipse(s.x, s.y, s.radius * 2);
  pop();

  if (s.hovered) drawSynapseControls(s);
});

}

// -----------------------------------------------------
// Draw + / − controls and feedback (GLOBAL)
// -----------------------------------------------------
function drawSynapseControls(s) {
  push();

  textAlign(CENTER, CENTER);
  textSize(18);
  noStroke();

  // PLUS
  fill(80, 200, 120);
  ellipse(s.x, s.y - s.radius - 18, 18, 18);
  fill(0);
  text("+", s.x, s.y - s.radius - 19);

  // MINUS
  fill(200, 100, 100);
  ellipse(s.x, s.y + s.radius + 18, 18, 18);
  fill(0);
  text("–", s.x, s.y + s.radius + 18);

  // Feedback text
  textSize(10);
  fill(220);

  if (s.radius >= 30) {
    text("Maximum size", s.x, s.y - s.radius - 36);
  }

  if (s.radius <= 6) {
    text("Minimum size", s.x, s.y + s.radius + 36);
  }

  pop();
}

