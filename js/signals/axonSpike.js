// =====================================================
// AXON ACTION POTENTIAL → TERMINAL DEPOLARIZATION
// =====================================================
console.log("axonSpike loaded");

// -----------------------------------------------------
// Parameters
// -----------------------------------------------------
const AXON_CONDUCTION_SPEED = 0.035;
const AXON_TERMINAL_START  = 0.75;
const TERMINAL_LIFETIME   = 25;

// -----------------------------------------------------
// Active AP wavefronts
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

  // Prevent immediate double-firing
  if (axonSpikes.length > 0) {
    const last = axonSpikes[axonSpikes.length - 1];
    if (last.phase < 0.1) return;
  }

  axonSpikes.push({ phase: 0 });
}

// -----------------------------------------------------
// Update AP propagation
// -----------------------------------------------------
function updateAxonSpikes() {
  for (let i = axonSpikes.length - 1; i >= 0; i--) {
    const s = axonSpikes[i];
    s.phase += AXON_CONDUCTION_SPEED;

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

  neuron.axon.terminalBranches.forEach(branch => {

    // transient terminal depolarization
    terminalDots.push({
      x: branch.end.x,
      y: branch.end.y,
      life: TERMINAL_LIFETIME
    });

    // chemical synapse trigger
    if (typeof triggerSynapticRelease === "function") {
      triggerSynapticRelease({
        x: branch.end.x,
        y: branch.end.y
      });
    }
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

  // ---- Axon AP ----
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
