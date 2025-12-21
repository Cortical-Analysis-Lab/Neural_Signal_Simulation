// =====================================================
// SOMA MEMBRANE POTENTIAL + ACTION POTENTIAL MODEL
// =====================================================
console.log("soma loaded");

const soma = {
  Vm: -65,        // resting membrane potential (mV)
  rest: -65,
  threshold: -50,
  tau: 0.98       // decay factor (temporal summation)
};

// -----------------------------------------------------
// Action potential state
// -----------------------------------------------------
const REFRACTORY_FRAMES = 30;
let refractory = 0;

// -----------------------------------------------------
// PSP arrival at soma (EPSP / IPSP)
// -----------------------------------------------------
function addEPSPToSoma(amplitude, type) {

  // Normalize bouton size (6 → 30)
  const normalized = constrain((amplitude - 6) / 24, 0, 1);

  let deltaV;

  if (type === "exc") {

    // Nonlinear EPSP gain
    deltaV = 3 + 28 * normalized * normalized;

    // Driver synapse guarantee
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
// Soma update (decay, threshold, refractory)
// -----------------------------------------------------
function updateSoma() {

  // Absolute refractory period
  if (refractory > 0) {
    refractory--;
    soma.Vm = soma.rest;
    return;
  }

  // Threshold crossing → fire ONE action potential
  if (soma.Vm >= soma.threshold) {
    fireActionPotential();
    return;
  }

  // Passive decay back toward rest
  soma.Vm = lerp(soma.Vm, soma.rest, 1 - soma.tau);
}

// -----------------------------------------------------
// Action potential trigger
// -----------------------------------------------------
function fireActionPotential() {

  refractory = REFRACTORY_FRAMES;
  soma.Vm = 40;   // spike peak

  // 🔥 Critical link to axon
  spawnAxonSpike();

  console.log("⚡ ACTION POTENTIAL");
}
