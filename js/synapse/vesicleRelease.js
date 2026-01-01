console.log("⚡ synapse/vesicleRelease loaded");

// =====================================================
// VESICLE RELEASE — AP TRIGGERED
// (Movement to membrane + fusion ONLY)
// =====================================================

// Must match neuronShape.js + vesicleLoading.js
const SYNAPSE_MEMBRANE_X = 0;

// -----------------------------------------------------
// AP TRIGGER — CALLED ON TERMINAL AP
// -----------------------------------------------------
function triggerVesicleReleaseFromAP() {

  for (const v of synapseVesicles) {
    if (v.state === VESICLE_STATE.LOADED) {
      v.state = "DOCKING";
      v.timer = 0;
    }
  }
}

// -----------------------------------------------------
// UPDATE RELEASE DYNAMICS
// -----------------------------------------------------
function updateVesicleRelease() {

  for (const v of synapseVesicles) {

    // ---------------------------------------------
    // DOCKING → FUSION
    // ---------------------------------------------
    if (v.state === "DOCKING") {

      // Pull toward membrane
      v.x -= 1.8;

      if (v.x <= SYNAPSE_MEMBRANE_X + 2) {
        v.x = SYNAPSE_MEMBRANE_X + 2;
        v.state = "FUSED";
        v.timer = 0;

        // Neurotransmitter release (cleft)
        if (typeof spawnNeurotransmitterBurst === "function") {
          spawnNeurotransmitterBurst(v.x, v.y);
        }
      }
    }

    // ---------------------------------------------
    // FUSED — WAIT FOR ENDOCYTOSIS
    // ---------------------------------------------
    if (v.state === "FUSED") {
      v.timer++;
      if (v.timer > 20) {
        // Recycling is handled elsewhere
        v.state = "READY_FOR_RECYCLING";
      }
    }
  }
}
