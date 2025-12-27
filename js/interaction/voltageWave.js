console.log("⚡ voltageWave interaction loaded");

// =====================================================
// ACTION POTENTIAL STATE (GLOBAL, SAFE)
// =====================================================
let apActive   = false;
let apPhase    = 0;
let apSpeed    = 0.015;
let apDuration = 1.2;
let apTimer    = 0;

// =====================================================
// USER-DEFINED CONDUCTION PATH (DEBUG → HARD-CODE LATER)
// =====================================================
window.apPath = [];
window.captureAPPath = false;

// -----------------------------------------------------
// TOGGLE PATH CAPTURE MODE (press "P")
// -----------------------------------------------------
window.addEventListener("keydown", (e) => {

  // Start AP
  if (e.code === "Space" && !apActive) {
    apActive = true;
    apPhase  = 0;
    apTimer  = 0;
  }

  // Toggle capture mode
  if (e.key === "p") {
    captureAPPath = !captureAPPath;
    console.log(`🟢 AP path capture ${captureAPPath ? "ON" : "OFF"}`);
    if (captureAPPath) {
      window.apPath = [];
      console.log("📍 Click to define AP conduction path…");
    }
  }
});

// -----------------------------------------------------
// CLICK TO ADD PATH POINTS (WORLD → LOCAL SPACE)
// -----------------------------------------------------
function mousePressed() {
  if (!captureAPPath) return;

  // Convert screen → world → synapse-local
  const wx = (mouseX - width / 2) / camera.zoom + camera.x;
  const wy = (mouseY - height / 2) / camera.zoom + camera.y;

  window.apPath.push({ x: wx, y: wy });

  console.log(
    `📌 Point ${window.apPath.length}: { x: ${wx.toFixed(1)}, y: ${wy.toFixed(1)} }`
  );
}

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
// DRAW TRAVELING MEMBRANE WAVE (DIRECTED PATH)
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

  // Opposite membrane sides start opposite
  const phaseOffset = side === 1 ? 0.0 : 0.5;
  const start = Math.floor(((apPhase + phaseOffset) % 1) * total);
  const span  = Math.max(2, Math.floor(length * total));

  for (let i = 0; i < span; i++) {

    const idx = Math.min(start + i, total - 2);
    const p1 = activePath[idx];
    const p2 = activePath[idx + 1];

    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const mag = Math.hypot(dx, dy) || 1;

    const nx = -dy / mag;
    const ny =  dx / mag;

    const alpha = Math.max(90, map(i, 0, span, 220, 60));

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

  blendMode(BLEND);
  pop();
}
