console.log("⚡ synapse/vesicleRelease loaded");

// =====================================================
// VESICLE RELEASE — BIOLOGICAL FUSION
// Dock → Zipper → Pore → Open → Merge
// =====================================================
//
// ✔ Slow, smooth transitions
// ✔ No vesicle overlap
// ✔ Randomized fusion sites
// ✔ Diffusive neurotransmitter release
// ✔ Vesicle membrane fully absorbed
// ✔ Hands membrane to recycling
// =====================================================


// -----------------------------------------------------
// BIOLOGICAL TIMING (SLOW & VISIBLE)
// -----------------------------------------------------
const DOCK_TIME   = 90;
const ZIPPER_TIME = 140;
const PORE_TIME   = 160;
const OPEN_TIME   = 220;
const MERGE_TIME  = 260;


// -----------------------------------------------------
// AP TRIGGER — CALCIUM-GATED
// -----------------------------------------------------
function triggerVesicleReleaseFromAP() {

  for (const v of synapseVesicles) {

    if (v.state === VESICLE_STATE.LOADED) {

      v.state = "DOCKING";
      v.timer = 0;

      // Unique fusion site per vesicle
      v.dockOffsetY = random(-24, 24);

      // Fusion visuals
      v.fusionProgress = 0;
      v.poreRadius     = 0;
      v.flatten        = 0;

      // Lock fusion coordinates (prevents drift)
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
    // DOCKING — transport toward membrane
    // =================================================
    if (v.state === "DOCKING") {

      v.timer++;

      v.x -= 0.45; // slow, visible transport
      const targetY = CENTER_Y + v.dockOffsetY;
      v.y += (targetY - v.y) * 0.08;

      if (v.timer >= DOCK_TIME) {

        v.x = MEMBRANE_X + 3;
        v.y = targetY;

        v.fusionX = v.x;
        v.fusionY = v.y;

        v.state = "FUSION_ZIPPER";
        v.timer = 0;
      }
    }

    // =================================================
    // FUSION ZIPPER — SNARE tightening
    // =================================================
    else if (v.state === "FUSION_ZIPPER") {

      v.timer++;
      v.fusionProgress = constrain(v.timer / ZIPPER_TIME, 0, 1);

      // Vesicle neck drawn into membrane
      v.x = lerp(v.x, MEMBRANE_X + 1, v.fusionProgress);

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
      v.poreRadius = lerp(0, 6, v.timer / PORE_TIME);

      // 🔔 Early quantal leak
      if (v.timer === Math.floor(PORE_TIME * 0.35)) {
        window.dispatchEvent(new CustomEvent("synapticRelease", {
          detail: {
            x: v.fusionX,
            y: v.fusionY,
            normalX: -1,
            strength: 0.3
          }
        }));
      }

      if (v.timer >= PORE_TIME) {
        v.state = "FUSION_OPEN";
        v.timer = 0;
      }
    }

    // =================================================
    // FUSION OPEN — sustained release
    // =================================================
    else if (v.state === "FUSION_OPEN") {

      v.timer++;
      v.poreRadius = lerp(v.poreRadius, 14, 0.03);

      // 🔔 Diffusive transmitter release (NO JET)
      if (v.timer % 10 === 0) {
        window.dispatchEvent(new CustomEvent("synapticRelease", {
          detail: {
            x: v.fusionX + random(-2, 2),
            y: v.fusionY + random(-2, 2),
            normalX: -1,
            strength: 1.0
          }
        }));
      }

      if (v.timer >= OPEN_TIME) {
        v.state = "MEMBRANE_MERGE";
        v.timer = 0;
      }
    }

    // =================================================
    // MEMBRANE MERGE — vesicle absorbed
    // =================================================
    else if (v.state === "MEMBRANE_MERGE") {

      v.timer++;
      v.flatten = constrain(v.timer / MERGE_TIME, 0, 1);

      // Vesicle flattens into membrane
      v.x = MEMBRANE_X + 1;
      v.y += (CENTER_Y - v.y) * 0.05;

      if (v.flatten >= 1) {

        // Hand membrane to recycling system
        if (typeof spawnEndocytosisSeed === "function") {
          spawnEndocytosisSeed(v.fusionX, v.fusionY);
        }

        // Vesicle ceases to exist
        synapseVesicles.splice(i, 1);
      }
    }
  }
}
