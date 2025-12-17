// =====================================================
// OVERVIEW VIEW — BIOLOGICAL, CLEAN, POLARIZED
// =====================================================

function drawOverview(state) {
  push();
  scale(1.5);          // ← SCALE EVERYTHING
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

      stroke(235, 220, 160); // pastel yellow dendrites
      strokeWeight(p1.r * 2.5);
      noFill();
      line(p1.x, p1.y, p2.x, p2.y);
    }
  });

  // =====================
  // SOMA (pastel yellow + Vm glow)
  // =====================
  push();
  
  const depol = constrain(map(soma.Vm, soma.rest, soma.threshold, 0, 1), 0, 1);
  const glow = lerpColor(
    color(245, 232, 170),
    color(255, 245, 200),
    depol
  );
  
  stroke(190, 165, 90);
  strokeWeight(3);
  fill(glow);

  
  ellipse(0, 0, neuron.somaRadius * 2.1, neuron.somaRadius * 1.8);
  // Vm display inside soma
  push();
  fill(60);
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(14);
  text(`${soma.Vm.toFixed(1)} mV`, 0, 2);
  pop();

  pop();


  // =====================
  // AXON HILLOCK
  // =====================
  push();
  noStroke();
  fill(235, 220, 160);
  beginShape();
  vertex(neuron.somaRadius, -6);
  vertex(neuron.somaRadius + neuron.hillock.length, 0);
  vertex(neuron.somaRadius, 6);
  endShape(CLOSE);
  pop();

  // =====================
  // AXON (RIGHT)
  // =====================
  stroke(235, 220, 160); // pastel yellow axon
  strokeWeight(3);
  noFill();
  beginShape();
  vertex(neuron.somaRadius + neuron.hillock.length, 0);
  bezierVertex(
    neuron.somaRadius + 60, 10,
    neuron.somaRadius + 120, -10,
    neuron.somaRadius + neuron.axon.length, 0
  );
  endShape();

  // =====================
  // ACTION POTENTIAL FLASH
  // =====================
  if (isFiring) {
    push();
    noStroke();
    fill(0, 255, 120); // AP GREEN
    ellipse(neuron.somaRadius + neuron.hillock.length + 6, 0, 12, 12);
    pop();
  }

  // =====================
  // SYNAPTIC BOUTONS + CONTROLS
  // =====================
  neuron.synapses.forEach(s => {

    // Bouton
    push();
    noStroke();
    fill(s.hovered ? color(255, 200, 200) : color(220));
    ellipse(s.x, s.y, s.radius * 2);
    pop();

    // +/- controls
    if (s.hovered) {
      drawSynapseControls(s);
    }
  });
}

// -----------------------------------------------------
// Draw + / − controls and feedback
// -----------------------------------------------------
function drawSynapseControls(s) {

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
}
