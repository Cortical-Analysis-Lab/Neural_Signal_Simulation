// =====================================================
// SOMA MEMBRANE POTENTIAL + ACTION POTENTIAL MODEL
// =====================================================
console.log("🧠 soma loaded");

// -----------------------------------------------------
// 🧠 TEACHING / TIMING KNOBS (AXON ONLY)
// -----------------------------------------------------

// These NO LONGER affect Vm shape
const AP_DELAY_FRAMES       = 18;
const INVISIBLE_AP_OFFSET  = 14; // < AP_DELAY_FRAMES

// -----------------------------------------------------
// ACTION POTENTIAL PHASES (Vm ONLY)
// -----------------------------------------------------
const AP = {
  NONE: 0,
  UPSTROKE: 1,
  PEAK: 2,
  REPOLARIZE: 3,
  AHP: 4
};

// -----------------------------------------------------
// BIOPHYSICALLY INSPIRED PARAMETERS (Vm SHAPE)
// -----------------------------------------------------
const AP_PARAMS = {
  upstrokeRate: 8.5,       // fast Na⁺ activation
  peakHold: 3,             // rounded top
  repolRate: 4.8,          // K⁺ dominated decay
  ahpTarget: -78,
  ahpRate: 0.10,           // slower recovery
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

  // 🔑 TIMING (NO Vm EFFECT)
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
// SOMA UPDATE (Vm + AXON TIMING DECOUPLED)
// -----------------------------------------------------
function updateSoma() {

  // ===================================================
  // AXON TIMING (INDEPENDENT OF Vm SHAPE)
  // ===================================================
  if (soma.delayCounter > 0) {
    soma.delayCounter++;

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
      spawnAxonSpike?.();
      soma.visibleAPReleased = true;
    }
  }

  // ===================================================
  // Vm PHYSIOLOGY
  // ===================================================
  switch (soma.apState) {

    // -------------------------------
    // REST / SUBTHRESHOLD
    // -------------------------------
    case AP.NONE:

      if (soma.refractory > 0) {
        soma.refractory--;
        soma.Vm = lerp(soma.Vm, soma.rest, 0.18);
        break;
      }

      if (soma.Vm >= soma.threshold) {

        // 🔑 START AP IMMEDIATELY
        soma.apState = AP.UPSTROKE;

        // 🔑 START AXON DELAYS (NO Vm HOLD)
        soma.delayCounter = 1;
        soma.invisibleAPFired = false;
        soma.visibleAPReleased = false;

        triggerNaInfluxNeuron1?.();
      }
      else {
        soma.Vm = lerp(soma.Vm, soma.rest, 0.05);
      }
      break;

    // -------------------------------
    // FAST DEPOLARIZATION
    // -------------------------------
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
      }
      break;

    // -------------------------------
    // ROUNDED PEAK
    // -------------------------------
    case AP.PEAK:

      soma.apTimer--;
      if (soma.apTimer <= 0) {
        soma.apState = AP.REPOLARIZE;
      }
      break;

    // -------------------------------
    // REPOLARIZATION
    // -------------------------------
    case AP.REPOLARIZE:

      soma.Vm -= AP_PARAMS.repolRate;

      if (soma.Vm <= soma.rest) {
        soma.apState = AP.AHP;
      }
      break;

    // -------------------------------
    // AFTER-HYPERPOLARIZATION
    // -------------------------------
    case AP.AHP:

      soma.Vm = lerp(soma.Vm, AP_PARAMS.ahpTarget, AP_PARAMS.ahpRate);

      if (abs(soma.Vm - AP_PARAMS.ahpTarget) < 0.5) {
        soma.apState = AP.NONE;
        soma.refractory = AP_PARAMS.refractoryFrames;
      }
      break;
  }

  // ---------------------------------------------------
  // DISPLAY SMOOTHING ONLY (VISUAL)
  // ---------------------------------------------------
  soma.VmDisplay = lerp(soma.VmDisplay, soma.Vm, 0.25);
}

// =====================================================
// EXPORTS
// =====================================================
window.updateSoma     = updateSoma;
window.addEPSPToSoma = addEPSPToSoma;
