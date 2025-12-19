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
  // AXON SHAFT
  // =====================
  stroke(235, 220, 160);
  strokeWeight(5);
  noFill();

  beginShape();
  vertex(neuron.somaRadius + 10, 0);
  bezierVertex(
    neuron.somaRadius + 70,  14,
    neuron.somaRadius + 120, -14,
    neuron.somaRadius + neuron.axon.length, 0
  );
  endShape();

  // =====================
  // AXON TERMINAL BRANCHES
  // =====================
  stroke(235, 220, 160);
  strokeWeight(3);

  neuron.axon.terminalBranches.forEach(b => {
    line(b.start.x, b.start.y, b.end.x, b.end.y);
  });

  // =====================
  // SYNAPTIC BOUTONS (ONTO NEURON 1 DENDRITES)
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
// NEURON 2 (POSTSYNAPTIC — VISUAL ONLY)
// =====================================================
function drawNeuron2() {

  neuron2.dendrites.forEach(branch => {
    for (let i = 0; i < branch.length - 1; i++) {
      const p1 = branch[i];
      const p2 = branch[i + 1];

      stroke(200);
      strokeWeight(p1.r * 1.4);
      noFill();
      line(p1.x, p1.y, p2.x, p2.y);
    }
  });

  push();
  noStroke();
  fill(200);
  ellipse(
    neuron2.soma.x,
    neuron2.soma.y,
    neuron2.somaRadius * 2
  );
  pop();

  neuron2.synapses.forEach(s => {
    push();
    noStroke();
    fill(120, 220, 140);
    ellipse(s.x, s.y, s.radius * 2);
    pop();
  });
}

// =====================================================
// AXON GEOMETRY HELPER (SHARED)
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

// =====================================================
// SYNAPSE SIZE CONTROLS
// =====================================================
function drawSynapseControls(s) {
  push();

  textAlign(CENTER, CENTER);
  textSize(18);
  noStroke();

  fill(80, 200, 120);
  ellipse(s.x, s.y - s.radius - 18, 18, 18);
  fill(0);
  text("+", s.x, s.y - s.radius - 19);

  fill(200, 100, 100);
  ellipse(s.x, s.y + s.radius + 18, 18, 18);
  fill(0);
  text("–", s.x, s.y + s.radius + 18);

  pop();
}
