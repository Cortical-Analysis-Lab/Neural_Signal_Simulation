// =====================================================
// SYNAPSE INTERACTION (HOVER + SELECTION + FIRING)
// =====================================================
console.log("interaction loaded");

var hoverLock = null;

// -----------------------------------------------------
// Convert screen → world coordinates
// -----------------------------------------------------
function getWorldPoint(x, y) {
  const rect = canvas.elt.getBoundingClientRect();

  const cx = x - rect.left;
  const cy = y - rect.top;

  // Undo camera transform
  let wx = (cx - width / 2) / camera.zoom + camera.x;
  let wy = (cy - height / 2) / camera.zoom + camera.y;

  // Undo Overview scale ONLY
  wx /= OVERVIEW_SCALE;
  wy /= OVERVIEW_SCALE;

  return { x: wx, y: wy };
}


// -----------------------------------------------------
// Hover detection
// -----------------------------------------------------
function updateSynapseHover() {
  if (!neuron || !neuron.synapses) return;

  const p = getWorldPoint(mouseX, mouseY);

  neuron.synapses.forEach(s => {
    const d = dist(p.x, p.y, s.x, s.y);
    const hit = d < s.radius + 22;

    if (hit) hoverLock = s;
    s.hovered = hit || hoverLock === s;
  });
}

// -----------------------------------------------------
// Mouse pressed
// -----------------------------------------------------
function mousePressed() {
  const p = getWorldPoint(mouseX, mouseY);
  const multiSelect = keyIsDown(CONTROL) || keyIsDown(91); // Ctrl / Cmd

  neuron.synapses.forEach(s => {
    if (!s.hovered) return;

    // -----------------------------------
    // MULTI-SELECTION TOGGLE
    // -----------------------------------
    if (multiSelect) {
      s.selected = !s.selected;
      return;
    }

    // -----------------------------------
    // + / - SIZE CONTROLS
    // -----------------------------------
    const plusY = s.y - s.radius - 18;
    if (dist(p.x, p.y, s.x, plusY) < 16) {
      s.radius = constrain(s.radius + 2, 6, 30);
      return;
    }

    const minusY = s.y + s.radius + 18;
    if (dist(p.x, p.y, s.x, minusY) < 16) {
      s.radius = constrain(s.radius - 2, 6, 30);
      return;
    }

    // -----------------------------------
    // SINGLE EPSP
    // -----------------------------------
    if (dist(p.x, p.y, s.x, s.y) < s.radius) {
      spawnEPSP(s);
    }
  });
}

// -----------------------------------------------------
// Keyboard control
// -----------------------------------------------------
function keyPressed() {
  // Fire selected synapses
  if (key === ' ') {
    neuron.synapses.forEach(s => {
      if (s.selected) {
        spawnEPSP(s);
      }
    });
  }

  // Clear selection
  if (keyCode === ESCAPE) {
    neuron.synapses.forEach(s => s.selected = false);
  }
}
