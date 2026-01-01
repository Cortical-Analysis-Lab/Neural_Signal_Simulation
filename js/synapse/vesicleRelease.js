console.log("⚡ synapse/vesicleRelease loaded");

// =====================================================
// VESICLE RELEASE — AP TRIGGERED
// (Docking → Fusion ONLY)
// =====================================================
//
// ✔ Uses shared constants from synapseConstants.js
// ✔ Uses vesicle states from vesicleLoading.js
// ✔ Respects per-vesicle docking offsets
// ✔ Does NOT recycle vesicles (hand-off only)
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

      // Cache docking target Y once
      if (v.dockOffsetY === undefined) {
        v.dockOffsetY = random(-16, 16);
      }
    }
  }
}

// -----------------------------------------------------
// UPDATE RELEASE DYNAMICS
// -----------------------------------------------------
function updateVesicleRelease() {

  const MEMBRANE_X = window.SYNAPSE_MEMBRANE_X;

  for (const v of synapseVesicles) {

    // ---------------------------------------------
    // DOCKING → FUSED
    // ---------------------------------------------
    if (v.state === "DOCKING") {

      // Horizontal pull toward membrane
      v.x -= 1.6;

      // Gentle vertical convergence toward docking band
      const targetY =
        window.SYNAPSE_TERMINAL_CENTER_Y + (v.dockOffsetY || 0);

      v.y += (targetY - v.y) * 0.12;

      // Reached membrane
      if (v.x <= MEMBRANE_X + 1.5) {

        // Snap cleanly onto membrane face
        v.x = MEMBRANE_X + 1.5;
        v.y = targetY;

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

      // Short fusion dwell (clear visualization)
      if (v.timer > 20) {
        v.state = "READY_FOR_RECYCLING";
        v.timer = 0;
      }
    }
  }
}
