console.log("⚡ voltageWave interaction loaded");

// =====================================================
// ACTION POTENTIAL STATE (GLOBAL, SAFE)
// =====================================================
let apActive   = false;
let apPhase    = 0;
let apSpeed    = 0.015;
let apDuration = 1.2;   // total cycles before decay
let apTimer    = 0;

// =====================================================
// KEYBOARD TRIGGER (SPACE BAR)
// =====================================================
window.addEventListener("keydown", (e) => {
  if (e.code === "Space" && !apActive) {
    apActive = true;
    apPhase  = 0;
    apTimer  = 0;
  }
});

// =====================================================
// UPDATE (CALLED FROM draw loop)
// =====================================================
function updateVoltageWave() {
  if (!apActive) return;

  apPhase += apSpeed;
  apTimer += apSpeed;

  if (apPhase > 1) apPhase -= 1;

  if (apTimer >= apDuration) {
    apActive = false;
    apPhase  = 0;
  }
}

// =====================================================
// DRAW TRAVELING MEMBRANE WAVE
// =====================================================
function drawVoltageWave(path, {
  side = 1,            // +1 or -1
  length = 0.14,       // % of perimeter
  thickness = 6,
  offset = 4
} = {}) {

  if (!apActive || !path || path.length < 2) return;

  push();
  noFill();
  blendMode(ADD);

  const total = path.length;
  const start = Math.floor(apPhase * total);
  const span  = Math.floor(length * total);

  for (let i = 0; i < span; i++) {
    const idx = (start + i) % total;
    const p1 = path[idx];
    const p2 = path[(idx + 1) % total];

    // Tangent
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const mag = Math.hypot(dx, dy) || 1;

    // Normal (membrane offset)
    const nx = -dy / mag;
    const ny =  dx / mag;

    const alpha = map(i, 0, span, 220, 30);

    stroke(80, 255, 120, alpha);
    strokeWeight(thickness);

    line(
      p1.x + nx * offset * side,
      p1.y + ny * offset * side,
      p2.x + nx * offset * side,
      p2.y + ny * offset * side
    );
  }

  blendMode(BLEND);
  pop();
}
