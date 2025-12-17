function drawOverview(state) {
  drawNeuron();
  updateSynapseHover();
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

  // Synaptic boutons
  neuron.synapses.forEach(s => {
    push();
    noStroke();
    fill(s.hovered ? 255 : 200);
    ellipse(s.x, s.y, s.radius * 2);
    pop();
  });
}
