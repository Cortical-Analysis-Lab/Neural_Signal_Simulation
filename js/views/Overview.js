function drawOverview(state) {
  drawNeuron();
  updateSynapseHover();
  updateEPSPs();
  drawEPSPs();
}
function drawNeuron() {
  // Soma
  push();
  noStroke();
  fill(180);
  ellipse(0, 0, neuron.somaRadius * 2);
  pop();

  // Dendrites
  stroke(150);
  strokeWeight(4);
  neuron.dendrites.forEach(d => {
    const end = polarToCartesian(d.angle, d.length);
    line(0, 0, end.x, end.y);
  });

  // Synaptic boutons (DEBUG)
neuron.synapses.forEach(s => {
  push();
  noStroke();
  fill(s.hovered ? color(255, 0, 0) : color(200));
  ellipse(s.x, s.y, s.radius * 2);
  pop();
});
}
