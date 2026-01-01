console.log("⚡ synapse/vesicleRelease loaded");

// =====================================================
// VESICLE RELEASE — BIOLOGICAL FUSION MODEL
// Dock → Zipper → Pore → Open → Merge
// =====================================================

// -----------------------------------------------------
// AP TRIGGER
// -----------------------------------------------------
function triggerVesicleReleaseFromAP() {

  for (const v of synapseVesicles) {
    if (v.state === VESICLE_STATE.LOADED) {
      v.state = "DOCKING";
      v.timer = 0;

      v.dockOffsetY ??= random(-16, 16);
      v.fusionProgress = 0;
      v.poreRadius = 0;
      v.flatten = 0;
    }
  }
}

// -----------------------------------------------------
// UPDATE RELEASE
// -----------------------------------------------------
function updateVesicleRelease() {

  const MEMBRANE_X = window.SYNAPSE_MEMBRANE_X;
  const CENTER_Y   = window.SYNAPSE_TERMINAL_CENTER_Y;

  for (let i = synapseVesicles.length - 1; i >= 0; i--) {
    const v = synapseVesicles[i];

    // ================= DOCKING =================
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

    // ================= ZIPPER =================
    else if (v.state === "FUSION_ZIPPER") {

      v.timer++;
      v.fusionProgress = min(1, v.timer / 40);
      v.x = MEMBRANE_X + 2 - v.fusionProgress * 2;

      if (v.fusionProgress >= 1) {
        v.state = "FUSION_PORE";
        v.timer = 0;
      }
    }

    // ================= PORE =================
    else if (v.state === "FUSION_PORE") {

      v.timer++;
      v.poreRadius = min(6, v.timer * 0.15);

      if (typeof spawnNeurotransmitterBurst === "function") {
        if (frameCount % 6 === 0) {
          spawnNeurotransmitterBurst(v.x, v.y, 2);
        }
      }

      if (v.timer > 50) {
        v.state = "FUSION_OPEN";
        v.timer = 0;
      }
    }

    // ================= OPEN =================
    else if (v.state === "FUSION_OPEN") {

      v.timer++;
      v.poreRadius = min(14, v.poreRadius + 0.3);

      if (typeof spawnNeurotransmitterBurst === "function") {
        if (frameCount % 3 === 0) {
          spawnNeurotransmitterBurst(v.x, v.y, 6);
        }
      }

      if (v.timer > 40) {
        v.state = "MEMBRANE_MERGE";
        v.timer = 0;
      }
    }

    // ================= MERGE =================
    else if (v.state === "MEMBRANE_MERGE") {

      v.timer++;
      v.flatten = min(1, v.timer / 50);
      v.x = MEMBRANE_X + 1;
      v.y += (CENTER_Y - v.y) * 0.04;

      if (v.flatten >= 1) {

        if (typeof spawnEndocytosisSeed === "function") {
          spawnEndocytosisSeed(v.x, v.y);
        }

        synapseVesicles.splice(i, 1);
      }
    }
  }
}
