let activeSynapse = null;

function getWorldPoint(x, y) {
  return {
    x: (x - width / 2) / camera.zoom + camera.x,
    y: (y - height / 2) / camera.zoom + camera.y
  };
}

function updateSynapseHover() {
  const p = getWorldPoint(mouseX, mouseY);

  neuron.synapses.forEach(s => {
    const d = dist(p.x, p.y, s.x, s.y);
    s.hovered = d < s.radius + 10;
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
      activeSynapse.radius - movedY * 0.1,
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
  mouseX = touches[0].x;
  mouseY = touches[0].y;
  mousePressed();
  return false;
}

function touchMoved() {
  mouseX = touches[0].x;
  mouseY = touches[0].y;
  mouseDragged();
  return false;
}

function touchEnded() {
  mouseReleased();
  return false;
}      6,
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
