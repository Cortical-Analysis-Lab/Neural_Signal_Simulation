// =====================================================
// OVERVIEW VIEW — BIOLOGICAL NEURON
// =====================================================

function drawOverview(state) {
  drawNeuron();
  updateSynapseHover();
  updateEPSPs();
  updateSoma();
  drawEPSPs();
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

      stroke(140);
      strokeWeight(p1.r);
      noFill();
      line(p1.x, p1.y, p2.x, p2.y);
    }
  });

  // =====================
  // SOMA (organic oval)
  // =====================
  push();
  noStroke();
  fill(160);
  ellipse(0, 0, neuron.somaRadius * 2.1, neuron.somaRadius * 1.8);
  pop();

  // =====================
  // AXON HILLOCK
  // =====================
  push();
  fill(120);
  noStroke();
  beginShape();
  vertex(neuron.somaRadius, -6);
  vertex(neuron.somaRadius + neuron.hillock.length, 0);
  vertex(neuron.somaRadius, 6);
  endShape(CLOSE);
  pop();

  // =====================
  // AXON
  // =====================
  stroke(120);
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
    fill(0, 255, 120);
    ellipse(neuron.somaRadius + neuron.hillock.length + 4, 0, 10, 10);
    pop();
  }

  // =====================
  // SYNAPTIC BOUTONS
  // =====================
  neuron.synapses.forEach(s => {
    push();
    noStroke();
    fill(s.hovered ? color(255, 0, 0) : color(200));
    ellipse(s.x, s.y, s.radius * 2);
    pop();
  });
}
