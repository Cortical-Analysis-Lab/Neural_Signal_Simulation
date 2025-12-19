// =====================================================
// AXON ACTION POTENTIAL PROPAGATION
// SINGLE WAVEFRONT + DISTAL BRANCHING (FINAL)
// =====================================================
console.log("axonSpike loaded");

// -----------------------------------------------------
// Parameters
// -----------------------------------------------------
const AXON_CONDUCTION_SPEED = 0.035;

// Location along trunk where branching occurs (0–1)
const AXON_BRANCH_POINT = 0.55;

// Active action potentials (each = ONE wavefront)
const axonSpikes = [];

// -----------------------------------------------------
// Spawn spike at axon hillock
// -----------------------------------------------------
function spawnAxonSpike() {

  // Prevent visual overlap at hillock
  if (axonSpikes.length > 0) {
    const last = axonSpikes[axonSpikes.length - 1];
    if (last.phase < 0.05) return;
  }

  axonSpikes.push({
    phase: 0,        // global propagation phase (0 → 1)
    delivered: false
  });
}

// -----------------------------------------------------
// Update spike propagation
// -----------------------------------------------------
function updateAxonSpikes() {
  for (let i = axonSpikes.length - 1; i >= 0; i--) {
    const s = axonSpikes[i];

    s.phase += AXON_CONDUCTION_SPEED;

    // Terminal arrival → notify ONCE
    if (s.phase >= 1 && !s.delivered) {
      s.delivered = true;
      notifyAxonTerminalArrival();
    }

    // Remove after fully past terminals
    if (s.phase > 1.15) {
      axonSpikes.splice(i, 1);
    }
  }
}

// -----------------------------------------------------
// Draw spikes — SINGLE wavefront, projected geometrically
// -----------------------------------------------------
function drawAxonSpikes() {
  axonSpikes.forEach(s => {

    // -------------------------------------------------
    // BEFORE BRANCH: draw ONLY on axon trunk
    // -------------------------------------------------
    if (s.phase < AXON_BRANCH_POINT) {
      const p = getAxonPoint(s.phase);

      push();
      noStroke();
      fill(0, 255, 120);
      ellipse(p.x, p.y, 10, 10);
      pop();

      return;
    }

    // -------------------------------------------------
    // AFTER BRANCH: SAME wavefront projected onto branches
    // -------------------------------------------------

    // Normalize phase AFTER branch
    const branchPhase = map(
      s.phase,
      AXON_BRANCH_POINT,
      1,
      0,
      1,
      true
    );

    // ---- Main axon continuation ----
    const pMain = getAxonPoint(
      lerp(AXON_BRANCH_POINT, 1, branchPhase)
    );

    push();
    noStroke();
    fill(0, 255, 120);
    ellipse(pMain.x, pMain.y, 9, 9);
    pop();

    // ---- Branch to neuron 2 (projection of SAME wavefront) ----
    const pN2 = getAxonBranchToNeuron2(branchPhase);

    push();
    noStroke();
    fill(0, 255, 120);
    ellipse(pN2.x, pN2.y, 9, 9);
    pop();
  });
}

// -----------------------------------------------------
// Geometry: branch toward neuron 2 soma field
// -----------------------------------------------------
function getAxonBranchToNeuron2(t) {

  // Branch origin = trunk at branch point
  const origin = getAxonPoint(AXON_BRANCH_POINT);

  const x0 = origin.x;
  const y0 = origin.y;

  // Stable anatomical target
  const tx = neuron2.soma.x;
  const ty = neuron2.soma.y;

  // Smooth biological curvature
  const cx1 = lerp(x0, tx, 0.4);
  const cy1 = y0 - 40;

  const cx2 = lerp(x0, tx, 0.7);
  const cy2 = ty + 30;

  return {
    x: bezierPoint(x0, cx1, cx2, tx, t),
    y: bezierPoint(y0, cy1, cy2, ty, t)
  };
}

// -----------------------------------------------------
// Terminal arrival hook (wired externally)
// -----------------------------------------------------
let axonTerminalCallback = null;

function onAxonTerminalArrival(cb) {
  axonTerminalCallback = cb;
}

function notifyAxonTerminalArrival() {
  if (axonTerminalCallback) {
    axonTerminalCallback();
  }
}
