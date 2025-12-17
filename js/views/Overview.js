// =====================================================
// OVERVIEW VIEW — NEURON + EPSPs + SOMA SUMMATION
// =====================================================

function drawOverview(state) {
  drawNeuron();
  updateSynapseHover();
  updateEPSPs();
  updateSoma();
  drawEPSPs();
}

// -----------------------------------------------------
// Draw neuron geometry + soma potential visualization
// -----------------------------------------------------
function drawNeuron() {

  // =====================
  // Soma (membrane potential)
  // =====================
  push();
  noStroke();

  // Normalize Vm between rest and threshold
  const t = constrain(
    map(soma.Vm, soma.rest, soma.threshold, 0, 1),
    0,
    1
  );

  // Dark at rest → brighter blue with depolarization
  const somaColor = lerpColor(
    color(80, 80, 120),
    color(80, 150, 255),
    t
  );

  fill(somaColor);

  // Slight swelling with depolarization
  const r = neuron.somaRadius * (1 + 0.15 * t);
  ellipse(0, 0, r * 2);
  pop();

  // =====================
  // Dendrites
  // =====================
  stroke(150);
  strokeWeight(4);
  neuron.dendrites.forEach(d => {
    const end = polarToCartesian(d.angle, d.length);
    line(0, 0, end.x, end.y);
  });

  // =====================
  // Synaptic boutons
  // =====================
  neuron.synapses.forEach(s => {
    push();
    noStroke();
    fill(s.hovered ? color(255, 0, 0) : color(200));
    ellipse(s.x, s.y, s.radius * 2);
    pop();
  });

  // =====================
  // Vm readout (optional but useful)
  // =====================
  push();
  fill(220);
  textSize(12);
  textAlign(CENTER, TOP);
  text(`${soma.Vm.toFixed(1)} mV`, 0, neuron.somaRadius + 12);
  pop();
}
