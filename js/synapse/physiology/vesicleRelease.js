console.log("⚡ vesicleRelease loaded");

// =====================================================
// VESICLE RELEASE — BIOLOGICAL FUSION (STATE-ONLY)
// Dock → Zipper → Pore → Open → Merge
// =====================================================
//
// ✔ One vesicle per AP
// ✔ State-driven (NO motion authority)
// ✔ Stable fusion site
// ✔ Diffusive neurotransmitter release
// ✔ Clean handoff to recycling
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
// AP TRIGGER — CALCIUM-GATED (ONE VESICLE)
// -----------------------------------------------------
function triggerVesicleReleaseFromAP() {

  const vesicles = window.synapseVesicles || [];

  const candidates = vesicles.filter(v => v.state === "loaded");
  if (candidates.length === 0) return;

  // Choose vesicle closest to membrane
  candidates.sort((a, b) => a.x - b.x);
  const v = candidates[0];

  v.state = "DOCKING";
  v.timer = 0;

  // Lock fusion site immediately
  v.dockOffsetY = random(-24, 24);
  v.fusionX = window.SYNAPSE_MEMBRANE_X + 2;
  v.fusionY = window.SYNAPSE_TERMINAL_CENTER_Y + v.dockOffsetY;

  // Visual parameters
  v.fusionProgress = 0;
  v.poreRadius     = 0;
  v.flatten        = 0;
}


// -----------------------------------------------------
// UPDATE RELEASE SEQUENCE (NO MOTION)
// -----------------------------------------------------
function updateVesicleRelease() {

  const vesicles = window.synapseVesicles || [];

  for (const v of vesicles) {

    // =================================================
    // DOCKING — wait only
    // =================================================
    if (v.state === "DOCKING") {

      v.timer++;
      if (v.timer >= DOCK_TIME) {
        v.state = "FUSION_ZIPPER";
        v.timer = 0;
      }
    }

    // =================================================
    // FUSION ZIPPER
    // =================================================
    else if (v.state === "FUSION_ZIPPER") {

      v.timer++;
      v.fusionProgress = constrain(v.timer / ZIPPER_TIME, 0, 1);

      if (v.fusionProgress >= 1) {
        v.state = "FUSION_PORE";
        v.timer = 0;
      }
    }

    // =================================================
    // FUSION PORE — early quantal leak
    // =================================================
    else if (v.state === "FUSION_PORE") {

      v.timer++;
      v.poreRadius = lerp(0, 6, v.timer / PORE_TIME);

      if (v.timer === Math.floor(PORE_TIME * 0.35)) {
        window.dispatchEvent(new CustomEvent("synapticRelease", {
          detail: {
            x: v.fusionX,
            y: v.fusionY,
            normalX: -1,
            strength: 0.35
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
    // MEMBRANE MERGE — request recycling
    // =================================================
    else if (v.state === "MEMBRANE_MERGE") {

      v.timer++;
      v.flatten = constrain(v.timer / MERGE_TIME, 0, 1);

      if (v.flatten >= 1) {

        if (typeof spawnEndocytosisSeed === "function") {
          spawnEndocytosisSeed(v.fusionX, v.fusionY);
        }

        // Mark for removal (pool handles cleanup safely)
        v.state = "RECYCLED";
      }
    }
  }

  // Safe cleanup AFTER iteration
  for (let i = vesicles.length - 1; i >= 0; i--) {
    if (vesicles[i].state === "RECYCLED") {
      vesicles.splice(i, 1);
    }
  }
}
