// =====================================================
// SYNAPSE INTERACTION (RESIZE + ACTIVATE)
// =====================================================

let activeSynapse = null;

function updateSynapseHover() {
  const mx = (mouseX - width / 2) / camera.zoom + camera.x;
  const my = (mouseY - height / 2) / camera.zoom + camera.y;

  neuron.synapses.forEach(s => {
    const d = dist(mx, my, s.x, s.y);
    s.hovered = d < s.radius + 6;
  });
}

function mousePressed() {
  neuron.synapses.forEach(s => {
    if (s.hovered) {
      activeSynapse = s;
      spawnEPSP(s);
    }
  });
}

function mouseDragged() {
  if (activeSynapse) {
    activeSynapse.radius = constrain(
      activeSynapse.radius + movedY * -0.1,
      6,
      30
    );
  }
}

function mouseReleased() {
  activeSynapse = null;
}
