console.log("⚡ vesicleRelease loaded");

// =====================================================
// VESICLE RELEASE — BIOLOGICAL FUSION (STATE-ONLY)
// Dock → Zipper → Pore → Open → Merge → Hold → Recycle
// =====================================================
//
// ✔ Continuous membrane-directed movement (pre-fusion)
// ✔ Radial (Y) position preserved
// ✔ Pool-safe (velocity bias only)
// ✔ Visible collapse: sealed → omega → gone
// ✔ HARD membrane lock during merge (NO GAP)
// ✔ Delayed recycling (no redraw pop)
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

const RECYCLE_HOLD_FRAMES = 40;


// -----------------------------------------------------
// CONTINUOUS APPROACH FORCE (PRE-FUSION ONLY)
// -----------------------------------------------------
function applyFusionApproachForce(v) {

  const targetX = window.SYNAPSE_VESICLE_STOP_X;
  const dx = targetX - v.x;

  // Distance-scaled pull toward membrane
  const pull = constrain(dx * 0.025, -0.35, 0.35);

  v.vx += pull;

  // Suppress radial drift
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
  v.releaseBias = true;

  // -------------------------------
  // GEOMETRY DRIVERS
  // -------------------------------
  v.fusionProgress = 0;
  v.poreRadius     = 0;
  v.flatten        = 0;
  v.mergePhase     = 1.0;

  // -------------------------------
  // INTERNAL LOCK
  // -------------------------------
  v.__mergeLocked = false;
}


// -----------------------------------------------------
// UPDATE RELEASE SEQUENCE (STATE-ONLY)
// -----------------------------------------------------
function updateVesicleRelease() {

  const vesicles = window.synapseVesicles || [];

  // ===================================================
  // PER-VESICLE STATE MACHINE
  // ===================================================
  for (const v of vesicles) {

    // -----------------------------------------------
    // SAFETY ASSERT — SHOULD NEVER DRIFT
    // -----------------------------------------------
    if (
      v.releaseBias === true &&
      v.state !== "DOCKING" &&
      Math.abs(v.x - window.SYNAPSE_VESICLE_STOP_X) > 0.01
    ) {
      console.error("❌ RELEASE VESICLE MOVED:", v.state, v.x);
    }

    // =================================================
    // DOCKING
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

      // Initial quantal leak
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
    // MEMBRANE MERGE — HARD LOCK
    // =================================================
    else if (v.state === "MEMBRANE_MERGE") {

      if (!v.__mergeLocked) {
        v.__mergeLocked = true;
        v.vx = 0;
        v.vy = 0;
      }

      v.timer++;
      const t = constrain(v.timer / MERGE_TIME, 0, 1);

      v.flatten    = t;
      v.mergePhase = 1 - t;

      // ABSOLUTE membrane lock
      v.x = window.SYNAPSE_VESICLE_STOP_X;

      if (t >= 1) {

        if (typeof spawnEndocytosisSeed === "function") {
          spawnEndocytosisSeed(v.x, v.y);
        }

        v.state       = "RECYCLED";
        v.recycleHold = RECYCLE_HOLD_FRAMES;
      }
    }

    // =================================================
    // RECYCLED — VISUAL HOLD
    // =================================================
    else if (v.state === "RECYCLED") {
      v.recycleHold--;
    }
  }

  // ===================================================
  // SAFE CLEANUP
  // ===================================================
  for (let i = vesicles.length - 1; i >= 0; i--) {
    const v = vesicles[i];
    if (v.state === "RECYCLED" && v.recycleHold <= 0) {
      vesicles.splice(i, 1);
    }
  }
}


// -----------------------------------------------------
// PUBLIC EXPORTS
// -----------------------------------------------------
window.updateVesicleRelease = updateVesicleRelease;
window.triggerVesicleReleaseFromAP = triggerVesicleReleaseFromAP;
