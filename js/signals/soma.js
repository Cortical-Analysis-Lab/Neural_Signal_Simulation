// =====================================================
// SOMA MEMBRANE POTENTIAL MODEL
// =====================================================

const soma = {
  Vm: -65,          // resting potential (mV)
  rest: -65,
  threshold: -50,   // used later in Step 3B
  tau: 0.98         // decay factor per frame
};

// Call when an EPSP reaches the soma
function addEPSPToSoma(amplitude) {
  // Map bouton size → mV contribution
  const deltaV = map(amplitude, 6, 30, 0.5, 4);
  soma.Vm += deltaV;
}

// Passive decay back to rest
function updateSoma() {
  soma.Vm = lerp(soma.Vm, soma.rest, 1 - soma.tau);
}
