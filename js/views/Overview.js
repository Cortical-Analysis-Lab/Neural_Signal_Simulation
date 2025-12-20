// =====================================================
// OVERVIEW VIEW — BIOLOGICAL, CLEAN, POLARIZED (3D)
// =====================================================

const LIGHT_DIR = { x: -0.6, y: -0.8 };

function drawOverview(state) {
  drawNeuron1();
  drawNeuron2();

  updateSynapseHover();
  updateEPSPs();
  updateSoma();

  updateAxonSpikes();
  updateTerminalDots();
  updateSynapticCoupling();

  drawEPSPs();
  drawAxonSpikes();
}

// =====================================================
// NEURON 1 (PRESYNAPTIC)
// =====================================================
function drawNeuron1() {

  // --------------------------------------------------
  // DENDRITES (CYLINDRICAL SHADING)
  // --------------------------------------------------
  neuron.dendrites.forEach(branch => {
    for (let i = 0; i < branch.length - 1; i++) {
      const p1 = branch[i];
      const p2 = branch[i + 1];

      // Base
      stroke(200, 185, 120);
      strokeWeight(p1.r * 1.8);
      line(p1.x, p1.y, p2.x, p2.y);

      // Highlight
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

  // --------------------------------------------------
  // SOMA (SPHERICAL, CLIPPED HIGHLIGHT)
  // --------------------------------------------------
  push();

  const depol = constrain(
    map(soma.Vm, soma.rest, soma.threshold, 0, 1),
    0, 1
  );

  const body = lerpColor(
    color(240, 220, 150),
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

  // Highlight (clipped inside soma)
  push();
  clip(() => {
    ellipse(0, 0, neuron.somaRadius * 2.05);
  });

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

  // --------------------------------------------------
  // AXON SHAFT (CYLINDER)
  // --------------------------------------------------
  noFill();

  stroke(210, 195, 130);
  strokeWeight(6);
  beginShape();
  vertex(neuron.somaRadius + 10, 0);
  bezierVertex(
    neuron.somaRadius + 70, 14,
    neuron.somaRadius + 120, -14,
    neuron.somaRadius + neuron.axon.length, 0
  );
  endShape();

  stroke(255, 245, 190);
  strokeWeight(2);
  beginShape();
  vertex(neuron.somaRadius + 10 + LIGHT_DIR.x, LIGHT_DIR.y);
  bezierVertex(
    neuron.somaRadius + 70 + LIGHT_DIR.x, 14 + LIGHT_DIR.y,
    neuron.somaRadius + 120 + LIGHT_DIR.x, -14 + LIGHT_DIR.y,
    neuron.somaRadius + neuron.axon.length + LIGHT_DIR.x,
    LIGHT_DIR.y
  );
  endShape();

  // --------------------------------------------------
  // AXON TERMINAL BRANCHES (STRUCTURAL ONLY)
  // --------------------------------------------------
  neuron.axon.terminalBranches.forEach(b => {

    stroke(210, 195, 130);
    strokeWeight(3);
    noFill();

    bezier(
      b.start.x, b.start.y,
      b.ctrl.x,  b.ctrl.y,
      b.ctrl.x,  b.ctrl.y,
      b.end.x,   b.end.y
    );

    // Structural bouton (always present, muted)
    push();
    noStroke();
    fill(90, 140, 110);
    ellipse(b.end.x, b.end.y, b.boutonRadius * 2);
    pop();
  });

  // --------------------------------------------------
  // DENDRITIC SYNAPTIC BOUTONS (INTERACTIVE)
  // --------------------------------------------------
  neuron.synapses.forEach(s => {
    push();
    noStroke();

    const base = s.type === "exc"
      ? color(120, 220, 140)
      : color(220, 120, 120);

    // Shadow
    fill(red(base) * 0.6, green(base) * 0.6, blue(base) * 0.6);
    ellipse(s.x + 1.5, s.y + 1.5, s.radius * 2.1);

    // Body
    fill(base);
    ellipse(s.x, s.y, s.radius * 2);

    // Highlight
    fill(255, 255, 255, 140);
    ellipse(
      s.x + LIGHT_DIR.x * 3,
      s.y + LIGHT_DIR.y * 3,
      s.radius * 0.7
    );

    // Selection ring
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
// NEURON 2 (VISUAL ONLY — NO SIGNAL YET)
// =====================================================
function drawNeuron2() {

  neuron2.dendrites.forEach(branch => {
    for (let i = 0; i < branch.length - 1; i++) {
      stroke(180);
      strokeWeight(branch[i].r * 1.4);
      line(
        branch[i].x,
        branch[i].y,
        branch[i + 1].x,
        branch[i + 1].y
      );
    }
  });

  noStroke();
  fill(180);
  ellipse(
    neuron2.soma.x,
    neuron2.soma.y,
    neuron2.somaRadius * 2
  );

  neuron2.synapses.forEach(s => {
    fill(120, 220, 140);
    ellipse(s.x, s.y, s.radius * 2);
  });
}

// =====================================================
// SYNAPSE SIZE CONTROLS
// =====================================================
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

  pop();
}
