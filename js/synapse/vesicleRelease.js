console.log("⚡ synapse/vesicleRelease loaded");

// =====================================================
// VESICLE RELEASE — AP TRIGGERED
// (Docking → Fusion ONLY)
// =====================================================
//
// ✔ Uses shared constants from synapseConstants.js
// ✔ Uses vesicle states defined in vesicleLoading.js
// ✔ No loading
// ✔ No recycling
// =====================================================

// -----------------------------------------------------
// SHORT ALIASES (GLOBAL CONSTANTS)
// -----------------------------------------------------
const MEMBRANE_X = window.SYNAPSE_MEMBRANE_X;

// -----------------------------------------------------
// AP TRIGGER — CALLED ON TERMINAL AP
// -----------------------------------------------------
function triggerVesicleReleaseFromAP() {

  for (const v of synapseVesicles) {

    // Only vesicles that are fully loaded may release
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
    // DOCKING → FUSED
    // ---------------------------------------------
    if (v.state === "DOCKING") {

      // Smooth, controlled pull toward membrane
      v.x -= 1.6;

      if (v.x <= MEMBRANE_X + 2) {

        // Snap cleanly to membrane face
        v.x = MEMBRANE_X + 2;
        v.state = "FUSED";
        v.timer = 0;

        // Neurotransmitter release into synaptic cleft
        if (typeof spawnNeurotransmitterBurst === "function") {
          spawnNeurotransmitterBurst(v.x, v.y);
        }
      }
    }

    // ---------------------------------------------
    // FUSED → READY_FOR_RECYCLING
    // ---------------------------------------------
    if (v.state === "FUSED") {
      v.timer++;

      // Short fusion dwell (visual clarity)
      if (v.timer > 20) {
        v.state = "READY_FOR_RECYCLING";
        v.timer = 0;
      }
    }
  }
}
