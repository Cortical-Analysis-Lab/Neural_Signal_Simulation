console.log("⚡ terminalAP loaded");

// =====================================================
// TERMINAL ACTION POTENTIAL (PRESYNAPTIC)
// =====================================================
// ✔ Local-space only
// ✔ Event-driven (no phase math)
// ✔ Visual + functional coupling
// ✔ Triggers vesicle fusion ONCE per AP
// =====================================================

// -----------------------------------------------------
// GLOBAL STATE (RELOAD SAFE)
// -----------------------------------------------------
window.terminalAP = window.terminalAP || {
  active: false,
  progress: 0,
  fired: false
};

// -----------------------------------------------------
// TUNING PARAMETERS
// -----------------------------------------------------
const AP_SPEED = 0.06;        // Path traversal speed
const AP_RADIUS_CORE = 10;
const AP_RADIUS_GLOW = 22;

// -----------------------------------------------------
// COLORS
// -----------------------------------------------------
const AP_CORE_COLOR = () => color(120, 255, 160);
const AP_GLOW_COLOR = () => color(120, 255, 160, 120);

// -----------------------------------------------------
// START TERMINAL AP
// -----------------------------------------------------
function triggerTerminalAP() {
  terminalAP.active = true;
  terminalAP.progress = 0;
  terminalAP.fired = false;
  window.apActive = true; // debug compatibility
}

// -----------------------------------------------------
// UPDATE AP STATE
// -----------------------------------------------------
function updateTerminalAP(path) {
  if (!terminalAP.active) return;

  terminalAP.progress += AP_SPEED;

  // Clamp
  if (terminalAP.progress >= 1) {
    terminalAP.progress = 1;
  }

  // Fire vesicle release ONCE at terminal arrival
  if (terminalAP.progress >= 0.95 && !terminalAP.fired) {
    terminalAP.fired = true;

    if (typeof triggerPresynapticRelease === "function") {
      triggerVesicleReleaseFromAP();
    }
  }

  // End AP after completion
  if (terminalAP.progress >= 1) {
    terminalAP.active = false;
    window.apActive = false;
  }
}

// -----------------------------------------------------
// DRAW AP PARTICLE ALONG PATH
// -----------------------------------------------------
function drawTerminalAP(path) {
  if (!terminalAP.active) return;

  const idx = floor(terminalAP.progress * (path.length - 1));
  const p = path[idx];

  push();
  noStroke();
  blendMode(ADD);

  // Glow
  fill(AP_GLOW_COLOR());
  circle(p.x, p.y, AP_RADIUS_GLOW);

  // Core
  fill(AP_CORE_COLOR());
  circle(p.x, p.y, AP_RADIUS_CORE);

  blendMode(BLEND);
  pop();
}
