console.log("⚡ vesicleRelease loaded");

// =====================================================
// VESICLE RELEASE — BIOLOGICAL FUSION (STATE-ONLY)
// Dock → Zipper → Pore → Open → Merge
// =====================================================
//
// ✔ Continuous membrane-directed movement
// ✔ Radial (Y) position preserved
// ✔ Pool-safe (velocity bias only)
// ✔ Visible collapse: full → arc → gone
// ✔ Hard membrane lock during merge
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
// CONTINUOUS APPROACH FORCE
// -----------------------------------------------------
function applyFusionApproachForce(v) {

  const targetX = window.SYNAPSE_VESICLE_STOP_X;
  const dx = targetX - v.x;

  // Distance-scaled pull toward membrane
  const pull = constrain(dx * 0.025, -0.35, 0.35);

  v.vx += pull;

  // Suppress vertical drift (radial alignment)
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
  v.state  = "DOCKING";
  v.timer  = 0;

  // -------------------------------
  // RELEASE FLAGS (CRITICAL)
  // -------------------------------
  v.releaseBias = true;   // pool will not constrain

  // -------------------------------
  // VISUAL / GEOMETRY STATE
  // -------------------------------
  v.fusionProgress = 0;
  v.poreRadius     = 0;
  v.flatten        = 0;   // 🔑 geometry driver (0 → 1)
  v.mergePhase     = 1.0;
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
    // FUSION ZIPPER
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
    // FUSION PORE
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
    // FUSION OPEN
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
    // MEMBRANE MERGE — HARD LOCK + COLLAPSE
    // =================================================
    else if (v.state === "MEMBRANE_MERGE") {

      v.timer++;
      const t = constrain(v.timer / MERGE_TIME, 0, 1);

      // 🔑 Drive geometry (consumed by vesicleGeometry.js)
      v.flatten    = t;        // 0 → 1
      v.mergePhase = 1 - t;

      // 🔒 HARD MEMBRANE LOCK — NO GAP POSSIBLE
      v.x  = window.SYNAPSE_VESICLE_STOP_X;
      v.vx = 0;
      v.vy *= 0.85;

      if (t >= 1) {

        if (typeof spawnEndocytosisSeed === "function") {
          spawnEndocytosisSeed(v.x, v.y);
        }

        v.state = "RECYCLED";
      }
    }
  }

  // ---------------------------------------------------
  // SAFE CLEANUP
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
