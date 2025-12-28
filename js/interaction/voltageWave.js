console.log("⚡ voltageWave interaction loaded");

// =====================================================
// GLOBAL AP STATE (EXPLICIT & SAFE)
// =====================================================
window.apActive   = false;
window.apPhase    = 0;
window.apSpeed    = 0.015;
window.apDuration = 1.2;
window.apTimer    = 0;

// Optional user-captured path (fallback)
window.apPath = window.apPath || [];

// =====================================================
// KEYBOARD TRIGGER — SPACEBAR STARTS AP
// =====================================================
window.addEventListener("keydown", (e) => {

  if (e.code !== "Space") return;

  // Prevent retrigger while active
  if (window.apActive) return;

  // Optional: only allow in synapse view
  if (typeof state !== "undefined" && state.mode !== "synapse") return;

  window.apActive = true;
  window.apPhase  = 0;
  window.apTimer  = 0;

  console.log("⚡ Presynaptic AP triggered");
});

// =====================================================
// UPDATE — ADVANCE AP PHASE (CALLED FROM SynapseView)
// =====================================================
function updateVoltageWave() {
  if (!window.apActive) return;

  window.apPhase += window.apSpeed;
  window.apTimer += window.apSpeed;

  // Clamp phase (no wraparound)
  if (window.apPhase > 1) window.apPhase = 1;

  // End AP after duration
  if (window.apTimer >= window.apDuration) {
    window.apActive = false;
    window.apPhase  = 0;
    window.apTimer  = 0;
  }
}

// =====================================================
// DRAW TRAVELING MEMBRANE WAVES (BIDIRECTIONAL, NO LOOP)
// =====================================================
function drawVoltageWave(path, {
  side = 1,
  length = 0.18,
  thickness = 6,
  offset = 4
} = {}) {

  const activePath = path ?? window.apPath;

  if (
    !window.apActive ||
    !activePath ||
    activePath.length < 2
  ) return;

  push();
  noFill();
  blendMode(ADD);

  const total = activePath.length;
  const halfIndex = Math.floor(total / 2);

  // ---------------------------------------------------
  // PHASE → INDEX (NO WRAP, BIDIRECTIONAL)
  // ---------------------------------------------------
  const forwardHead  = Math.floor(window.apPhase * halfIndex);
  const backwardHead = total - 1 - forwardHead;

  const span = Math.max(2, Math.floor(length * total));

  // ---------------------------------------------------
  // HELPER: DRAW ONE DIRECTIONAL WAVE
  // ---------------------------------------------------
  function drawWave(headIndex, direction) {
    for (let i = 0; i < span; i++) {

      const idx = headIndex + i * direction;
      const nextIdx = idx + direction;

      // Stop at midpoint or bounds
      if (
        idx < 0 ||
        nextIdx < 0 ||
        idx >= total - 1 ||
        nextIdx >= total - 1 ||
        (direction === 1 && idx > halfIndex) ||
        (direction === -1 && idx < halfIndex)
      ) return;

      const p1 = activePath[idx];
      const p2 = activePath[nextIdx];

      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const mag = Math.hypot(dx, dy) || 1;

      const nx = -dy / mag;
      const ny =  dx / mag;

      // Fade toward midpoint
      const fade = map(
        Math.abs(idx - halfIndex),
        halfIndex, 0,
        40, 220,
        true
      );

      const alpha = Math.max(40, fade);

      const x1 = p1.x + nx * offset * side;
      const y1 = p1.y + ny * offset * side;
      const x2 = p2.x + nx * offset * side;
      const y2 = p2.y + ny * offset * side;

      // Halo
      stroke(80, 255, 120, alpha * 0.35);
      strokeWeight(thickness + 6);
      line(x1, y1, x2, y2);

      // Core
      stroke(120, 255, 160, alpha);
      strokeWeight(thickness);
      line(x1, y1, x2, y2);
    }
  }

  // ---------------------------------------------------
  // DRAW BOTH DIRECTIONS
  // ---------------------------------------------------
  drawWave(forwardHead,  +1); // shaft → cap
  drawWave(backwardHead, -1); // cap → shaft

  blendMode(BLEND);
  pop();
}
