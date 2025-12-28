console.log("⚡ voltageWave interaction loaded (DEBUG DOT MODE)");

// =====================================================
// GLOBAL AP STATE (EXPLICIT & SAFE)
// =====================================================
window.apActive   = false;
window.apPhase    = 0;
window.apSpeed    = 0.04;     // faster pulse for visibility
window.apDuration = 1.2;
window.apTimer    = 0;

// =====================================================
// SPACEBAR → START AP (SYNAPSE VIEW ONLY)
// =====================================================
window.addEventListener("keydown", (e) => {

  if (e.code !== "Space") return;
  if (window.apActive) return;

  if (typeof state !== "undefined" && state.mode !== "synapse") return;

  window.apActive = true;
  window.apPhase  = 0;
  window.apTimer  = 0;

  console.log("⚡ Presynaptic AP triggered (dot debug)");
});

// =====================================================
// UPDATE — CALLED EACH FRAME (FROM SYNAPSE VIEW OR MAIN)
// =====================================================
function updateVoltageWave() {
  if (!window.apActive) return;

  window.apPhase += window.apSpeed;
  window.apTimer += window.apSpeed;

  if (window.apTimer >= window.apDuration) {
    window.apActive = false;
    window.apPhase  = 0;
    window.apTimer  = 0;
  }
}

// =====================================================
// DRAW DEBUG DOTS AT EACH PATH COORDINATE
// =====================================================
function drawVoltageWave(path) {

  if (
    !window.apActive ||
    !Array.isArray(path) ||
    path.length === 0
  ) return;

  push();
  noStroke();
  blendMode(ADD);

  // Pulsing brightness
  const pulse = 0.5 + 0.5 * sin(frameCount * 0.25);
  const alpha = lerp(80, 220, pulse);
  const radius = lerp(4, 8, pulse);

  for (let i = 0; i < path.length; i++) {
    const p = path[i];

    // Soft halo
    fill(80, 255, 120, alpha * 0.35);
    circle(p.x, p.y, radius * 3);

    // Bright core
    fill(120, 255, 160, alpha);
    circle(p.x, p.y, radius);
  }

  blendMode(BLEND);
  pop();
}
