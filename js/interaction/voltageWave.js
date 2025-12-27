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
  if (!apActive || !activePath || activePath.length < 2) return;

  push();
  noFill();
  blendMode(ADD);

  const total = activePath.length;
  const halfIndex = Math.floor(total / 2);

  // ---------------------------------------------------
  // PHASE → INDEX MAPPING (NO WRAP)
  // ---------------------------------------------------
  const forwardHead  = Math.floor(apPhase * halfIndex);
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

      // Fade as we approach midpoint
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
