console.log("⚡ synapse/vesicleRelease loaded");

// =====================================================
// VESICLE RELEASE — AP TRIGGERED
// (Docking → Fusion ONLY)
// =====================================================
//
// ❗ Uses shared constants from synapseConstants.js
// ❗ Does NOT recycle vesicles
// ❗ Does NOT load vesicles
// =====================================================

// -----------------------------------------------------
// AP TRIGGER — CALLED ON TERMINAL AP
// -----------------------------------------------------
function triggerVesicleReleaseFromAP() {

  for (const v of synapseVesicles) {

    // Only fully loaded vesicles may dock
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

      // Pull vesicle toward presynaptic membrane
      v.x -= 1.8;

      if (v.x <= SYNAPSE_MEMBRANE_X + 2) {

        // Snap cleanly to membrane
        v.x = SYNAPSE_MEMBRANE_X + 2;
        v.state = "FUSED";
        v.timer = 0;

        // Neurotransmitter release into cleft
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

      // Short fusion dwell (teaching-friendly)
      if (v.timer > 20) {
        v.state = "READY_FOR_RECYCLING";
      }
    }
  }
}
