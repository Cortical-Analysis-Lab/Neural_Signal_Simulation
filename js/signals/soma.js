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
let refractory = 0;

// -----------------------------------------------------
// PSP arrival at soma (EPSP / IPSP)
// -----------------------------------------------------
function addEPSPToSoma(amplitude, type) {

  // Normalize bouton size (6 → 30)
  const normalized = constrain((amplitude - 6) / 24, 0, 1);

  let deltaV;

  if (type === "exc") {

    // Strong nonlinear boost
    deltaV = 3 + 28 * normalized * normalized;

    // Driver synapse guarantee
    if (normalized > 0.9) {
      deltaV += 10;   // ensures threshold crossing
    }

  } else {
    // Inhibitory PSP
    deltaV = - (4 + 20 * normalized);
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
if (soma.Vm >= soma.threshold && refractory === 0) {
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
  refractory = 30;   // frames; sole gating mechanism
  soma.Vm = 40;

  spawnAxonSpike(); // 🔥 THIS IS THE LINK

  console.log("⚡ ACTION POTENTIAL");
}

