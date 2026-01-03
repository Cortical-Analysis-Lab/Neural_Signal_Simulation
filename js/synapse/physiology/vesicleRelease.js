console.log("⚡ vesicleRelease loaded");

// =====================================================
// VESICLE RELEASE — BIOLOGICAL FUSION (STATE-ONLY)
// Dock → Zipper → Pore → Open → Merge
// =====================================================
//
// ✔ Continuous membrane-directed movement
// ✔ Radial (Y) position preserved
// ✔ Pool-safe (velocity bias only)
// ✔ Visible collapse: 1 → 3/4 → 1/2 → 1/4 → gone
// ✔ Clean recycling handoff
//
// NON-RESPONSIBILITIES:
// ✘ No Brownian motion
// ✘ No collision handling
// ✘ No constraints or clamping
// ✘ No rendering
// =====================================================


// -----------------------------------------------------
// BIOLOGICAL TIMING (INTENTIONALLY SLOW)
// -----------------------------------------------------
const DOCK_TIME   = 90;
const ZIPPER_TIME = 140;
const PORE_TIME   = 160;
const OPEN_TIME   = 220;
const MERGE_TIME  = 260;


// -----------------------------------------------------
// CONTINUOUS APPROACH FORCE (KEY FIX)
// -----------------------------------------------------
// • Applies only during release states
// • Velocity-only (pool remains authority)
// • Strong enough to overcome reserve confinement
//
function applyFusionApproachForce(v) {

  const targetX = window.SYNAPSE_VESICLE_STOP_X;
  const dx = targetX - v.x;

  // Distance-scaled pull toward membrane
  const pull = constrain(dx * 0.025, -0.35, 0.35);

  v.vx += pull;

  // Suppress vertical drift (keep radial alignment)
  v.vy *= 0.85;
}


// -----------------------------------------------------
// AP TRIGGER — CALCIUM-GATED (ONE VESICLE)
// -----------------------------------------------------
function triggerVesicleReleaseFromAP() {

  const vesicles = window.synapseVesicles || [];
  const candidates = vesicles.filter(v => v.state === "loaded");
  if (candidates.length === 0) return;

  // Closest vesicle to membrane wins
  candidates.sort((a, b) => a.x - b.x);
  const v = candidates[0];

  // -------------------------------
  // STATE INITIALIZATION
  // -------------------------------
  v.state = "DOCKING";
  v.timer = 0;

  // -------------------------------
  // RELEASE FLAGS (CRITICAL)
  // -------------------------------
  v.releaseBias = true;   // 🔑 tells pool to allow forward motion

  // -------------------------------
  // PRESERVE RADIAL POSITION
  // -------------------------------
  v.fusionX = window.SYNAPSE_VESICLE_STOP_X;
  v.fusionY = v.y;

  // -------------------------------
  // VISUAL FUSION STATE
  // -------------------------------
  v.fusionProgress = 0;
  v.poreRadius     = 0;
  v.mergePhase     = 1.0; // full circle
}


// -----------------------------------------------------
// UPDATE RELEASE SEQUENCE (STATE-ONLY)
// -----------------------------------------------------
function updateVesicleRelease() {

  const vesicles = window.synapseVesicles || [];

  for (const v of vesicles) {

    // =================================================
    // DOCKING — ACTIVE APPROACH
    // =================================================
    if (v.state === "DOCKING") {

      applyFusionApproachForce(v);

      v.timer++;
      if (v.timer >= DOCK_TIME) {
        v.state = "FUSION_ZIPPER";
        v.timer = 0;
      }
    }

    // =================================================
    // FUSION ZIPPER — MEMBRANE ENGAGEMENT
    // =================================================
    else if (v.state === "FUSION_ZIPPER") {

      applyFusionApproachForce(v);

      v.timer++;
      v.fusionProgress = constrain(v.timer / ZIPPER_TIME, 0, 1);

      if (v.fusionProgress >= 1) {
        v.state = "FUSION_PORE";
        v.timer = 0;
      }
    }

    // =================================================
    // FUSION PORE — INITIAL QUANTAL LEAK
    // =================================================
    else if (v.state === "FUSION_PORE") {

      v.timer++;
      v.poreRadius = lerp(0, 6, v.timer / PORE_TIME);

      if (v.timer === Math.floor(PORE_TIME * 0.35)) {
        window.dispatchEvent(new CustomEvent("synapticRelease", {
          detail: {
            x: v.x,
            y: v.y,
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
    // FUSION OPEN — SUSTAINED RELEASE
    // =================================================
    else if (v.state === "FUSION_OPEN") {

      v.timer++;

      if (v.timer % 10 === 0) {
        window.dispatchEvent(new CustomEvent("synapticRelease", {
          detail: {
            x: v.x + random(-2, 2),
            y: v.y + random(-2, 2),
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
    // MEMBRANE MERGE — VISIBLE COLLAPSE
    // =================================================
    else if (v.state === "MEMBRANE_MERGE") {

      v.timer++;
      const t = constrain(v.timer / MERGE_TIME, 0, 1);

      // 1 → 3/4 → 1/2 → 1/4 → gone
      if      (t < 0.25) v.mergePhase = 1.0;
      else if (t < 0.5)  v.mergePhase = 0.75;
      else if (t < 0.75) v.mergePhase = 0.5;
      else               v.mergePhase = 0.25;

      if (t >= 1) {

        if (typeof spawnEndocytosisSeed === "function") {
          spawnEndocytosisSeed(v.x, v.y);
        }

        v.state = "RECYCLED";
      }
    }
  }

  // ---------------------------------------------------
  // SAFE CLEANUP (POST-ITERATION)
  // ---------------------------------------------------
  for (let i = vesicles.length - 1; i >= 0; i--) {
    if (vesicles[i].state === "RECYCLED") {
      vesicles.splice(i, 1);
    }
  }
}


// -----------------------------------------------------
// PUBLIC EXPORTS
// -----------------------------------------------------
window.updateVesicleRelease = updateVesicleRelease;
window.triggerVesicleReleaseFromAP = triggerVesicleReleaseFromAP;
