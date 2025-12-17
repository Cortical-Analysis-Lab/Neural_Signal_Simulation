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

// -----------------------------------------------------
// Hover detection (bouton + plus/minus = ONE hover zone)
// -----------------------------------------------------
function updateSynapseHover() {
  if (!neuron || !neuron.synapses) return;

  const p = getWorldPoint(mouseX, mouseY);

  neuron.synapses.forEach(s => {
    // Bouton hit
    const boutonHit =
      dist(p.x, p.y, s.x, s.y) < s.radius + 8;

    // Plus / Minus button positions
    const bx = s.x + s.radius + 18;

    const plusHit =
      dist(p.x, p.y, bx, s.y - 16) < 14;

    const minusHit =
      dist(p.x, p.y, bx, s.y + 16) < 14;

    // Hover if ANY part is hit
    s.hovered = boutonHit || plusHit || minusHit;
  });
}

// -----------------------------------------------------
// Mouse click handling
// -----------------------------------------------------
function mousePressed() {
  const p = getWorldPoint(mouseX, mouseY);

  neuron.synapses.forEach(s => {
    if (!s.hovered) return;

    const bx = s.x + s.radius + 18;
    const plusPos = { x: bx, y: s.y - 16 };
    const minusPos = { x: bx, y: s.y + 16 };

    // PLUS button
    if (dist(p.x, p.y, plusPos.x, plusPos.y) < 14) {
      s.radius = min(s.radius + SIZE_STEP, MAX_RADIUS);
      return;
    }

    // MINUS button
    if (dist(p.x, p.y, minusPos.x, minusPos.y) < 14) {
      s.radius = max(s.radius - SIZE_STEP, MIN_RADIUS);
      return;
    }

    // Otherwise: clicking the bouton itself → EPSP
    spawnEPSP(s);
  });
}
