// =====================================================
// SYNAPSE INTERACTION (HOVER + +/- CONTROLS)
// =====================================================
console.log("interaction loaded");

// Shared interaction state (must be hoisted)
var activeSynapse = null;
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

  // Undo Overview transforms
  wx /= OVERVIEW_SCALE;
  wy = (wy - NEURON_Y_OFFSET) / OVERVIEW_SCALE;

  return { x: wx, y: wy };
}

// -----------------------------------------------------
// Hover detection with lock
// -----------------------------------------------------
function updateSynapseHover() {
  if (!neuron || !neuron.synapses) return;

  const p = getWorldPoint(mouseX, mouseY);

  neuron.synapses.forEach(s => {
    const d = dist(p.x, p.y, s.x, s.y);
    const hit = d < s.radius + 20;

    if (hit) hoverLock = s;
    s.hovered = hit || hoverLock === s;
  });
}

// -----------------------------------------------------
// Mouse pressed — EPSP spawn or +/- click
// -----------------------------------------------------
function mousePressed() {
  const p = getWorldPoint(mouseX, mouseY);

  neuron.synapses.forEach(s => {
    if (!s.hovered) return;

    // + button
    const plusY = s.y - s.radius - 18;
    if (dist(p.x, p.y, s.x, plusY) < 16) {
      s.radius = constrain(s.radius + 2, 6, 30);
      return;
    }

    // - button
    const minusY = s.y + s.radius + 18;
    if (dist(p.x, p.y, s.x, minusY) < 16) {
      s.radius = constrain(s.radius - 2, 6, 30);
      return;
    }

    // Synapse body → EPSP
    if (dist(p.x, p.y, s.x, s.y) < s.radius) {
      spawnEPSP(s);
    }
  });
}

// -----------------------------------------------------
// Release clears hover lock
// -----------------------------------------------------
function mouseReleased() {
  activeSynapse = null;
  hoverLock = null;
}
