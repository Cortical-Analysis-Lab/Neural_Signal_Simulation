// =====================================================
// AXON ACTION POTENTIAL → TERMINAL DEPOLARIZATION (FINAL)
// =====================================================
console.log("axonSpike loaded");

// -----------------------------------------------------
// Parameters
// -----------------------------------------------------
const AXON_CONDUCTION_SPEED = 0.035;

// Where terminal region begins (0–1 along axon)
const AXON_TERMINAL_START = 0.75;

// Terminal depolarization lifetime (frames)
const TERMINAL_LIFETIME = 25;

// -----------------------------------------------------
// Active AP wavefronts (ONE = ONE AP)
// -----------------------------------------------------
const axonSpikes = [];

// -----------------------------------------------------
// Active terminal depolarizations
// -----------------------------------------------------
const terminalDots = [];

// -----------------------------------------------------
// Spawn AP at axon hillock
// -----------------------------------------------------
function spawnAxonSpike() {

  // Prevent overlap at hillock
  if (axonSpikes.length > 0) {
    const last = axonSpikes[axonSpikes.length - 1];
    if (last.phase < 0.05) return;
  }

  axonSpikes.push({
    phase: 0
  });
}

// -----------------------------------------------------
// Update AP propagation
// -----------------------------------------------------
function updateAxonSpikes() {
  for (let i = axonSpikes.length - 1; i >= 0; i--) {
    const s = axonSpikes[i];
    s.phase += AXON_CONDUCTION_SPEED;

    // Reached terminal region → spawn terminal activity
    if (s.phase >= AXON_TERMINAL_START) {
      spawnTerminalDepolarizations();
      axonSpikes.splice(i, 1);
    }
  }
}

// -----------------------------------------------------
// Spawn terminal depolarizations (one per branch)
// -----------------------------------------------------
function spawnTerminalDepolarizations() {

  const terminals = getAxonTerminalEndpoints();

  terminals.forEach(p => {
    terminalDots.push({
      x: p.x,
      y: p.y,
      life: TERMINAL_LIFETIME
    });
  });
}

// -----------------------------------------------------
// Update terminal depolarizations
// -----------------------------------------------------
function updateTerminalDots() {
  for (let i = terminalDots.length - 1; i >= 0; i--) {
    terminalDots[i].life--;
    if (terminalDots[i].life <= 0) {
      terminalDots.splice(i, 1);
    }
  }
}

// -----------------------------------------------------
// Draw AP wavefront + terminal depolarizations
// -----------------------------------------------------
function drawAxonSpikes() {

  // ---- AP wavefront ----
  axonSpikes.forEach(s => {
    const p = getAxonPoint(s.phase);

    push();
    noStroke();
    fill(0, 255, 120);
    ellipse(p.x, p.y, 10, 10);
    pop();
  });

  // ---- Terminal depolarizations ----
  terminalDots.forEach(t => {
    const alpha = map(t.life, 0, TERMINAL_LIFETIME, 40, 180);

    push();
    noStroke();
    fill(0, 255, 120, alpha);
    ellipse(t.x, t.y, 6, 6);
    pop();
  });
}

// -----------------------------------------------------
// Axon terminal branch geometry (STATIC)
// -----------------------------------------------------
function getAxonTerminalEndpoints() {

  const base = getAxonPoint(AXON_TERMINAL_START);

  // Three terminal branches (biological but clean)
  return [
    { x: base.x + 14, y: base.y - 8 },
    { x: base.x + 18, y: base.y + 4 },
    { x: base.x + 12, y: base.y + 12 }
  ];
}
