// =====================================================
// SOMA MEMBRANE POTENTIAL + ACTION POTENTIAL MODEL
// =====================================================
console.log("🧠 soma loaded");

// -----------------------------------------------------
// 🧠 TEACHING / TIMING KNOBS
// -----------------------------------------------------

// 🔹 total delay between soma Na⁺ influx and visible AP release
const AP_DELAY_FRAMES = 14;

// 🔹 invisible AP fires AFTER Na⁺ influx but BEFORE visible AP
const INVISIBLE_AP_OFFSET = 8;   // must be < AP_DELAY_FRAMES

// -----------------------------------------------------
// ACTION POTENTIAL PHASES
// -----------------------------------------------------
const AP = {
  NONE: 0,
  NA_COMMIT: 0.5,   // soma Na⁺ influx + AIS priming window
  UPSTROKE: 1,
  PEAK: 2,
  REPOLARIZE: 3,
  AHP: 4
};

// -----------------------------------------------------
// BIOPHYSICALLY INSPIRED PARAMETERS
// -----------------------------------------------------
const AP_PARAMS = {
  upstrokeRate: 7.5,
  peakHold: 2,
  repolRate: 5.0,
  ahpTarget: -78,
  ahpRate: 1.2,
  refractoryFrames: 25
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
        soma.Vm = lerp(soma.Vm, soma.rest, 0.2);
        break;
      }

      if (soma.Vm >= soma.threshold) {

        soma.apState = AP.NA_COMMIT;
        soma.delayCounter = 0;
        soma.invisibleAPFired = false;
        soma.visibleAPReleased = false;

        // 🟡 SOMA Na⁺ INFLUX (always first)
        triggerNaInfluxNeuron1?.();
      }
      else {
        soma.Vm = lerp(soma.Vm, soma.rest, 0.05);
      }
      break;

    // =================================================
    // Na⁺ COMMIT → AIS WINDOW
    // =================================================
    case AP.NA_COMMIT:

      soma.delayCounter++;

      // gentle depolarization plateau (NOT the spike)
      soma.Vm += AP_PARAMS.upstrokeRate * 0.35;

      // 👻 INVISIBLE AP (Na⁺ wave driver)
      if (
        !soma.invisibleAPFired &&
        soma.delayCounter >= INVISIBLE_AP_OFFSET
      ) {
        spawnInvisibleAxonAP?.();
        soma.invisibleAPFired = true;
      }

      // 🔴 RELEASE visible AP ONLY after full delay
      if (
        !soma.visibleAPReleased &&
        soma.delayCounter >= AP_DELAY_FRAMES
      ) {
        soma.apState = AP.UPSTROKE;
        soma.visibleAPReleased = true;
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

        window.neuron1Fired = true;
        window.lastNeuron1SpikeTime = state.time;

        logEvent?.(
          "neural",
          "Action potential generated at the soma",
          "soma"
        );

        // 🔴 Visible axonal AP (K⁺ wave follows this)
        spawnAxonSpike?.();
      }
      break;

    // =================================================
    // PEAK
    // =================================================
    case AP.PEAK:
      soma.apTimer--;
      if (soma.apTimer <= 0) soma.apState = AP.REPOLARIZE;
      break;

    // =================================================
    // REPOLARIZATION
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
      }
      break;
  }

  // ---------------------------------------------------
  // DISPLAY SMOOTHING ONLY
  // ---------------------------------------------------
  soma.VmDisplay = lerp(soma.VmDisplay, soma.Vm, 0.25);
}

// =====================================================
// EXPORTS
// =====================================================
window.updateSoma     = updateSoma;
window.addEPSPToSoma = addEPSPToSoma;
