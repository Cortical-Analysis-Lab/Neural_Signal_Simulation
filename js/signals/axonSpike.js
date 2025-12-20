// =====================================================
// AXON ACTION POTENTIAL → TERMINAL DEPOLARIZATION
// =====================================================
console.log("axonSpike loaded");

// -----------------------------------------------------
// Parameters
// -----------------------------------------------------
const AXON_CONDUCTION_SPEED = 0.035;
const AXON_TERMINAL_START   = 0.95;   // must reach true axon end
const TERMINAL_LIFETIME     = 25;

// -----------------------------------------------------
// Active axon AP wavefronts
// -----------------------------------------------------
const axonSpikes = [];

// -----------------------------------------------------
// Active terminal depolarizations (vesicle-like dots)
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

    // Reached terminal → trigger terminal depolarization
    if (s.phase >= AXON_TERMINAL_START) {
      spawnTerminalDepolarizations();
      axonSpikes.splice(i, 1);
    }
  }
}

// -----------------------------------------------------
// Spawn depolarization at each terminal branch
// -----------------------------------------------------
function spawnTerminalDepolarizations() {
  if (!neuron || !neuron.axon || !neuron.axon.terminalBranches) return;

  neuron.axon.terminalBranches.forEach(branch => {
    terminalDots.push({
      branch: branch,
      t: 0,                 // progress down branch (0 → 1)
      life: TERMINAL_LIFETIME
    });
  });
}

// -----------------------------------------------------
// Update terminal depolarizations
// -----------------------------------------------------
function updateTerminalDots() {
  for (let i = terminalDots.length - 1; i >= 0; i--) {
    const d = terminalDots[i];

    d.t += 0.06;            // propagation speed down branch
    d.life--;

    if (d.life <= 0 || d.t >= 1) {
      terminalDots.splice(i, 1);
    }
  }
}

// -----------------------------------------------------
// Draw AP + terminal depolarizations
// -----------------------------------------------------
function drawAxonSpikes() {

  // ---- Axon AP wavefront ----
  axonSpikes.forEach(s => {
    const p = getAxonPoint(s.phase);

    push();
    noStroke();
    fill(0, 255, 120);
    ellipse(p.x, p.y, 10, 10);
    pop();
  });

  // ---- Terminal depolarizations ----
  terminalDots.forEach(d => {

    const b = d.branch;
    const x = lerp(b.start.x, b.end.x, d.t);
    const y = lerp(b.start.y, b.end.y, d.t);
    const alpha = map(d.life, 0, TERMINAL_LIFETIME, 40, 180);

    push();
    noStroke();
    fill(0, 255, 120, alpha);
    ellipse(x, y, 6, 6);
    pop();
  });
}
