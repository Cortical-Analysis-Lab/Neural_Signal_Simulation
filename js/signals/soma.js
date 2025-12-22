// =====================================================
// SOMA MEMBRANE POTENTIAL + ACTION POTENTIAL MODEL
// =====================================================
console.log("soma loaded");

const soma = {
  Vm: -65,        // membrane potential (mV)
  rest: -65,
  threshold: -50,
  tau: 0.98,

  // 🔑 spike visualization state
  spiking: false,
  spikeFrames: 0
};

// -----------------------------------------------------
// Action potential state
// -----------------------------------------------------
const REFRACTORY_FRAMES = 30;
const SPIKE_DISPLAY_FRAMES = 3; // how long Vm stays high visually
let refractory = 0;

// -----------------------------------------------------
// PSP arrival at soma (EPSP / IPSP)
// -----------------------------------------------------
function addEPSPToSoma(amplitude, type) {

  // Normalize bouton strength (legacy-compatible)
  const normalized = constrain((amplitude - 6) / 24, 0, 1);

  let deltaV;

  if (type === "exc") {

    // Nonlinear EPSP gain
    deltaV = 3 + 28 * normalized * normalized;

    // Driver synapse
    if (normalized > 0.9) {
      deltaV += 10;
    }

  } else {
    // IPSP
    deltaV = -(4 + 20 * normalized);
  }

  soma.Vm += deltaV;
}

// -----------------------------------------------------
// Soma update (decay, spike handling, refractory)
// -----------------------------------------------------
function updateSoma() {

  // -----------------------------------------------
  // Visible spike phase
  // -----------------------------------------------
  if (soma.spiking) {
    soma.spikeFrames--;

    if (soma.spikeFrames <= 0) {
      soma.spiking = false;
      refractory = REFRACTORY_FRAMES;
      soma.Vm = soma.rest;
    }

    return;
  }

  // -----------------------------------------------
  // Absolute refractory
  // -----------------------------------------------
  if (refractory > 0) {
    refractory--;
    soma.Vm = soma.rest;
    return;
  }

  // -----------------------------------------------
  // Threshold crossing
  // -----------------------------------------------
  if (soma.Vm >= soma.threshold) {
    fireActionPotential();
    return;
  }

  // -----------------------------------------------
  // Passive decay toward rest
  // -----------------------------------------------
  soma.Vm = lerp(soma.Vm, soma.rest, 1 - soma.tau);
}

// -----------------------------------------------------
// Action potential trigger
// -----------------------------------------------------
function fireActionPotential() {

  soma.spiking = true;
  soma.spikeFrames = SPIKE_DISPLAY_FRAMES;
  soma.Vm = 40;   // spike peak (visible now)

  // 🔥 Critical link to axon
  spawnAxonSpike();

  console.log("⚡ ACTION POTENTIAL");
}
