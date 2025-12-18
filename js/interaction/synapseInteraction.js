// =====================================================
// SYNAPSE INTERACTION (ROBUST HOVER + +/- CONTROLS)
// =====================================================
console.log("interaction loaded");

// -----------------------------------------------------
// CONFIG — adjust safely here
// -----------------------------------------------------
const SYNAPSE_HIT_PAD     = 22;  // invisible hover padding
const CONTROL_HIT_RADIUS = 20;  // + / − click radius

// Shared interaction state (hoisted safely)
var hoverLock = null;

// -----------------------------------------------------
// Convert screen → neuron world coordinates
// -----------------------------------------------------
function getWorldPoint(x, y) {
  if (!canvas) return { x: 0, y: 0 };

  const rect = canvas.elt.getBoundingClientRect();

  // Screen → canvas
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
// Hover detection (stable + forgiving)
// -----------------------------------------------------
function updateSynapseHover() {
  if (!neuron || !neuron.synapses) return;

  const p = getWorldPoint(mouseX, mouseY);
  hoverLock = null;

  neuron.synapses.forEach(s => {
    const hitRadius = s.radius + SYNAPSE_HIT_PAD;
    const d = dist(p.x, p.y, s.x, s.y);

    if (d < hitRadius) hoverLock = s;
  });

  neuron.synapses.forEach(s => {
    s.hovered = (hoverLock === s);
  });
}

// -----------------------------------------------------
// Mouse press — resize or spawn EPSP
// -----------------------------------------------------
function mousePressed() {
  if (!neuron || !neuron.synapses) return;

  const p = getWorldPoint(mouseX, mouseY);

  neuron.synapses.forEach(s => {
    if (!s.hovered) return;

    // + button (above synapse)
    const plusY = s.y - s.radius - 18;
    if (dist(p.x, p.y, s.x, plusY) < CONTROL_HIT_RADIUS) {
      s.radius = constrain(s.radius + 2, 6, 30);
      return;
    }

    // − button (below synapse)
    const minusY = s.y + s.radius + 18;
    if (dist(p.x, p.y, s.x, minusY) < CONTROL_HIT_RADIUS) {
      s.radius = constrain(s.radius - 2, 6, 30);
      return;
    }

    // Synapse body → EPSP
    if (dist(p.x, p.y, s.x, s.y) < s.radius + 6) {
      spawnEPSP(s);
    }
  });
}

// -----------------------------------------------------
// Mouse release — clear hover lock
// -----------------------------------------------------
function mouseReleased() {
  hoverLock = null;
}
