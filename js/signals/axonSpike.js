// =====================================================
// AXON ACTION POTENTIAL → TERMINAL BRANCH PROPAGATION
// =====================================================
console.log("axonSpike loaded");

// -----------------------------------------------------
// Parameters
// -----------------------------------------------------
const AXON_CONDUCTION_SPEED = 0.035;
const TERMINAL_CONDUCTION_SPEED = 0.08;

// Where terminal region begins (0–1 along axon)
const AXON_TERMINAL_START = 0.75;

// -----------------------------------------------------
// Active axonal APs (ONE = ONE AP)
// -----------------------------------------------------
const axonSpikes = [];

// -----------------------------------------------------
// Active terminal branch APs
// -----------------------------------------------------
const terminalSpikes = [];

// -----------------------------------------------------
// Spawn AP at axon hillock
// -----------------------------------------------------
function spawnAxonSpike() {

  // Prevent overlap at hillock
  if (axonSpikes.length > 0) {
    const last = axonSpikes[axonSpikes.length - 1];
    if (last.phase < 0.08) return;
  }

  axonSpikes.push({
    phase: 0
  });
}

// -----------------------------------------------------
// Update axon AP propagation
// -----------------------------------------------------
function updateAxonSpikes() {
  for (let i = axonSpikes.length - 1; i >= 0; i--) {
    const s = axonSpikes[i];
    s.phase += AXON_CONDUCTION_SPEED;

    // Enter terminal arbor → split AP
    if (s.phase >= AXON_TERMINAL_START) {
      spawnTerminalSpikes();
      axonSpikes.splice(i, 1);
    }
  }
}

// -----------------------------------------------------
// Spawn AP fragments into terminal branches
// -----------------------------------------------------
function spawnTerminalSpikes() {

  neuron.axon.terminalBranches.forEach(branch => {
    terminalSpikes.push({
      branch,
      t: 0     // progress along branch (0 → 1)
    });
  });
}

// -----------------------------------------------------
// Update terminal branch AP propagation
// -----------------------------------------------------
function updateTerminalDots() {
  for (let i = terminalSpikes.length - 1; i >= 0; i--) {
    terminalSpikes[i].t += TERMINAL_CONDUCTION_SPEED;

    // Reached bouton
    if (terminalSpikes[i].t >= 1) {
      terminalSpikes.splice(i, 1);

      // 🔮 FUTURE HOOK:
      // release neurotransmitter here
    }
  }
}

// -----------------------------------------------------
// Draw axon + terminal APs
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

  // ---- Terminal branch APs ----
  terminalSpikes.forEach(ts => {
    const b = ts.branch;

    // Quadratic Bézier along branch
    const x = bezierPoint(
      b.start.x,
      b.ctrl.x,
      b.end.x,
      ts.t
    );

    const y = bezierPoint(
      b.start.y,
      b.ctrl.y,
      b.end.y,
      ts.t
    );

    push();
    noStroke();
    fill(0, 255, 120);
    ellipse(x, y, 6, 6);
    pop();
  });
}
