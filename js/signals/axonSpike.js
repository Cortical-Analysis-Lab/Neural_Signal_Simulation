// =====================================================
// AXON ACTION POTENTIAL → TERMINAL BRANCH PROPAGATION
// =====================================================
console.log("axonSpike loaded");

// -----------------------------------------------------
// Parameters
// -----------------------------------------------------
const AXON_CONDUCTION_SPEED = 0.035;
const TERMINAL_CONDUCTION_SPEED = 0.06;
const TERMINAL_GLOW_LIFETIME = 18;
const AXON_TERMINAL_START = 0.75;

// -----------------------------------------------------
// Active axonal APs
// -----------------------------------------------------
const axonSpikes = [];

// -----------------------------------------------------
// Active terminal branch APs
// -----------------------------------------------------
const terminalSpikes = [];

// -----------------------------------------------------
// Bouton glow states
// -----------------------------------------------------
const terminalGlows = [];

// -----------------------------------------------------
// Spawn AP at axon hillock
// -----------------------------------------------------
function spawnAxonSpike() {

  if (axonSpikes.length > 0) {
    const last = axonSpikes[axonSpikes.length - 1];
    if (last.phase < 0.1) return;
  }

  axonSpikes.push({ phase: 0 });
}

// -----------------------------------------------------
// Update axon AP propagation
// -----------------------------------------------------
function updateAxonSpikes() {
  for (let i = axonSpikes.length - 1; i >= 0; i--) {
    const s = axonSpikes[i];
    s.phase += AXON_CONDUCTION_SPEED;

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
      t: 0
    });
  });
}

// -----------------------------------------------------
// Update terminal branch AP propagation
// -----------------------------------------------------
function updateTerminalDots() {

  // ---- Branch APs ----
  for (let i = terminalSpikes.length - 1; i >= 0; i--) {
    const ts = terminalSpikes[i];
    ts.t += TERMINAL_CONDUCTION_SPEED;

    if (ts.t >= 1) {
      // Trigger bouton glow
      terminalGlows.push({
        x: ts.branch.end.x,
        y: ts.branch.end.y,
        life: TERMINAL_GLOW_LIFETIME
      });

      terminalSpikes.splice(i, 1);
    }
  }

  // ---- Bouton glows ----
  for (let i = terminalGlows.length - 1; i >= 0; i--) {
    terminalGlows[i].life--;
    if (terminalGlows[i].life <= 0) {
      terminalGlows.splice(i, 1);
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

  // ---- Terminal branch APs (SMALLER DOTS) ----
  terminalSpikes.forEach(ts => {
    const b = ts.branch;

    const x = bezierPoint(
      b.start.x,
      b.ctrl.x,
      b.ctrl.x,
      b.end.x,
      ts.t
    );

    const y = bezierPoint(
      b.start.y,
      b.ctrl.y,
      b.ctrl.y,
      b.end.y,
      ts.t
    );

    push();
    noStroke();
    fill(0, 255, 120);
    ellipse(x, y, 5, 5);
    pop();
  });

  // ---- Bouton glow ----
  terminalGlows.forEach(g => {
    const a = map(g.life, 0, TERMINAL_GLOW_LIFETIME, 40, 160);
    push();
    noStroke();
    fill(120, 255, 180, a);
    ellipse(g.x, g.y, 10, 10);
    pop();
  });
}
