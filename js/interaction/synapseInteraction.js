// =====================================================
// SYNAPSE INTERACTION (MOUSE + TOUCH)
// =====================================================

let activeSynapse = null;

function getWorldMouse() {
  return {
    x: (mouseX - width / 2) / camera.zoom + camera.x,
    y: (mouseY - height / 2) / camera.zoom + camera.y
  };
}

function updateSynapseHover() {
  const { x, y } = getWorldMouse();

  neuron.synapses.forEach(s => {
    const d = dist(x, y, s.x, s.y);
    s.hovered = d < s.radius + 8;
  });
}

// ---------- DESKTOP ----------
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

// ---------- MOBILE ----------
function touchStarted() {
  mousePressed();
  return false;
}

function touchMoved() {
  mouseDragged();
  return false;
}

function touchEnded() {
  mouseReleased();
  return false;
}  activeSynapse = null;
}
