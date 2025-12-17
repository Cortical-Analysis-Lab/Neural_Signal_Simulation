
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
  if (!window.neuron || !neuron.synapses) return;

  const p = getWorldPoint(mouseX, mouseY);

  // DEBUG: draw mouse world position
  push();
  stroke(0, 255, 0);
  strokeWeight(12);
  point(p.x, p.y);
  pop();

  neuron.synapses.forEach(s => {
    const d = dist(p.x, p.y, s.x, s.y);
    s.hovered = d < s.radius;
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
