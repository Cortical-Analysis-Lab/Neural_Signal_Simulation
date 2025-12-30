// =====================================================
// SOMA MEMBRANE POTENTIAL + ACTION POTENTIAL MODEL
// =====================================================
console.log("🧠 soma loaded");

// -----------------------------------------------------
// 🧠 TEACHING / TIMING KNOBS
// -----------------------------------------------------

// 🔹 delay between soma Na⁺ influx and AIS activation
const AP_DELAY_FRAMES = 6;

// 🔹 invisible AP starts AFTER Na⁺ influx but BEFORE visible AP
const INVISIBLE_AP_OFFSET = 2;   // frames after Na⁺ influx

// -----------------------------------------------------
// ACTION POTENTIAL PHASES
// -----------------------------------------------------
const AP = {
  NONE: 0,
  NA_COMMIT: 0.5,   // soma Na⁺ influx → AIS priming
  UPSTROKE: 1,
  PEAK: 2,
  REPOLARIZE: 3,
  AHP: 4
};

// -----------------------------------------------------
// BIOPHYSICALLY INSPIRED PARAMETERS
// -----------------------------------------------------
const AP_PARAMS = {
  upstrokeRate: 7.5,     // Na⁺ influx speed
  peakHold: 2,           // frames at peak
  repolRate: 5.0,        // K⁺ efflux
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
  invisibleAPFired: false
};

// -----------------------------------------------------
// PSP ARRIVAL AT SOMA
// -----------------------------------------------------
function addEPSPToSoma(amplitude, type, sourceNeuron = 1) {

  // ignore IPSPs from neuron 3 (your existing rule)
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

        // 🟡 SOMA Na⁺ INFLUX (visual + conceptual)
        triggerNaInfluxNeuron1?.();
      }

      else {
        soma.Vm = lerp(soma.Vm, soma.rest, 0.05);
      }
      break;

    // =================================================
    // Na⁺ COMMIT (SOMA → AIS)
    // =================================================
    case AP.NA_COMMIT:

      soma.Vm += AP_PARAMS.upstrokeRate * 0.6;
      soma.delayCounter++;

      // 👻 INVISIBLE AP FIRES HERE (DELAYED)
      if (
        !soma.invisibleAPFired &&
        soma.delayCounter >= INVISIBLE_AP_OFFSET
      ) {
        spawnInvisibleAxonAP?.();
        soma.invisibleAPFired = true;
      }

      // 🔴 VISIBLE AP FOLLOWS AFTER FULL DELAY
      if (soma.delayCounter >= AP_DELAY_FRAMES) {
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

        // metabolic + logging
        window.neuron1Fired = true;
        window.lastNeuron1SpikeTime = state.time;

        logEvent?.(
          "neural",
          "Action potential generated at the soma",
          "soma"
        );

        // 🔴 SPAWN VISIBLE AXON AP
        spawnAxonSpike?.();
      }
      break;

    // =================================================
    // PEAK (Na⁺ INACTIVATION)
    // =================================================
    case AP.PEAK:
      soma.apTimer--;
      if (soma.apTimer <= 0) soma.apState = AP.REPOLARIZE;
      break;

    // =================================================
    // REPOLARIZATION (K⁺ EFFLUX)
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
