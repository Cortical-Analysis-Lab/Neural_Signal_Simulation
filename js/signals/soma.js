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

// Action potential state
let isFiring = false;
let refractory = 0;

// -----------------------------------------------------
// EPSP arrival at soma
// -----------------------------------------------------
function addEPSPToSoma(amplitude) {
  // amplitude = bouton radius (6 → 30)
  const normalized = constrain((amplitude - 6) / 24, 0, 1);

  // Strong nonlinear weighting (educational gain)
  let deltaV = 1 + 20 * normalized * normalized;

  // Very strong "driver" synapse bonus
  if (amplitude >= 24) {
    deltaV += 6;
  }

  soma.Vm += deltaV;
}

// -----------------------------------------------------
// Soma update (decay, threshold, refractory)
// -----------------------------------------------------
function updateSoma() {

  // Refractory period
  if (refractory > 0) {
    refractory--;
    soma.Vm = soma.rest;
    return;
  }

  // Threshold crossing → fire action potential
  if (soma.Vm >= soma.threshold && !isFiring) {
    fireActionPotential();
    return;
  }

  // Passive decay back to rest
  soma.Vm = lerp(soma.Vm, soma.rest, 1 - soma.tau);
}

// -----------------------------------------------------
// Action potential trigger
// -----------------------------------------------------
function fireActionPotential() {
  isFiring = true;
  refractory = 30;   // ~500 ms at 60 FPS
  soma.Vm = 40;      // overshoot peak

  console.log("⚡ ACTION POTENTIAL");
}
