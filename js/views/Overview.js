// =====================================================
// OVERVIEW VIEW — BIOLOGICAL, CLEAN, POLARIZED
// =====================================================

function drawOverview(state) {
  drawNeuron1();
  drawNeuron2();

  // --- Synapse + dendrite signals ---
  updateSynapseHover();
  updateEPSPs();
  updateSoma();
  drawEPSPs();

  // --- Axon signals ---
  updateAxonSpikes();
  drawAxonSpikes();
}

// =====================================================
// NEURON 1 (PRESYNAPTIC)
// =====================================================
function drawNeuron1() {

  // =====================
  // DENDRITES
  // =====================
  neuron.dendrites.forEach(branch => {
    for (let i = 0; i < branch.length - 1; i++) {
      const p1 = branch[i];
      const p2 = branch[i + 1];

      stroke(235, 220, 160);
      strokeWeight(p1.r * 1.6);
      noFill();
      line(p1.x, p1.y, p2.x, p2.y);
    }
  });

  // =====================
  // SOMA
  // =====================
  push();

  const depol = constrain(
    map(soma.Vm, soma.rest, soma.threshold, 0, 1),
    0, 1
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

  fill(60);
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(14);
  text(`${soma.Vm.toFixed(1)} mV`, 0, 2);

  pop();

  // =====================
  // AXON HILLOCK
  // =====================
  push();
  noStroke();
  fill(235, 220, 160);
  rectMode(CENTER);
  rect(neuron.somaRadius + 8, 0, 14, 8, 4);
  pop();

  // =====================
  // AXON
  // =====================
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

  // =====================
  // AXON TERMINAL
  // =====================
  drawAxonTerminal();

  // =====================
  // SYNAPTIC BOUTONS
  // =====================
  neuron.synapses.forEach(s => {
    push();
    noStroke();

    let c = s.type === "exc"
      ? color(120, 220, 140)
      : color(220, 120, 120);

    if (s.hovered) {
      c = lerpColor(c, color(255), 0.25);
    }

    fill(c);
    ellipse(s.x, s.y, s.radius * 2);

    if (s.selected) {
      stroke(255);
      strokeWeight(2);
      noFill();
      ellipse(s.x, s.y, s.radius * 2.6);
    }

    pop();

    if (s.hovered) drawSynapseControls(s);
  });
}

// =====================================================
// NEURON 2 (POSTSYNAPTIC — VISUAL ONLY FOR NOW)
// =====================================================
function drawNeuron2() {

  // dendrite
  neuron2.dendrites.forEach(branch => {
    for (let i = 0; i < branch.length - 1; i++) {
      stroke(200);
      strokeWeight(branch[i].r * 1.4);
      line(
        branch[i].x,
        branch[i].y,
        branch[i + 1].x,
        branch[i + 1].y
      );
    }
  });

  // soma
  push();
  noStroke();
  fill(200);
  ellipse(340, 0, neuron2.somaRadius * 2);
  pop();

  // synapse target
  push();
  noStroke();
  fill(120, 220, 140);
  ellipse(200, 0, 16);
  pop();
}

// =====================================================
// AXON TERMINAL
// =====================================================
function drawAxonTerminal() {
  const p = getAxonPoint(1);

  push();
  noStroke();
  fill(200);
  ellipse(p.x, p.y, 14, 14);
  pop();
}

// =====================================================
// AXON GEOMETRY HELPER
// =====================================================
function getAxonPoint(t) {
  const x0 = neuron.somaRadius + 10;

  return {
    x: bezierPoint(
      x0,
      neuron.somaRadius + 70,
      neuron.somaRadius + 120,
      neuron.somaRadius + neuron.axon.length,
      t
    ),
    y: bezierPoint(
      0,
      14,
      -14,
      0,
      t
    )
  };
}
