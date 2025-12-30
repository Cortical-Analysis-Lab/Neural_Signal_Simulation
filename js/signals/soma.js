// =====================================================
// SOMA MEMBRANE POTENTIAL + ACTION POTENTIAL MODEL
// =====================================================
console.log("soma loaded");

// -----------------------------------------------------
// Na⁺ → AP timing (TEACHING KNOBS)
// -----------------------------------------------------
const AP_DELAY_FRAMES = 6;   // 🔥 frames between soma Na⁺ influx and AP upstroke

// -----------------------------------------------------
// Action potential phases
// -----------------------------------------------------
const AP = {
  NONE: 0,
  NA_COMMIT: 0.5,   // soma Na⁺ influx, AIS priming
  UPSTROKE: 1,
  PEAK: 2,
  REPOLARIZE: 3,
  AHP: 4
};

// -----------------------------------------------------
// Tunable AP parameters (biophysically inspired)
// -----------------------------------------------------
const AP_PARAMS = {
  upstrokeRate: 7.5,     // fast Na+ influx
  peakHold: 2,           // frames at peak
  repolRate: 5.0,        // K+ efflux
  ahpTarget: -78,        // after-hyperpolarization
  ahpRate: 1.2,
  refractoryFrames: 25
};

// -----------------------------------------------------
// Soma state
// -----------------------------------------------------
const soma = {
  Vm: -65,            // TRUE membrane potential
  VmDisplay: -65,     // visual smoothing only
  rest: -65,
  threshold: -50,

  apState: AP.NONE,
  apTimer: 0,
  refractory: 0
};

// -----------------------------------------------------
// Invisible pre-AP front (driver for Na⁺ wave)
// -----------------------------------------------------
window.preAxonAPPhase = null;
window.apDelayCounter = 0;

// -----------------------------------------------------
// PSP arrival at soma (EPSP / IPSP)
// -----------------------------------------------------
function addEPSPToSoma(amplitude, type, sourceNeuron = 1) {

  // 🚫 Ignore IPSPs originating from neuron 3
  if (type !== "exc" && sourceNeuron === 3) return;

  const normalized = constrain((amplitude - 6) / 24, 0, 1);
  let deltaV;

  if (type === "exc") {
    deltaV = 3 + 28 * normalized * normalized;
    if (normalized > 0.9) deltaV += 10; // driver synapse
  } else {
    deltaV = -(4 + 20 * normalized);
  }

  soma.Vm += deltaV;
}

// -----------------------------------------------------
// Soma update (physiology-first)
// -----------------------------------------------------
function updateSoma() {

  switch (soma.apState) {

    // =================================================
    // SUBTHRESHOLD DYNAMICS
    // =================================================
    case AP.NONE:

      if (soma.refractory > 0) {
        soma.refractory--;
        soma.Vm = lerp(soma.Vm, soma.rest, 0.2);
      }

      else if (soma.Vm >= soma.threshold) {
        soma.apState = AP.NA_COMMIT;

        // 🟡 Soma Na⁺ influx (visual + conceptual)
        triggerNaInfluxNeuron1();

        // Reset Na⁺ wave + invisible AP
        window.naWaveStarted    = false;
        window.preAxonAPPhase   = null;
        window.apDelayCounter   = 0;
      }

      else {
        soma.Vm = lerp(soma.Vm, soma.rest, 0.05);
      }
      break;

    // =================================================
    // Na⁺ COMMIT (SOMA → AIS PRIMING)
    // =================================================
    case AP.NA_COMMIT:

    soma.Vm += AP_PARAMS.upstrokeRate * 0.6;
  
    // Start invisible pre-AP front ONCE
    if (window.preAxonAPPhase === null) {
      window.preAxonAPPhase = 0;
    }
  
    // Trigger Na⁺ wave once from AIS
    if (!window.naWaveStarted) {
      triggerAxonNaWave();
      window.naWaveStarted = true;
    }
  
    window.apDelayCounter++;
  
    if (window.apDelayCounter >= AP_DELAY_FRAMES) {
      soma.apState = AP.UPSTROKE;
    }
    break;


    // =================================================
    // FAST DEPOLARIZATION (VISIBLE AP)
    // =================================================
    case AP.UPSTROKE:
      soma.Vm += AP_PARAMS.upstrokeRate;

      if (soma.Vm >= 40) {
        soma.Vm = 40;
        soma.apState = AP.PEAK;
        soma.apTimer = AP_PARAMS.peakHold;

        // 🔑 Metabolic signal
        window.neuron1Fired = true;
        window.lastNeuron1SpikeTime = state.time;

        // 🔔 Log once
        if (typeof logEvent === "function") {
          logEvent(
            "neural",
            "Action potential generated at the soma",
            "soma"
          );
        }

        spawnAxonSpike();
        console.log("⚡ ACTION POTENTIAL");
      }
      break;

    // =================================================
    // PEAK (Na⁺ inactivation)
    // =================================================
    case AP.PEAK:
      soma.apTimer--;
      if (soma.apTimer <= 0) soma.apState = AP.REPOLARIZE;
      break;

    // =================================================
    // REPOLARIZATION (K⁺ efflux)
    // =================================================
    case AP.REPOLARIZE:
      soma.Vm -= AP_PARAMS.repolRate;
      if (soma.Vm <= soma.rest) soma.apState = AP.AHP;
      break;

    // =================================================
    // AFTER-HYPERPOLARIZATION
    // =================================================
    case AP.AHP:
      soma.Vm = lerp(soma.Vm, AP_PARAMS.ahpTarget, 0.15);

      if (abs(soma.Vm - AP_PARAMS.ahpTarget) < 0.5) {
        soma.apState = AP.NONE;
        soma.refractory = AP_PARAMS.refractoryFrames;

        // Cleanup invisible AP
        window.preAxonAPPhase = null;
      }
      break;
  }

  // ===================================================
  // DISPLAY smoothing ONLY (trace-friendly)
  // ===================================================
  soma.VmDisplay = lerp(soma.VmDisplay, soma.Vm, 0.25);
}
