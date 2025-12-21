// =====================================================
// OVERVIEW VIEW — BIOLOGICAL, CLEAN, POLARIZED (3D)
// =====================================================
console.log("overview view loaded");

const LIGHT_DIR = { x: -0.6, y: -0.8 };

function drawOverview(state) {
  drawNeuron1();
  drawNeuron2();

  updateSynapseHover();
  updateEPSPs();
  updateSoma();
  updateAxonSpikes();
  updateTerminalDots();
  updateVesicles();
  updateSynapticCoupling();

  drawEPSPs();
  drawAxonSpikes();
}

// =====================================================
// NEURON 1 (PRESYNAPTIC)
// =====================================================
function drawNeuron1() {

  // ---------------- DENDRITES ----------------
  neuron.dendrites.forEach(branch => {
    for (let i = 0; i < branch.length - 1; i++) {
      const p1 = branch[i];
      const p2 = branch[i + 1];

      stroke(getColor("dendrite"));
      strokeWeight(p1.r * 1.8);
      line(p1.x, p1.y, p2.x, p2.y);

      stroke(255, 245, 190);
      strokeWeight(p1.r * 0.9);
      line(
        p1.x + LIGHT_DIR.x,
        p1.y + LIGHT_DIR.y,
        p2.x + LIGHT_DIR.x,
        p2.y + LIGHT_DIR.y
      );
    }
  });

  // ---------------- SOMA ----------------
  push();

  const depol = constrain(
    map(soma.Vm, soma.rest, soma.threshold, 0, 1),
    0, 1
  );

  const body = lerpColor(
    getColor("soma"),
    color(255, 245, 200),
    depol
  );

  noStroke();

  // Shadow
  fill(190, 165, 90);
  ellipse(2, 3, neuron.somaRadius * 2.2);

  // Body
  fill(body);
  ellipse(0, 0, neuron.somaRadius * 2.05);

  // Highlight (clipped)
  push();
  clip(() => ellipse(0, 0, neuron.somaRadius * 2.05));
  fill(255, 255, 230, 120);
  ellipse(
    neuron.somaRadius * -0.3,
    neuron.somaRadius * -0.4,
    neuron.somaRadius * 1.2
  );
  pop();

  // Vm label
  fill(60);
  textAlign(CENTER, CENTER);
  textSize(14);
  text(`${soma.Vm.toFixed(1)} mV`, 0, 2);

  pop();

  // ---------------- AXON ----------------
  noFill();
  stroke(getColor("axon"));
  strokeWeight(6);

  beginShape();
  vertex(neuron.somaRadius + 10, 0);
  bezierVertex(
    neuron.somaRadius + 70, 14,
    neuron.somaRadius + 120, -14,
    neuron.somaRadius + neuron.axon.length, 0
  );
  endShape();

  // ---------------- AXON TERMINALS ----------------
  neuron.axon.terminalBranches.forEach(b => {

    stroke(getColor("axon"));
    strokeWeight(3);
    noFill();

    bezier(
      b.start.x, b.start.y,
      b.ctrl.x,  b.ctrl.y,
      b.ctrl.x,  b.ctrl.y,
      b.end.x,   b.end.y
    );

    // Structural bouton (quiet, anatomical)
    noStroke();
    fill(getColor("terminalBouton", 180));
    ellipse(b.end.x, b.end.y, b.boutonRadius * 2);
  });

  // ---------------- DENDRITIC SYNAPTIC INPUTS ----------------
  neuron.synapses.forEach(s => {

    const base =
      s.type === "exc"
        ? getColor("terminalBouton")
        : getColor("ipsp");

    noStroke();
    fill(base);
    ellipse(s.x, s.y, s.radius * 2);

    if (s.selected) {
      stroke(255);
      strokeWeight(2);
      noFill();
      ellipse(s.x, s.y, s.radius * 2.6);
    }

    if (s.hovered) drawSynapseControls(s);
  });
}

// =====================================================
// NEURON 2 (POSTSYNAPTIC — MATCHED 3D STYLE)
// =====================================================
function drawNeuron2() {

  // ---------------- DENDRITES ----------------
  neuron2.dendrites.forEach(branch => {
    for (let i = 0; i < branch.length - 1; i++) {
      const p1 = branch[i];
      const p2 = branch[i + 1];

      stroke(getColor("dendrite"));
      strokeWeight(p1.r * 1.8);
      line(p1.x, p1.y, p2.x, p2.y);

      stroke(255, 245, 190);
      strokeWeight(p1.r * 0.9);
      line(
        p1.x + LIGHT_DIR.x,
        p1.y + LIGHT_DIR.y,
        p2.x + LIGHT_DIR.x,
        p2.y + LIGHT_DIR.y
      );
    }
  });

  // ---------------- SOMA ----------------
  push();
  noStroke();

  // Shadow
  fill(190, 165, 90);
  ellipse(
    neuron2.soma.x + 2,
    neuron2.soma.y + 3,
    neuron2.somaRadius * 2.2
  );

  // Body
  fill(getColor("soma"));
  ellipse(
    neuron2.soma.x,
    neuron2.soma.y,
    neuron2.somaRadius * 2.05
  );

  // Highlight (clipped)
  push();
  clip(() =>
    ellipse(
      neuron2.soma.x,
      neuron2.soma.y,
      neuron2.somaRadius * 2.05
    )
  );

  fill(255, 255, 230, 120);
  ellipse(
    neuron2.soma.x + neuron2.somaRadius * -0.3,
    neuron2.soma.y + neuron2.somaRadius * -0.4,
    neuron2.somaRadius * 1.2
  );
  pop();

  pop();

  // ---------------- POSTSYNAPTIC DENSITY ----------------
  neuron2.synapses.forEach(s => {
    noStroke();
    fill(getColor("terminalBouton"));
    ellipse(s.x, s.y, s.radius * 2);
  });
}

// =====================================================
// SYNAPSE SIZE CONTROLS
// =====================================================
function drawSynapseControls(s) {
  noStroke();

  fill(80, 200, 120);
  ellipse(s.x, s.y - s.radius - 18, 18, 18);
  fill(0);
  text("+", s.x, s.y - s.radius - 18);

  fill(200, 100, 100);
  ellipse(s.x, s.y + s.radius + 18, 18, 18);
  fill(0);
  text("–", s.x, s.y + s.radius + 18);
}
