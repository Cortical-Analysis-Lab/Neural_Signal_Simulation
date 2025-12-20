// =====================================================
// AXON ACTION POTENTIAL → TERMINAL DEPOLARIZATION
// =====================================================
console.log("axonSpike loaded");

// -----------------------------------------------------
// Parameters
// -----------------------------------------------------
const AXON_CONDUCTION_SPEED = 0.035;
const AXON_TERMINAL_START   = 0.95;

// Terminal dot behavior
const TERMINAL_LIFETIME     = 30;
const TERMINAL_SPEED       = 0.035;

// -----------------------------------------------------
// Active axon AP wavefronts
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

  // Prevent overlapping APs at hillock
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

    // Reached true axon end
    if (s.phase >= AXON_TERMINAL_START) {
      spawnTerminalDepolarizations();
      axonSpikes.splice(i, 1);
    }
  }
}

// -----------------------------------------------------
// Spawn depolarization down each terminal branch
// -----------------------------------------------------
function spawnTerminalDepolarizations() {
  if (!neuron?.axon?.terminalBranches) return;

  neuron.axon.terminalBranches.forEach(branch => {
  
    const bouton = {
      x: branch.end.x,
      y: branch.end.y
    };
  
    terminalDots.push({
      branch: branch,
      t: -0.15,
      life: TERMINAL_LIFETIME
    });
  
    // 🔥 NEW: trigger synaptic release
    triggerSynapticRelease(bouton);
  });

  });
}

// -----------------------------------------------------
// Update terminal depolarizations
// -----------------------------------------------------
function updateTerminalDots() {
  for (let i = terminalDots.length - 1; i >= 0; i--) {
    const d = terminalDots[i];

    d.t += TERMINAL_SPEED;
    d.life--;

    if (d.life <= 0 || d.t >= 1.05) {
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

    const tt = constrain(d.t, 0, 1);
    const x = lerp(b.start.x, b.end.x, tt);
    const y = lerp(b.start.y, b.end.y, tt);

    const alpha = map(d.life, 0, TERMINAL_LIFETIME, 40, 180);

    push();
    noStroke();
    fill(0, 255, 120, alpha);
    ellipse(x, y, 6, 6);
    pop();
  });
}
