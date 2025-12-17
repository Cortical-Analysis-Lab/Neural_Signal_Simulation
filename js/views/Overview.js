// =====================================================
// OVERVIEW VIEW — NEURON + SYNAPSES + SOMA SUMMATION
// =====================================================

function drawOverview(state) {
  drawNeuron();
  updateSynapseHover();
  updateEPSPs();
  updateSoma();
  drawEPSPs();
}

// -----------------------------------------------------
// Draw neuron geometry and soma membrane potential
// -----------------------------------------------------
function drawNeuron() {

  // =====================
  // Soma (membrane potential visualization)
  // =====================
  push();
  noStroke();

  const t = constrain(
    map(soma.Vm, soma.rest, soma.threshold, 0, 1),
    0,
    1
  );

  const somaColor = lerpColor(
    color(80, 80, 120),
    color(80, 150, 255),
    t
  );

  fill(somaColor);

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
  // Synaptic boutons + controls
  // =====================
  neuron.synapses.forEach(s => {
    push();

    // Bouton
    noStroke();
    fill(s.hovered ? color(255, 0, 0) : color(200));
    ellipse(s.x, s.y, s.radius * 2);

    if (s.hovered) {
      // Plus / Minus controls
      fill(240);
      textAlign(CENTER, CENTER);
      textSize(20);

      const bx = s.x + s.radius + 18;

      text("+", bx, s.y - 16);
      text("−", bx, s.y + 16);

      // Size limit labels
      textSize(10);
      fill(180);

      if (s.radius <= 6) {
        text("Minimum size", s.x, s.y + s.radius + 16);
      }
      if (s.radius >= 30) {
        text("Maximum size", s.x, s.y + s.radius + 16);
      }
    }

    pop();
  });

  // =====================
  // Vm readout
  // =====================
  push();
  fill(220);
  textSize(12);
  textAlign(CENTER, TOP);
  text(`${soma.Vm.toFixed(1)} mV`, 0, neuron.somaRadius + 12);
  pop();
}
