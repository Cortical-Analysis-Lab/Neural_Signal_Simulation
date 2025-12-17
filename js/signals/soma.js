// =====================================================
// SOMA MEMBRANE POTENTIAL MODEL
// =====================================================

const soma = {
  Vm: -65,          // resting potential (mV)
  rest: -65,
  threshold: -50,   // used later in Step 3B
  tau: 0.98         // decay factor per frame
};

function addEPSPToSoma(amplitude) {
  const normalized = constrain((amplitude - 6) / 24, 0, 1);

  // Base nonlinear EPSP
  let deltaV = 1 + 20 * normalized * normalized;

  // VERY STRONG synapse bonus (driver input)
  if (amplitude >= 24) {
    deltaV += 6;  // pushes Vm near / over threshold
  }

  soma.Vm += deltaV;
}


// Passive decay back to rest
function updateSoma() {
  soma.Vm = lerp(soma.Vm, soma.rest, 1 - soma.tau);
}
