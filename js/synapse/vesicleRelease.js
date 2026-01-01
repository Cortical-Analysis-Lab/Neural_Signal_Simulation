console.log("⚡ synapse/vesicleRelease loaded");

// =====================================================
// VESICLE RELEASE — BIOLOGICAL FUSION MODEL
// Dock → Zipper → Pore → Open → Merge
// =====================================================
//
// ✔ Gradual membrane fusion
// ✔ Visible pore opening
// ✔ Slow neurotransmitter efflux
// ✔ Vesicle flattens into membrane
// =====================================================

// -----------------------------------------------------
// AP TRIGGER — CALLED ON TERMINAL AP
// -----------------------------------------------------
function triggerVesicleReleaseFromAP() {

  for (const v of synapseVesicles) {
    if (v.state === VESICLE_STATE.LOADED) {
      v.state = "DOCKING";
      v.timer = 0;

      v.dockOffsetY ??= random(-16, 16);

      // Fusion morphology
      v.fusionProgress = 0;   // 0 → 1
      v.poreRadius     = 0;
      v.flatten        = 0;
    }
  }
}

// -----------------------------------------------------
// UPDATE RELEASE DYNAMICS
// -----------------------------------------------------
function updateVesicleRelease() {

  const MEMBRANE_X = window.SYNAPSE_MEMBRANE_X;
  const CENTER_Y   = window.SYNAPSE_TERMINAL_CENTER_Y;

  for (let i = synapseVesicles.length - 1; i >= 0; i--) {
    const v = synapseVesicles[i];

    // =================================================
    // DOCKING — approach membrane
    // =================================================
    if (v.state === "DOCKING") {

      v.x -= 1.2;

      const targetY = CENTER_Y + v.dockOffsetY;
      v.y += (targetY - v.y) * 0.12;

      if (v.x <= MEMBRANE_X + 2) {
        v.x = MEMBRANE_X + 2;
        v.y = targetY;

        v.state = "FUSION_ZIPPER";
        v.timer = 0;
      }
    }

    // =================================================
    // FUSION_ZIPPER — SNARE tightening
    // =================================================
    else if (v.state === "FUSION_ZIPPER") {

      v.timer++;
      v.fusionProgress = min(1, v.timer / 40);

      // Subtle inward pull
      v.x = MEMBRANE_X + 2 - v.fusionProgress * 2;

      if (v.fusionProgress >= 1) {
        v.state = "FUSION_PORE";
        v.timer = 0;
      }
    }

    // =================================================
    // FUSION_PORE — small opening
    // =================================================
    else if (v.state === "FUSION_PORE") {

      v.timer++;
      v.poreRadius = min(6, v.timer * 0.15);

      // Slow NT leakage
      if (frameCount % 6 === 0 && v.nts.length > 0) {
        spawnNeurotransmitterBurst(
          v.x,
          v.y,
          2   // small leak
        );
      }

      if (v.timer > 50) {
        v.state = "FUSION_OPEN";
        v.timer = 0;
      }
    }

    // =================================================
    // FUSION_OPEN — wide opening
    // =================================================
    else if (v.state === "FUSION_OPEN") {

      v.timer++;
      v.poreRadius = min(14, v.poreRadius + 0.3);

      // Bulk release
      if (frameCount % 3 === 0 && v.nts.length > 0) {
        spawnNeurotransmitterBurst(
          v.x,
          v.y,
          6
        );
      }

      if (v.timer > 40) {
        v.state = "MEMBRANE_MERGE";
        v.timer = 0;
      }
    }

    // =================================================
    // MEMBRANE_MERGE — vesicle flattens
    // =================================================
    else if (v.state === "MEMBRANE_MERGE") {

      v.timer++;
      v.flatten = min(1, v.timer / 50);

      // Vesicle collapses into membrane plane
      v.x = MEMBRANE_X + 1;
      v.y += (CENTER_Y - v.y) * 0.04;

      if (v.flatten >= 1) {

        // Hand membrane material to recycling
        if (typeof spawnEndocytosisSeed === "function") {
          spawnEndocytosisSeed(v.x, v.y);
        }

        // Remove vesicle completely
        synapseVesicles.splice(i, 1);
      }
    }
  }
}
