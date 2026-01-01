console.log("⚡ synapse/vesicleRelease loaded");

// =====================================================
// VESICLE RELEASE — AP TRIGGERED
// Docking → Fusion → DISAPPEAR
// =====================================================
//
// ✔ Uses shared constants from synapseConstants.js
// ✔ Removes vesicles upon fusion
// ✔ Hands membrane material to recycling system
// =====================================================

// -----------------------------------------------------
// AP TRIGGER — CALLED ON TERMINAL AP
// -----------------------------------------------------
function triggerVesicleReleaseFromAP() {

  for (const v of synapseVesicles) {

    if (v.state === VESICLE_STATE.LOADED) {
      v.state = "DOCKING";
      v.timer = 0;

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
  const CENTER_Y  = window.SYNAPSE_TERMINAL_CENTER_Y;

  for (let i = synapseVesicles.length - 1; i >= 0; i--) {
    const v = synapseVesicles[i];

    // ---------------------------------------------
    // DOCKING → FUSION
    // ---------------------------------------------
    if (v.state === "DOCKING") {

      v.x -= 1.6;

      const targetY = CENTER_Y + (v.dockOffsetY || 0);
      v.y += (targetY - v.y) * 0.12;

      if (v.x <= MEMBRANE_X + 1.5) {

        // Snap to membrane
        v.x = MEMBRANE_X + 1.5;
        v.y = targetY;

        // Neurotransmitter release
        if (typeof spawnNeurotransmitterBurst === "function") {
          spawnNeurotransmitterBurst(v.x, v.y);
        }

        // 🔥 Vesicle MERGES with membrane and is removed
        synapseVesicles.splice(i, 1);

        // Hand off membrane material to recycling pool
        if (typeof spawnEndocytosisSeed === "function") {
          spawnEndocytosisSeed(v.x, v.y);
        }
      }
    }
  }
}
