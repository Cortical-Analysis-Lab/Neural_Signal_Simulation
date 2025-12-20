// =====================================================
// OVERVIEW VIEW — BIOLOGICAL, CLEAN, POLARIZED (3D ENHANCED)
// =====================================================

// Light direction for pseudo-3D shading
const LIGHT_DIR = { x: -0.6, y: -0.8 };

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
  // DENDRITES (CYLINDRICAL SHADING)
  // =====================
  neuron.dendrites.forEach(branch => {
    for (let i = 0; i < branch.length - 1; i++) {
      const p1 = branch[i];
      const p2 = branch[i + 1];

      // Base (shadow)
      stroke(200, 185, 120);
      strokeWeight(p1.r * 1.8);
      line(p1.x, p1.y, p2.x, p2.y);

      // Highlight (light-facing)
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

  // =====================
  // SOMA (SPHERICAL SHADING)
  // =====================
  push();

  const depol = constrain(
    map(soma.Vm, soma.rest, soma.threshold, 0, 1),
    0, 1
  );

  const baseColor = lerpColor(
    color(240, 220, 150),
    color(255, 245, 200),
    depol
  );

  noStroke();

  // Outer shadow
  fill(190, 165, 90);
  ellipse(2, 3, neuron.somaRadius * 2.2);

  // Mid body
  fill(baseColor);
  ellipse(0, 0, neuron.somaRadius * 2.05);

  // Highlight
  fill(255, 255, 230, 140);
  ellipse(
    neuron.somaRadius * LIGHT_DIR.x * 0.6,
    neuron.somaRadius * LIGHT_DIR.y * 0.6,
    neuron.somaRadius * 1.1
  );

  // Vm label
  fill(60);
  textAlign(CENTER, CENTER);
  textSize(14);
  text(`${soma.Vm.toFixed(1)} mV`, 0, 2);

  pop();

  // =====================
  // AXON SHAFT (CYLINDER)
  // =====================
  noFill();

  // Base
  stroke(210, 195, 130);
  strokeWeight(6);
  beginShape();
  vertex(neuron.somaRadius + 10, 0);
  bezierVertex(
    neuron.somaRadius + 70,  14,
    neuron.somaRadius + 120, -14,
    neuron.somaRadius + neuron.axon.length, 0
  );
  endShape();

  // Highlight
  stroke(255, 245, 190);
  strokeWeight(2);
  beginShape();
  vertex(neuron.somaRadius + 10 + LIGHT_DIR.x, LIGHT_DIR.y);
  bezierVertex(
    neuron.somaRadius + 70 + LIGHT_DIR.x,  14 + LIGHT_DIR.y,
    neuron.somaRadius + 120 + LIGHT_DIR.x, -14 + LIGHT_DIR.y,
    neuron.somaRadius + neuron.axon.length + LIGHT_DIR.x,
    LIGHT_DIR.y
  );
  endShape();

  // =====================
  // AXON TERMINAL BRANCHES + OUTPUT BOUTONS
  // =====================
  neuron.axon.terminalBranches.forEach(b => {

    // Branch
    stroke(210, 195, 130);
    strokeWeight(3);
    noFill();
    bezier(
      b.start.x, b.start.y,
      b.ctrl.x,  b.ctrl.y,
      b.ctrl.x,  b.ctrl.y,
      b.end.x,   b.end.y
    );

    // Bouton (3D bulb)
    push();

    // Shadow
    noStroke();
    fill(70, 140, 90);
    ellipse(b.end.x + 1.5, b.end.y + 1.5, b.boutonRadius * 2.1);

    // Body
    fill(120, 220, 140);
    ellipse(b.end.x, b.end.y, b.boutonRadius * 2);

    // Highlight
    fill(200, 255, 220, 160);
    ellipse(
      b.end.x + LIGHT_DIR.x * 3,
      b.end.y + LIGHT_DIR.y * 3,
      b.boutonRadius * 0.8
    );

    pop();
  });

  // =====================
  // DENDRITIC SYNAPTIC BOUTONS (INTERACTIVE)
  // =====================
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
// NEURON 2 (POSTSYNAPTIC — VISUAL ONLY)
// =====================================================
function drawNeuron2() {

  neuron2.dendrites.forEach(branch => {
    for (let i = 0; i < branch.length - 1; i++) {
      const p1 = branch[i];
      const p2 = branch[i + 1];

      stroke(180);
      strokeWeight(p1.r * 1.5);
      line(p1.x, p1.y, p2.x, p2.y);
    }
  });

  push();
  noStroke();
  fill(180);
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
}    }
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
  // AXON TERMINAL BRANCHES + OUTPUT BOUTONS
  // =====================
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

    // Presynaptic OUTPUT bouton (non-interactive)
    push();
    noStroke();
    fill(120, 220, 140);
    ellipse(b.end.x, b.end.y, b.boutonRadius * 2);
    pop();
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

    // Selection ring
    if (s.selected) {
      stroke(255);
      strokeWeight(2);
      noFill();
      ellipse(s.x, s.y, s.radius * 2.6);
    }

    pop();

    if (s.hovered) {
      drawSynapseControls(s);
    }
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
