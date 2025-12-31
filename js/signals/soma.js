// =====================================================
// SOMA MEMBRANE POTENTIAL + ACTION POTENTIAL MODEL
// =====================================================
console.log("🧠 soma loaded");

// -----------------------------------------------------
// 🧠 TEACHING / TIMING KNOBS
// -----------------------------------------------------

const AP_DELAY_FRAMES = 18;
const INVISIBLE_AP_OFFSET = 14; // < AP_DELAY_FRAMES

// -----------------------------------------------------
// ACTION POTENTIAL PHASES
// -----------------------------------------------------
const AP = {
  NONE: 0,
  NA_COMMIT: 0.5,
  UPSTROKE: 1,
  PEAK: 2,
  REPOLARIZE: 3,
  AHP: 4
};

// -----------------------------------------------------
// BIOPHYSICALLY INSPIRED PARAMETERS
// -----------------------------------------------------
const AP_PARAMS = {
  upstrokeTau: 0.35,        // Na⁺ activation steepness
  peakHold: 6,              // rounded peak duration
  repolTau: 0.18,           // K⁺-dominated decay
  ahpTarget: -78,
  ahpTau: 0.06,             // slower Na⁺/K⁺ recovery
  refractoryFrames: 32      // longer recovery window
};

// -----------------------------------------------------
// SOMA STATE
// -----------------------------------------------------
const soma = {
  Vm: -65,
  VmDisplay: -65,
  rest: -65,
  threshold: -50,

  apState: AP.NONE,
  apTimer: 0,
  refractory: 0,

  delayCounter: 0,
  invisibleAPFired: false,
  visibleAPReleased: false
};

// -----------------------------------------------------
// PSP ARRIVAL AT SOMA
// -----------------------------------------------------
function addEPSPToSoma(amplitude, type, sourceNeuron = 1) {

  if (type !== "exc" && sourceNeuron === 3) return;

  const normalized = constrain((amplitude - 6) / 24, 0, 1);
  let deltaV;

  if (type === "exc") {
    deltaV = 3 + 28 * normalized * normalized;
    if (normalized > 0.9) deltaV += 10;
  } else {
    deltaV = -(4 + 20 * normalized);
  }

  soma.Vm += deltaV;
}

// -----------------------------------------------------
// SOMA UPDATE (PHYSIOLOGY FIRST)
// -----------------------------------------------------
function updateSoma() {

  switch (soma.apState) {

    // =================================================
    // REST / SUBTHRESHOLD
    // =================================================
    case AP.NONE:

      if (soma.refractory > 0) {
        soma.refractory--;
        soma.Vm = lerp(soma.Vm, soma.rest, 0.15);
        break;
      }

      if (soma.Vm >= soma.threshold) {

        soma.apState = AP.NA_COMMIT;
        soma.delayCounter = 0;
        soma.invisibleAPFired = false;
        soma.visibleAPReleased = false;

        triggerNaInfluxNeuron1?.();
      } else {
        soma.Vm = lerp(soma.Vm, soma.rest, 0.04);
      }
      break;

    // =================================================
    // Na⁺ COMMIT → AIS WINDOW
    // =================================================
    case AP.NA_COMMIT:

      soma.delayCounter++;

      // gentle sigmoid depolarization
      soma.Vm += (soma.threshold - soma.Vm) * 0.25;

      if (
        !soma.invisibleAPFired &&
        soma.delayCounter >= INVISIBLE_AP_OFFSET
      ) {
        spawnInvisibleAxonAP?.();
        soma.invisibleAPFired = true;
      }

      if (
        !soma.visibleAPReleased &&
        soma.delayCounter >= AP_DELAY_FRAMES
      ) {
        soma.apState = AP.UPSTROKE;
        soma.visibleAPReleased = true;
      }
      break;

    // =================================================
    // FAST DEPOLARIZATION (SIGMOID)
    // =================================================
    case AP.UPSTROKE: {

      const target = 42;
      soma.Vm += (target - soma.Vm) * AP_PARAMS.upstrokeTau;

      if (soma.Vm >= 39) {
        soma.Vm = 40;
        soma.apState = AP.PEAK;
        soma.apTimer = AP_PARAMS.peakHold;

        window.neuron1Fired = true;
        window.lastNeuron1SpikeTime = state.time;

        logEvent?.(
          "neural",
          "Action potential generated at the soma",
          "soma"
        );

        spawnAxonSpike?.();
      }
      break;
    }

    // =================================================
    // ROUNDED PEAK (Na⁺/K⁺ OVERLAP)
    // =================================================
    case AP.PEAK: {

      const t = 1 - soma.apTimer / AP_PARAMS.peakHold;
      soma.Vm = 40 - 4 * (1 - cos(t * PI)); // rounded dome

      soma.apTimer--;
      if (soma.apTimer <= 0) soma.apState = AP.REPOLARIZE;
      break;
    }

    // =================================================
    // REPOLARIZATION (ASYMPTOTIC)
    // =================================================
    case AP.REPOLARIZE:

      soma.Vm += (soma.rest - soma.Vm) * AP_PARAMS.repolTau;

      if (soma.Vm <= soma.rest + 0.5) {
        soma.apState = AP.AHP;
      }
      break;

    // =================================================
    // AFTER-HYPERPOLARIZATION (Na⁺/K⁺ EXCHANGE)
    // =================================================
    case AP.AHP:

      soma.Vm += (AP_PARAMS.ahpTarget - soma.Vm) * AP_PARAMS.ahpTau;

      if (abs(soma.Vm - AP_PARAMS.ahpTarget) < 0.6) {
        soma.apState = AP.NONE;
        soma.refractory = AP_PARAMS.refractoryFrames;
      }
      break;
  }

  // ---------------------------------------------------
  // DISPLAY SMOOTHING (VISUAL ONLY)
  // ---------------------------------------------------
  soma.VmDisplay = lerp(soma.VmDisplay, soma.Vm, 0.18);
}

// =====================================================
// EXPORTS
// =====================================================
window.updateSoma     = updateSoma;
window.addEPSPToSoma = addEPSPToSoma;
