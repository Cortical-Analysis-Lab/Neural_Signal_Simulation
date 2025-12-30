// =====================================================
// AXON ACTION POTENTIAL → TERMINAL BRANCH PROPAGATION
// =====================================================
console.log("axonSpike loaded");

// -----------------------------------------------------
// Parameters
// -----------------------------------------------------
const AXON_CONDUCTION_SPEED     = 0.02;  // visible AP speed
const TERMINAL_CONDUCTION_SPEED = 0.06;
const TERMINAL_GLOW_LIFETIME    = 18;
const AXON_TERMINAL_START       = 0.75;

// =====================================================
// Na⁺ → AP COUPLING (TEACHING KNOBS)
// =====================================================
const PRE_AP_SPEED = window.PRE_AP_SPEED ?? 0.02;

// -----------------------------------------------------
// Invisible pre-AP state (driver ONLY)
// -----------------------------------------------------
window.preAxonAPPhase = null; // [0–1] along axon

// -----------------------------------------------------
// Ion gating (K⁺ must trail visible AP)
// -----------------------------------------------------
const AXON_K_RELEASE_INTERVAL = 0.06;

// -----------------------------------------------------
// Active visible axonal APs
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

// =====================================================
// SPAWN VISIBLE AP (CALLED FROM soma.js ONLY)
// =====================================================
function spawnAxonSpike() {

  // Prevent overlapping APs
  if (axonSpikes.length > 0) {
    const last = axonSpikes[axonSpikes.length - 1];
    if (last.phase < 0.1) return;
  }

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

  if (!state.paused && typeof logEvent === "function") {
    logEvent(
      "neural",
      "Action potential propagates down unmyelinated axon",
      "axon"
    );
  }

  axonSpikes.push({
    phase: 0,
    lastKEffluxPhase: -Infinity
  });
}

// =====================================================
// UPDATE AXON SPIKES (INVISIBLE + VISIBLE)
// =====================================================
function updateAxonSpikes() {

  window.currentAxonAPPhase = null;

  // -----------------------------------------------
  // INVISIBLE PRE-AP FRONT (Na⁺ WAVE DRIVER)
  // -----------------------------------------------
  if (window.preAxonAPPhase !== null) {

    window.preAxonAPPhase += PRE_AP_SPEED;

    if (typeof triggerAxonNaWave === "function") {
      triggerAxonNaWave();
    }

    // End invisible AP cleanly
    if (window.preAxonAPPhase >= 1 || axonSpikes.length > 0) {
      window.preAxonAPPhase = null;
    }
  }

  // -----------------------------------------------
  // VISIBLE AP PROPAGATION
  // -----------------------------------------------
  for (let i = axonSpikes.length - 1; i >= 0; i--) {

    const s = axonSpikes[i];
    s.phase += AXON_CONDUCTION_SPEED;

    window.currentAxonAPPhase = s.phase;

    // -------------------------------------------
    // K⁺ efflux (VISIBLE AP ONLY)
    // -------------------------------------------
    if (
      typeof triggerAxonKEfflux === "function" &&
      s.phase - s.lastKEffluxPhase > AXON_K_RELEASE_INTERVAL
    ) {
      triggerAxonKEfflux(s.phase);
      s.lastKEffluxPhase = s.phase;
    }

    // -------------------------------------------
    // Enter terminal region
    // -------------------------------------------
    if (s.phase >= AXON_TERMINAL_START) {

      window.currentAxonAPPhase = null;

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

// =====================================================
// SPAWN TERMINAL AP FRAGMENTS
// =====================================================
function spawnTerminalSpikes() {
  neuron.axon.terminalBranches.forEach(branch => {
    terminalSpikes.push({ branch, t: 0 });
  });
}

// =====================================================
// UPDATE TERMINAL BRANCH APS
// =====================================================
function updateTerminalDots() {

  for (let i = terminalSpikes.length - 1; i >= 0; i--) {

    const ts = terminalSpikes[i];
    ts.t += TERMINAL_CONDUCTION_SPEED;

    if (ts.t >= 1) {

      const bouton = ts.branch.end;

      // -----------------------------
      // Metabolic signaling (SAFE)
      // -----------------------------
      if (typeof logEvent === "function") {
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

// =====================================================
// DRAW AXON + TERMINALS
// =====================================================
function drawAxonSpikes() {

  // Visible axon AP
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

    const x = bezierPoint(b.start.x, b.ctrl.x, b.ctrl.x, b.end.x, ts.t);
    const y = bezierPoint(b.start.y, b.ctrl.y, b.ctrl.y, b.end.y, ts.t);

    push();
    noStroke();
    fill(getColor("ap"));
    ellipse(x, y, 5, 5);
    pop();
  });

  // Bouton glow
  terminalGlows.forEach(g => {
    const a = map(g.life, 0, TERMINAL_GLOW_LIFETIME, 40, 160);
    push();
    noStroke();
    fill(getColor("terminalBouton", a));
    ellipse(g.x, g.y, 10, 10);
    pop();
  });
}

// =====================================================
// GLOBAL EXPORTS (REQUIRED)
// =====================================================
window.updateAxonSpikes = updateAxonSpikes;
window.spawnAxonSpike  = spawnAxonSpike;
window.drawAxonSpikes  = drawAxonSpikes;
