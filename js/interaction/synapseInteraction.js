// =====================================================
// SYNAPSE INTERACTION
// =====================================================

function updateSynapseHover() {
  const mx = (mouseX - width / 2) / camera.zoom + camera.x;
  const my = (mouseY - height / 2) / camera.zoom + camera.y;

  neuron.synapses.forEach(s => {
    const d = dist(mx, my, s.x, s.y);
    s.hovered = d < s.radius + 4;
  });
}
