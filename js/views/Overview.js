// =====================================================
// OVERVIEW VIEW — BIOLOGICAL, CLEAN, POLARIZED (3D)
// =====================================================
console.log("overview view loaded");

const LIGHT_DIR = { x: -0.6, y: -0.8 };

// =====================================================
// MAIN OVERVIEW
// =====================================================
function drawOverview(state) {
  drawNeuron1();
  drawNeuron2();

  updateSynapseHover();
  updateEPSPs();
  updateSoma();
  updateAxonSpikes();
  updateTerminalDots();
  updateVesicles();
  updateNeuron2EPSPs();
  updateSynapticCoupling();

  drawEPSPs();
  drawAxonSpikes();
  drawVesicles();
  drawNeuron2EPSPs();
}

// =====================================================
// ORGANIC DENDRITE RENDERER (TRUNK → BRANCH → TWIG)
// =====================================================
function drawOrganicBranch(branch, baseColor) {

  if (!branch || branch.length < 2) return;

  // ---- MAIN BODY ----
  noFill();
  stroke(baseColor);

  beginShape();

  // Duplicate first point (required for curveVertex)
  curveVertex(branch[0].x, branch[0].y);

  branch.forEach((p, i) => {
    const t = i / (branch.length - 1);
    strokeWeight(lerp(p.r * 2.6, p.r * 1.0, t));
    curveVertex(p.x, p.y);
  });

  // Duplicate last point
  const last = branch[branch.length - 1];
  curveVertex(last.x, last.y);

  endShape();

  // ---- HIGHLIGHT ----
  stroke(255, 245, 190, 140);
  beginShape();

  curveVertex(
    branch[0].x + LIGHT_DIR.x,
    branch[0].y + LIGHT_DIR.y
  );

  branch.forEach(p => {
    curveVertex(
      p.x + LIGHT_DIR.x,
      p.y + LIGHT_DIR.y
    );
  });

  curveVertex(
    last.x + LIGHT_DIR.x,
    last.y + LIGHT_DIR.y
  );

  endShape();
}

// =====================================================
// NEURON 1 (PRESYNAPTIC)
// =====================================================
function drawNeuron1() {

  // ---------------- DENDRITES (TREE-LIKE) ----------------
  neuron.dendrites.forEach(branch => {
    drawOrganicBranch(branch, getColor("dendrite"));
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
  ellipse(2, 3, neuron.somaRadius * 2.3);

  // Body
  fill(body);
  ellipse(0, 0, neuron.somaRadius * 2.1);

  // Highlight
  push();
  clip(() => ellipse(0, 0, neuron.somaRadius * 2.1));
  fill(255, 255, 230, 120);
  ellipse(
    neuron.somaRadius * -0.35,
    neuron.somaRadius * -0.45,
    neuron.somaRadius * 1.3
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
  vertex(neuron.somaRadius + neuron.hillock.length, 0);
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

    noStroke();
    fill(getColor("terminalBouton", 180));
    ellipse(b.end.x, b.end.y, b.boutonRadius * 2);
  });

  // ---------------- SYNAPSES ----------------
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
// NEURON 2 (POSTSYNAPTIC)
// =====================================================
function drawNeuron2() {

  // ---------------- DENDRITES ----------------
  neuron2.dendrites.forEach(branch => {
    drawOrganicBranch(branch, getColor("dendrite"));
  });

  // ---------------- SOMA ----------------
  push();
  noStroke();

  fill(190, 165, 90);
  ellipse(
    neuron2.soma.x + 2,
    neuron2.soma.y + 3,
    neuron2.somaRadius * 2.3
  );

  fill(getColor("soma"));
  ellipse(
    neuron2.soma.x,
    neuron2.soma.y,
    neuron2.somaRadius * 2.1
  );

  push();
  clip(() =>
    ellipse(
      neuron2.soma.x,
      neuron2.soma.y,
      neuron2.somaRadius * 2.1
    )
  );
  fill(255, 255, 230, 120);
  ellipse(
    neuron2.soma.x + neuron2.somaRadius * -0.35,
    neuron2.soma.y + neuron2.somaRadius * -0.45,
    neuron2.somaRadius * 1.3
  );
  pop();

  pop();

  // ---------------- POSTSYNAPTIC DENSITY ----------------
  neuron2.synapses.forEach(s => {
    noStroke();
    fill(getColor("terminalBouton"));
    ellipse(s.x, s.y, s.radius * 2);
  });

  // ---------------- AXON OUTPUT ----------------
  const ax = radians(neuron2.axon.angle);
  const axStartX = neuron2.soma.x + cos(ax) * neuron2.somaRadius;
  const axStartY = neuron2.soma.y + sin(ax) * neuron2.somaRadius;

  const axEndX = axStartX + cos(ax) * neuron2.axon.length;
  const axEndY = axStartY + sin(ax) * neuron2.axon.length;

  stroke(getColor("axon"));
  strokeWeight(5);
  noFill();

  beginShape();
  vertex(axStartX, axStartY);
  bezierVertex(
    axStartX + 40, axStartY + 10,
    axEndX - 40, axEndY - 10,
    axEndX, axEndY
  );
  endShape();
}

// =====================================================
// SYNAPSE SIZE CONTROLS
// =====================================================
function drawSynapseControls(s) {
  noStroke();

  // -------- PLUS --------
  fill(255); // white button
  ellipse(s.x, s.y - s.radius - 18, 18, 18);

  fill(0);   // black "+"
  textAlign(CENTER, CENTER);
  text("+", s.x, s.y - s.radius - 18);

  // -------- MINUS --------
  fill(255); // white button
  ellipse(s.x, s.y + s.radius + 18, 18, 18);

  fill(0);   // black "-"
  text("–", s.x, s.y + s.radius + 18);
}

