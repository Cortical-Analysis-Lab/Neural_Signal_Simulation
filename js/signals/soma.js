// =====================================================
// SOMA MEMBRANE POTENTIAL + ACTION POTENTIAL MODEL
// =====================================================
console.log("soma loaded");

const soma = {
  Vm: -65,            // TRUE membrane potential (fast)
  VmDisplay: -65,     // 👁️ DISPLAY membrane potential (slow)
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
const SPIKE_DISPLAY_FRAMES = 3; // frames Vm stays at peak
let refractory = 0;

// -----------------------------------------------------
// PSP arrival at soma (EPSP / IPSP)
// -----------------------------------------------------
function addEPSPToSoma(amplitude, type) {

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
// Soma update (physiology + display smoothing)
// -----------------------------------------------------
function updateSoma() {

  // ---------------- Visible spike phase ----------------
  if (soma.spiking) {
    soma.spikeFrames--;

    if (soma.spikeFrames <= 0) {
      soma.spiking = false;
      refractory = REFRACTORY_FRAMES;
      soma.Vm = soma.rest;
    }
  }

  // ---------------- Absolute refractory ----------------
  else if (refractory > 0) {
    refractory--;
    soma.Vm = soma.rest;
  }

  // ---------------- Threshold crossing ----------------
  else if (soma.Vm >= soma.threshold) {
    fireActionPotential();
  }

  // ---------------- Passive decay ----------------
  else {
    soma.Vm = lerp(soma.Vm, soma.rest, 1 - soma.tau);
  }

  // =====================================================
  // 👁️ SLOW DISPLAY FILTER (THIS IS THE KEY CHANGE)
  // =====================================================
  const DISPLAY_TAU = 0.80;   // 🔴 LOWER = MUCH SLOWER
  soma.VmDisplay = lerp(
    soma.VmDisplay,
    soma.Vm,
    1 - DISPLAY_TAU
  );
}

// -----------------------------------------------------
// Action potential trigger
// -----------------------------------------------------
function fireActionPotential() {

  soma.spiking = true;
  soma.spikeFrames = SPIKE_DISPLAY_FRAMES;
  soma.Vm = 40;   // spike peak

  spawnAxonSpike();
  console.log("⚡ ACTION POTENTIAL");
}
