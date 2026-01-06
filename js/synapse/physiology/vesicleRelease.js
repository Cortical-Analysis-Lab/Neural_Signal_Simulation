console.log("⚡ vesicleRelease loaded");

// =====================================================
// VESICLE RELEASE — BIOLOGICAL FUSION + AP RECRUITMENT
// =====================================================
//
// ✔ AP triggers:
//   • 1 vesicle → fusion sequence
//   • nearby LOADED vesicles → LOADED_TRAVEL
//
// ✔ Release-owned motion only (X-normal to membrane)
// ✔ Pool-safe via releaseBias
// ✔ Plane-based docking (NO point attraction)
// ✔ Hard membrane lock during merge
// ✔ NTs detached before budding
// ✔ Recycling returns to pool corridor (no snapping)
// ✔ Delayed cleanup (no pop)
//
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
// RECYCLING OFFSET (MUST MATCH POOL GEOMETRY)
// -----------------------------------------------------
const RECYCLE_OFFSET =
  window.SYNAPSE_VESICLE_RADIUS * 2.5;


// -----------------------------------------------------
// CONTINUOUS APPROACH FORCE (RELEASE-OWNED, X ONLY)
// -----------------------------------------------------
function applyFusionApproachForce(v) {

  const targetX = window.SYNAPSE_VESICLE_STOP_X;
  const dx = targetX - v.x;

  const pull = constrain(dx * 0.025, -0.35, 0.35);

  v.vx += pull;

  // Integrate X only (radial plane)
  v.x += v.vx;

  // Damping
  v.vx *= 0.90;
  v.vy *= 0.95;
}


// -----------------------------------------------------
// AP TRIGGER — CALCIUM-GATED EVENT
// -----------------------------------------------------
function triggerVesicleReleaseFromAP() {

  const vesicles = window.synapseVesicles || [];

  const loaded = vesicles.filter(v =>
    v.state === "LOADED" &&
    v.releaseBias !== true
  );

  if (loaded.length === 0) return;

  loaded.sort((a, b) => a.x - b.x);

  // ===================================================
  // PRIMARY VESICLE — RELEASE OWNERSHIP
  // ===================================================
  const primary = loaded[0];

  primary.releaseBias = true;
  primary.owner       = "RELEASE";
  primary.ownerFrame  = frameCount;

  primary.state  = "DOCKING";
  primary.timer  = 0;

  primary.fusionProgress = 0;
  primary.poreRadius     = 0;
  primary.flatten        = 0;
  primary.mergePhase     = 1.0;

  primary.recycleHold   = Infinity;
  primary.__mergeLocked = false;

  primary.vy *= 0.3;


  // ===================================================
  // SECONDARY VESICLES — MOBILIZATION ONLY
  // ===================================================
  const MAX_RECRUIT = 3;

  for (let i = 1; i < loaded.length && i <= MAX_RECRUIT; i++) {
    const v = loaded[i];

    if (v.releaseBias) continue;

    v.state = "LOADED_TRAVEL";

    v.vx *= 0.4;
    v.vx -= random(0.08, 0.14);
    v.vy += random(-0.02, 0.02);
  }
}


// -----------------------------------------------------
// UPDATE RELEASE SEQUENCE (STATE MACHINE)
// -----------------------------------------------------
function updateVesicleRelease() {

  const vesicles = window.synapseVesicles || [];

  for (const v of vesicles) {

    if (v.releaseBias !== true) continue;

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
    // MEMBRANE MERGE — NTs DETACHED, HARD LOCK
    // =================================================
    else if (v.state === "MEMBRANE_MERGE") {

      if (!v.__mergeLocked) {
        v.__mergeLocked = true;
        v.vx = 0;
        v.vy = 0;

        // 🔑 NTs MUST NOT EXIST DURING BUDDING
        v.nts = [];
      }

      v.timer++;
      const t = constrain(v.timer / MERGE_TIME, 0, 1);

      v.flatten    = t;
      v.mergePhase = 1 - t;

      v.x = window.SYNAPSE_VESICLE_STOP_X;

      if (t >= 1) {

        if (typeof spawnEndocytosisSeed === "function") {
          spawnEndocytosisSeed(
            v.x + RECYCLE_OFFSET,
            v.y
          );
        }

        // -------------------------------------------------
        // RELEASE → RECYCLE TRAVEL (NOT POOL YET)
        // -------------------------------------------------
        v.releaseBias = false;
        v.recycleBias = true;

        v.state = "RECYCLE_TRAVEL";
        v.recycleHold = RECYCLE_HOLD_FRAMES;

        v.vx = random(0.06, 0.10);
        v.vy = random(-0.04, 0.04);
      }
    }

    // =================================================
    // RECYCLE TRAVEL — POOL SYSTEM TAKES OVER
    // =================================================
    else if (v.state === "RECYCLE_TRAVEL") {
      v.recycleHold--;
    }
  }
}


// -----------------------------------------------------
// EXPORTS
// -----------------------------------------------------
window.updateVesicleRelease = updateVesicleRelease;
window.triggerVesicleReleaseFromAP = triggerVesicleReleaseFromAP;
