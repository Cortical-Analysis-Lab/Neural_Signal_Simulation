// =====================================================
// SYNAPSE INTERACTION — CLICK-BASED SIZE CONTROL
// =====================================================

const SIZE_STEP = 2;
const MIN_RADIUS = 6;
const MAX_RADIUS = 30;

// Convert screen → world coordinates (camera aware)
function getWorldPoint(x, y) {
  const rect = canvas.elt.getBoundingClientRect();
  const cx = x - rect.left;
  const cy = y - rect.top;

  return {
    x: (cx - width / 2) / camera.zoom + camera.x,
    y: (cy - height / 2) / camera.zoom + camera.y
  };
}

// Hover detection
function updateSynapseHover() {
  if (!neuron || !neuron.synapses) return;

  const p = getWorldPoint(mouseX, mouseY);

  neuron.synapses.forEach(s => {
    const hitRadius = s.radius + 8;
    const d = dist(p.x, p.y, s.x, s.y);
    s.hovered = d < hitRadius;
  });
}

// Mouse click handling
function mousePressed() {
  const p = getWorldPoint(mouseX, mouseY);

  neuron.synapses.forEach(s => {
    if (!s.hovered) return;

    // Button positions
    const bx = s.x + s.radius + 12;
    const plusPos = { x: bx, y: s.y - 10 };
    const minusPos = { x: bx, y: s.y + 10 };

    // PLUS button
    if (dist(p.x, p.y, plusPos.x, plusPos.y) < 8) {
      s.radius = min(s.radius + SIZE_STEP, MAX_RADIUS);
      return;
    }

    // MINUS button
    if (dist(p.x, p.y, minusPos.x, minusPos.y) < 8) {
      s.radius = max(s.radius - SIZE_STEP, MIN_RADIUS);
      return;
    }

    // Otherwise: click bouton → spawn EPSP
    spawnEPSP(s);
  });
}
