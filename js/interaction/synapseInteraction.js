
// =====================================================
// SYNAPSE INTERACTION (DESKTOP ONLY, CLEAN)
// =====================================================

let activeSynapse = null;

function getWorldPoint(x, y) {
  const rect = canvas.elt.getBoundingClientRect();

  const cx = x - rect.left;
  const cy = y - rect.top;

  return {
    x: (cx - width / 2) / camera.zoom + camera.x,
    y: (cy - height / 2) / camera.zoom + camera.y
  };
}


function updateSynapseHover() {
  if (!neuron || !neuron.synapses) return;

  const p = getWorldPoint(mouseX, mouseY);

  neuron.synapses.forEach(s => {
    // Visual radius ≈ drawn radius + perceptual buffer
    const hitRadius = s.radius + 8;
    const d = dist(p.x, p.y, s.x, s.y);
    s.hovered = d < hitRadius;
  });
}

function mousePressed() {
  console.log("mousePressed");

  neuron.synapses.forEach(s => {
    if (s.hovered) {
      console.log("Spawn EPSP from synapse", s.id);
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
