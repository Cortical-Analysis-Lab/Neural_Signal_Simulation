// =====================================================
// AXON ACTION POTENTIAL → TERMINAL BRANCH PROPAGATION
// =====================================================
console.log("axonSpike loaded");

// -----------------------------------------------------
// Parameters
// -----------------------------------------------------
const AXON_CONDUCTION_SPEED     = 0.035;
const TERMINAL_CONDUCTION_SPEED = 0.06;
const TERMINAL_GLOW_LIFETIME    = 18;
const AXON_TERMINAL_START       = 0.75;

// 🔑 Ion gating (CRITICAL for clean K⁺ plume)
const AXON_K_RELEASE_INTERVAL   = 0.06;

// -----------------------------------------------------
// Active axonal APs (one object = one AP)
// -----------------------------------------------------
const axonSpikes = [];

// -----------------------------------------------------
// Active terminal branch AP fragments
// -----------------------------------------------------
const terminalSpikes = [];

// -----------------------------------------------------
// Bouton depolarization glows (visual only)
// -----------------------------------------------------
const terminalGlows = [];

// -----------------------------------------------------
// Spawn AP at axon hillock
// -----------------------------------------------------
function spawnAxonSpike() {

  // 🔑 Myelinated handoff
  if (window.myelinEnabled && typeof spawnMyelinAP === "function") {

    if (!state.paused && typeof logEvent === "function") {
      logEvent(
        "system",
        "Action potential enters myelinated axon (saltatory conduction)",
        "axon"
      );
    }

    spawnMyelinAP();
    return;
  }

  // Prevent overlapping APs
  if (axonSpikes.length > 0) {
    const last = axonSpikes[axonSpikes.length - 1];
    if (last.phase < 0.1) return;
  }

  if (!state.paused && typeof logEvent === "function") {
    logEvent(
      "neural",
      "Action potential propagates down unmyelinated axon",
      "axon"
    );
  }

  axonSpikes.push({
    phase: 0,
    lastKEffluxPhase: -Infinity   // 🔑 gating state
  });
}

// -----------------------------------------------------
// Update axon AP propagation (UNMYELINATED)
// -----------------------------------------------------
function updateAxonSpikes() {

  for (let i = axonSpikes.length - 1; i >= 0; i--) {

    const s = axonSpikes[i];
    s.phase += AXON_CONDUCTION_SPEED;

    // =================================================
    // 🧂 AXON ION FLUX (CORRECTED + GATED)
    // =================================================
    if (!window.myelinEnabled && neuron?.axon?.path) {

      const p1 = getAxonPoint(s.phase);
      const p2 = getAxonPoint(
        Math.min(s.phase + 0.015, 1)
      );

      // Tangent
      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const mag = Math.hypot(dx, dy) || 1;

      const tx = dx / mag;
      const ty = dy / mag;

      // 🔑 Membrane normal (perpendicular)
      const nx = -ty;
      const ny =  tx;

      // -------------------------
      // Na⁺ influx (local entry)
      // -------------------------
      if (typeof triggerAxonNaInflux === "function") {
        triggerAxonNaInflux(
          p1.x + nx * 2,
          p1.y + ny * 2
        );
      }

      // -------------------------
      // K⁺ efflux (TRAILING + GATED)
      // -------------------------
      if (
        typeof triggerAxonKEfflux === "function" &&
        s.phase - s.lastKEffluxPhase > AXON_K_RELEASE_INTERVAL
      ) {
        triggerAxonKEfflux(
          p1.x - tx * 10 + nx * 4,
          p1.y - ty * 10 + ny * 4
        );

        s.lastKEffluxPhase = s.phase;
      }
    }
    // =================================================

    // Enter terminal region
    if (s.phase >= AXON_TERMINAL_START) {

      if (!state.paused && typeof logEvent === "function") {
        logEvent(
          "neural",
          "Action potential reaches axon terminals",
          "terminal"
        );
      }

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
// Update terminal branch APs
// -----------------------------------------------------
function updateTerminalDots() {

  for (let i = terminalSpikes.length - 1; i >= 0; i--) {

    const ts = terminalSpikes[i];
    ts.t += TERMINAL_CONDUCTION_SPEED;

    if (ts.t >= 1) {

      const bouton = {
        x: ts.branch.end.x,
        y: ts.branch.end.y
      };

      // =================================================
      // 🩸 METABOLIC CONSUMPTION + SUPPLY SIGNAL
      // =================================================
      if (!state.paused && typeof logEvent === "function") {
        logEvent(
          "vascular",
          "Neural firing increases local metabolic demand",
          "neurovascular"
        );
      }

      if (typeof extractOxygenNearNeuron1 === "function") {
        extractOxygenNearNeuron1();
      }

      if (typeof extractGlucoseNearNeuron1 === "function") {
        extractGlucoseNearNeuron1();
      }

      if (typeof triggerSupplyWave === "function") {
        triggerSupplyWave(1.0);
      }
      // =================================================

      terminalGlows.push({
        x: bouton.x,
        y: bouton.y,
        life: TERMINAL_GLOW_LIFETIME
      });

      if (typeof triggerSynapticRelease === "function") {
        triggerSynapticRelease(bouton);
      }

      terminalSpikes.splice(i, 1);
    }
  }

  // Glow decay
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

  // Axon AP wavefront
  if (!window.myelinEnabled) {
    axonSpikes.forEach(s => {
      const p = getAxonPoint(s.phase);
      push();
      noStroke();
      fill(getColor("ap"));
      ellipse(p.x, p.y, 10, 10);
      pop();
    });
  }

  // Terminal AP fragments
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
    fill(getColor("ap"));
    ellipse(x, y, 5, 5);
    pop();
  });

  // Bouton depolarization glow
  terminalGlows.forEach(g => {

    const a = map(
      g.life,
      0,
      TERMINAL_GLOW_LIFETIME,
      40,
      160
    );

    push();
    noStroke();
    fill(getColor("terminalBouton", a));
    ellipse(g.x, g.y, 10, 10);
    pop();
  });
}
