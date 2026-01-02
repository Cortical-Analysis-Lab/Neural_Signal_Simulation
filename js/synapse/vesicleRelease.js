console.log("⚡ synapse/vesicleRelease loaded");

// =====================================================
// VESICLE RELEASE — BIOLOGICAL FUSION
// Dock → Zipper → Pore → Open → Merge
// =====================================================
//
// ✔ No vesicle overlap
// ✔ Randomized fusion sites
// ✔ Gradual membrane merger
// ✔ Event-driven neurotransmitter release
// ✔ Hands membrane to recycling
// =====================================================

// -----------------------------------------------------
// AP TRIGGER — CALCIUM-GATED
// -----------------------------------------------------
function triggerVesicleReleaseFromAP() {

  for (const v of synapseVesicles) {

    if (v.state === VESICLE_STATE.LOADED) {

      v.state = "DOCKING";
      v.timer = 0;

      // Unique fusion site per vesicle
      v.dockOffsetY = random(-20, 20);

      // Fusion state variables
      v.fusionProgress = 0;
      v.poreRadius     = 0;
      v.flatten        = 0;

      // Cache fusion coordinates (prevents drift)
      v.fusionX = null;
      v.fusionY = null;
    }
  }
}

// -----------------------------------------------------
// UPDATE RELEASE SEQUENCE
// -----------------------------------------------------
function updateVesicleRelease() {

  const MEMBRANE_X = window.SYNAPSE_MEMBRANE_X;
  const CENTER_Y   = window.SYNAPSE_TERMINAL_CENTER_Y;

  for (let i = synapseVesicles.length - 1; i >= 0; i--) {
    const v = synapseVesicles[i];

    // =================================================
    // DOCKING — transport to membrane
    // =================================================
    if (v.state === "DOCKING") {

      v.x -= 1.0;

      const targetY = CENTER_Y + v.dockOffsetY;
      v.y += (targetY - v.y) * 0.15;

      if (v.x <= MEMBRANE_X + 3) {
        v.x = MEMBRANE_X + 3;
        v.y = targetY;

        v.state = "FUSION_ZIPPER";
        v.timer = 0;

        v.fusionX = v.x;
        v.fusionY = v.y;
      }
    }

    // =================================================
    // FUSION ZIPPER — SNARE tightening
    // =================================================
    else if (v.state === "FUSION_ZIPPER") {

      v.timer++;
      v.fusionProgress = constrain(v.timer / 45, 0, 1);

      // Slight inward membrane pull
      v.x = MEMBRANE_X + 3 - v.fusionProgress * 2;

      if (v.fusionProgress >= 1) {
        v.state = "FUSION_PORE";
        v.timer = 0;
      }
    }

    // =================================================
    // FUSION PORE — initial opening
    // =================================================
    else if (v.state === "FUSION_PORE") {

      v.timer++;
      v.poreRadius = min(6, v.timer * 0.18);

      // 🔔 Early leak (quantal pre-release)
      if (v.timer === 10) {
        window.dispatchEvent(new CustomEvent("synapticRelease", {
          detail: {
            x: v.fusionX,
            y: v.fusionY,
            normalX: -1,
            strength: 0.25
          }
        }));
      }

      if (v.timer > 40) {
        v.state = "FUSION_OPEN";
        v.timer = 0;
      }
    }

    // =================================================
    // FUSION OPEN — full transmitter release
    // =================================================
    else if (v.state === "FUSION_OPEN") {

      v.timer++;
      v.poreRadius = min(16, v.poreRadius + 0.35);

      // 🔔 Sustained release (no jetting)
      if (v.timer % 7 === 0) {
        window.dispatchEvent(new CustomEvent("synapticRelease", {
          detail: {
            x: v.fusionX + random(-2, 2),
            y: v.fusionY + random(-2, 2),
            normalX: -1,
            strength: 0.9
          }
        }));
      }

      if (v.timer > 55) {
        v.state = "MEMBRANE_MERGE";
        v.timer = 0;
      }
    }

    // =================================================
    // MEMBRANE MERGE — vesicle disappears
    // =================================================
    else if (v.state === "MEMBRANE_MERGE") {

      v.timer++;
      v.flatten = constrain(v.timer / 60, 0, 1);

      // Vesicle fully absorbed into membrane
      v.x = MEMBRANE_X + 1;
      v.y += (CENTER_Y - v.y) * 0.06;

      if (v.flatten >= 1) {

        // Hand membrane material to recycling
        if (typeof spawnEndocytosisSeed === "function") {
          spawnEndocytosisSeed(v.fusionX, v.fusionY);
        }

        // Remove vesicle permanently
        synapseVesicles.splice(i, 1);
      }
    }
  }
}
