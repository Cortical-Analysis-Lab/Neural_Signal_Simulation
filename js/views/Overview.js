// =====================================================
// OVERVIEW VIEW — BIOLOGICAL, CLEAN, POLARIZED
// =====================================================

function drawOverview(state) {
  drawNeuron1();
  drawNeuron2();

  updateSynapseHover();
  updateEPSPs();
  updateSoma();

  updateAxonSpikes();
  updateTerminalDots();

  drawEPSPs();
  drawAxonSpikes();
}

// =====================================================
// NEURON 1 (PRESYNAPTIC)
// =====================================================
function drawNeuron1() {

  // ---------------------
  // DENDRITES
  // ---------------------
  neuron.dendrites.forEach(branch => {
    for (let i = 0; i < branch.length - 1; i++) {
      stroke(235, 220, 160);
      strokeWeight(branch[i].r * 1.6);
      line(branch[i].x, branch[i].y, branch[i + 1].x, branch[i + 1].y);
    }
  });

  // ---------------------
  // SOMA
  // ---------------------
  push();
  fill(245, 232, 170);
  stroke(190, 165, 90);
  strokeWeight(3);
  ellipse(0, 0, neuron.somaRadius * 2.1, neuron.somaRadius * 1.8);
  fill(60);
  noStroke();
  textAlign(CENTER, CENTER);
  text(`${soma.Vm.toFixed(1)} mV`, 0, 2);
  pop();

  // ---------------------
  // AXON SHAFT
  // ---------------------
  stroke(235, 220, 160);
  strokeWeight(5);
  noFill();

  beginShape();
  vertex(neuron.somaRadius + 10, 0);
  bezierVertex(
    neuron.somaRadius + 70, 14,
    neuron.somaRadius + 120, -14,
    neuron.somaRadius + neuron.axon.length, 0
  );
  endShape();

  // ---------------------
  // AXON TERMINAL BRANCHES + BOUTONS
  // ---------------------
  strokeWeight(3);

  neuron.axon.terminalBranches.forEach(b => {

    stroke(235, 220, 160);
    noFill();
    bezier(
      b.start.x, b.start.y,
      b.ctrl.x,  b.ctrl.y,
      b.ctrl.x,  b.ctrl.y,
      b.end.x,   b.end.y
    );

    // Presynaptic bouton
    push();
    noStroke();
    fill(120, 220, 140);
    ellipse(b.end.x, b.end.y, b.boutonRadius * 2);
    pop();
  });
}

// =====================================================
// NEURON 2 — VISUAL ONLY (ALIGNED TO TERMINALS)
// =====================================================
function drawNeuron2() {

  neuron2.dendrites.forEach(branch => {
    for (let i = 0; i < branch.length - 1; i++) {
      stroke(200);
      strokeWeight(branch[i].r * 1.4);
      line(branch[i].x, branch[i].y, branch[i + 1].x, branch[i + 1].y);
    }
  });

  push();
  noStroke();
  fill(200);
  ellipse(neuron2.soma.x, neuron2.soma.y, neuron2.somaRadius * 2);
  pop();

  neuron2.synapses.forEach(s => {
    push();
    noStroke();
    fill(120, 220, 140);
    ellipse(s.x, s.y, s.radius * 2);
    pop();
  });
}
