// =====================================================
// SOMA MEMBRANE POTENTIAL + ACTION POTENTIAL MODEL
// =====================================================
console.log("soma loaded");

const soma = {
  Vm: -65,            // TRUE membrane potential (fast, physiological)
  VmDisplay: -65,     // 👁️ DISPLAY membrane potential (slow, visual)
  rest: -65,
  threshold: -50,
  tau: 0.98,

  spiking: false,
  spikeFrames: 0
};

// -----------------------------------------------------
// Action potential state
// -----------------------------------------------------
const REFRACTORY_FRAMES = 30;
const SPIKE_DISPLAY_FRAMES = 6;   // 👁️ hold spike longer for visibility
let refractory = 0;

// -----------------------------------------------------
// PSP arrival at soma (EPSP / IPSP)
// -----------------------------------------------------
function addEPSPToSoma(amplitude, type) {

  const normalized = constrain((amplitude - 6) / 24, 0, 1);
  let deltaV;

  if (type === "exc") {
    deltaV = 3 + 28 * normalized * normalized;

    // Driver synapse
    if (normalized > 0.9) deltaV += 10;
  } else {
    // IPSP
    deltaV = -(4 + 20 * normalized);
  }

  soma.Vm += deltaV;
}

// -----------------------------------------------------
// Soma update (physiology + DISPLAY logic)
// -----------------------------------------------------
function updateSoma() {

  // ===================================================
  // 👁️ SPIKE DISPLAY PHASE (LATCH VmDisplay)
  // ===================================================
  if (soma.spiking) {

    // Smoothly move DISPLAY Vm toward spike peak
    soma.VmDisplay = lerp(soma.VmDisplay, soma.Vm, 0.15);

    soma.spikeFrames--;
    if (soma.spikeFrames <= 0) {
      soma.spiking = false;
      refractory = REFRACTORY_FRAMES;
      soma.Vm = soma.rest;
    }
    return;
  }

  // ===================================================
  // Absolute refractory (physiology)
  // ===================================================
  if (refractory > 0) {
    refractory--;
    soma.Vm = soma.rest;
  }

  // ===================================================
  // Threshold crossing
  // ===================================================
  else if (soma.Vm >= soma.threshold) {
    fireActionPotential();
  }

  // ===================================================
  // Passive decay toward rest
  // ===================================================
  else {
    soma.Vm = lerp(soma.Vm, soma.rest, 1 - soma.tau);
  }

  // ===================================================
  // 👁️ VERY SLOW DISPLAY SMOOTHING (KEY FIX)
  // ===================================================
  const DISPLAY_LERP = 0.02;   // 🔴 0.01–0.03 = very slow & readable
  soma.VmDisplay = lerp(
    soma.VmDisplay,
    soma.Vm,
    DISPLAY_LERP
  );
}

// -----------------------------------------------------
// Action potential trigger
// -----------------------------------------------------
function fireActionPotential() {

  soma.spiking = true;
  soma.spikeFrames = SPIKE_DISPLAY_FRAMES;
  soma.Vm = 40;   // spike peak (physiology)

  // 🔥 Axon firing unchanged
  spawnAxonSpike();

  console.log("⚡ ACTION POTENTIAL");
}
