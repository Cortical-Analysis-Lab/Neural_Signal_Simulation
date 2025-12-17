
// =====================================================
// SYNAPSE INTERACTION (DESKTOP ONLY, CLEAN)
// =====================================================

let activeSynapse = null;

function getWorldPoint(x, y) {
  return {
    x: (x - width / 2) / camera.zoom + camera.x,
    y: (y - height / 2) / camera.zoom + camera.y
  };
}

function updateSynapseHover() {
  if (!window.neuron || !neuron.synapses) return;
  console.log("hover check");

  const p = getWorldPoint(mouseX, mouseY);

  neuron.synapses.forEach(s => {
    const d = dist(p.x, p.y, s.x, s.y);
    s.hovered = d < s.radius + 10;
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
      activeSynapse.radius - movedY * 0.1,
      6,
      30
    );
  }
}

function mouseReleased() {
  activeSynapse = null;
}
