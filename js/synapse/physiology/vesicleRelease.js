console.log("⚡ vesicleRelease loaded — AUTHORITATIVE MEMBRANE HANDOFF");

// =====================================================
// VESICLE RELEASE — BIOLOGICAL FUSION + AP RECRUITMENT
// =====================================================
//
// RESPONSIBILITIES:
// ✔ AP-gated vesicle selection
// ✔ Plane-based docking (NO point attraction)
// ✔ Fusion → pore → open → merge
// ✔ NT release events (vesicle-authoritative membrane)
// ✔ NT removal BEFORE budding
// ✔ Clean recycle → pool handoff
//
// OWNERSHIP RULES:
// • releaseBias === true → THIS FILE OWNS MOTION
// • recycleBias === false → pools.js owns confinement
//
// =====================================================


// -----------------------------------------------------
// BIOLOGICAL TIMING
// -----------------------------------------------------
const DOCK_TIME   = 90;
const ZIPPER_TIME = 140;
const PORE_TIME   = 160;
const OPEN_TIME   = 220;
const MERGE_TIME  = 260;

const RECYCLE_HOLD_FRAMES = 40;


// -----------------------------------------------------
// RECYCLING OFFSET (LOCAL SPACE)
// -----------------------------------------------------
const RECYCLE_OFFSET =
  window.SYNAPSE_VESICLE_RADIUS * 2.5;


// -----------------------------------------------------
// RELEASE-OWNED APPROACH FORCE (PLANE ONLY)
// -----------------------------------------------------
function applyFusionApproachForce(v) {

  const targetX = window.SYNAPSE_VESICLE_STOP_X;
  const dx = targetX - v.x;

  const pull = constrain(dx * 0.025, -0.35, 0.35);

  v.vx += pull;
  v.x  += v.vx;

  v.vx *= 0.90;
  v.vy *= 0.95;
}


// -----------------------------------------------------
// AP TRIGGER — CALCIUM-GATED SELECTION
// -----------------------------------------------------
function triggerVesicleReleaseFromAP() {

  const vesicles = window.synapseVesicles || [];

  const loaded = vesicles.filter(v =>
    v.state === "LOADED" &&
    v.releaseBias !== true &&
    v.recycleBias !== true
  );

  if (loaded.length === 0) return;

  loaded.sort((a, b) => a.x - b.x);

  // ===================================================
  // PRIMARY VESICLE
  // ===================================================
  const primary = loaded[0];

  primary.releaseBias = true;
  primary.recycleBias = false;
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
  // SECONDARY VESICLES — MOBILIZATION
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
// UPDATE RELEASE SEQUENCE
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

      if (++v.timer >= DOCK_TIME) {
        v.state = "FUSION_ZIPPER";
        v.timer = 0;
      }
    }

    // =================================================
    // ZIPPER
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
            membraneX: v.x,   // 🔑 AUTHORITATIVE FIX
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

      if (v.timer % 10 === 0) {
        window.dispatchEvent(new CustomEvent("synapticRelease", {
          detail: {
            x: v.x + random(-2, 2),
            y: v.y + random(-2, 2),
            membraneX: v.x,   // 🔑 ALWAYS PASS MEMBRANE
            normalX: -1,
            strength: 1.0
          }
        }));
      }

      if (++v.timer >= OPEN_TIME) {
        v.state = "MEMBRANE_MERGE";
        v.timer = 0;
      }
    }

    // =================================================
    // MEMBRANE MERGE
    // =================================================
    else if (v.state === "MEMBRANE_MERGE") {

      if (!v.__mergeLocked) {
        v.__mergeLocked = true;
        v.vx = 0;
        v.vy = 0;
        v.nts = [];
      }

      v.timer++;
      const t = constrain(v.timer / MERGE_TIME, 0, 1);

      v.flatten    = t;
      v.mergePhase = 1 - t;

      v.x = window.SYNAPSE_VESICLE_STOP_X;

      if (t >= 1) {

        spawnEndocytosisSeed?.(
          v.x + RECYCLE_OFFSET,
          v.y
        );

        v.releaseBias = false;
        v.recycleBias = true;

        v.state = "RECYCLE_TRAVEL";
        v.recycleHold = RECYCLE_HOLD_FRAMES;

        v.vx = random(0.06, 0.10);
        v.vy = random(-0.04, 0.04);
      }
    }

    // =================================================
    // RECYCLE TRAVEL → POOL HANDOFF
    // =================================================
    else if (v.state === "RECYCLE_TRAVEL") {

      if (--v.recycleHold <= 0) {

        // 🔁 POOL AUTHORITY RESUMES IMMEDIATELY
        v.releaseBias = false;
        v.recycleBias = false;
        v.owner       = null;

        v.flatten        = undefined;
        v.mergePhase     = undefined;
        v.poreRadius     = undefined;
        v.__mergeLocked  = false;

        v.state = "EMPTY";
        v.timer = 0;

        v.vx = 0;
        v.vy = 0;
      }
    }
  }
}


// -----------------------------------------------------
// EXPORTS
// -----------------------------------------------------
window.updateVesicleRelease = updateVesicleRelease;
window.triggerVesicleReleaseFromAP = triggerVesicleReleaseFromAP;
