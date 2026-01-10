console.log("⚡ vesicleRelease loaded — AUTHORITATIVE MEMBRANE HANDOFF");

// =====================================================
// VESICLE RELEASE — MULTIVESICULAR (AUTHORITATIVE)
// =====================================================
//
// RESPONSIBILITIES:
// ✔ AP-gated vesicle selection
// ✔ Plane-based docking (NO point attraction)
// ✔ Vesicle motion across membrane plane
// ✔ NT release events (vesicle-authoritative membrane)
// ✔ NT removal BEFORE budding
// ✔ Clean recycle → recycling handoff
//
// OWNERSHIP RULES:
// • releaseBias === true → THIS FILE OWNS MOTION
// • recycleBias === true → vesicleRecycling.js owns motion
// • Geometry owns ALL visual fusion illusion
//
// =====================================================


// -----------------------------------------------------
// LOCAL SPACE UN-ROTATION (CRITICAL)
// -----------------------------------------------------
function unrotateLocal(x, y) {
  return { x: -x, y: -y };
}


// -----------------------------------------------------
// BIOLOGICAL TIMING (FRAMES)
// -----------------------------------------------------
const DOCK_TIME   = 90;
const ZIPPER_TIME = 140;
const PORE_TIME   = 160;
const OPEN_TIME   = 220;
const MERGE_TIME  = 260;

const RECYCLE_HOLD_FRAMES = 40;


// -----------------------------------------------------
// MULTIVESICULAR JITTER
// -----------------------------------------------------
const RELEASE_JITTER_MIN = 0;
const RELEASE_JITTER_MAX = 18;


// -----------------------------------------------------
// RECYCLING OFFSET (LOCAL SPACE)
// -----------------------------------------------------
const RECYCLE_OFFSET =
  window.SYNAPSE_VESICLE_RADIUS * 2.5;


// -----------------------------------------------------
// RELEASE-OWNED APPROACH FORCE (SOFT, PLANE ONLY)
// -----------------------------------------------------
function applyFusionApproachForce(v) {

  const targetX =
    window.SYNAPSE_VESICLE_STOP_X + (v.dockBiasX ?? 0);

  const dx   = targetX - v.x;
  const dist = Math.abs(dx);

  // Distance-weighted pull (gentle near membrane)
  const strength = map(dist, 0, 40, 0.004, 0.025, true);
  const pull     = constrain(dx * strength, -0.35, 0.35);

  v.vx += pull;

  // Motion integration (RELEASE owns motion)
  v.x += v.vx;
  v.y += v.vy;

  v.vx *= 0.90;
  v.vy *= 0.95;
}


// -----------------------------------------------------
// AP TRIGGER — MULTIVESICULAR
// -----------------------------------------------------
function triggerVesicleReleaseFromAP() {

  const vesicles = window.synapseVesicles || [];

  const ready = vesicles.filter(v =>
    v.state === "LOADED" &&
    v.releaseBias !== true &&
    v.recycleBias !== true
  );

  if (!ready.length) return;

  for (const v of ready) {

    v.releaseBias = true;
    v.recycleBias = false;

    v.owner      = "RELEASE";
    v.ownerFrame = frameCount;

    // Per-vesicle docking micro-offset (anti-clustering)
    v.dockBiasX = random(-2.5, 2.5);
    v.dockBiasY = random(-3, 3);

    v.state  = "DOCKING";
    v.timer  = -Math.floor(
      random(RELEASE_JITTER_MIN, RELEASE_JITTER_MAX)
    );

    // Geometry-facing parameters (read-only there)
    v.flatten    = 0;
    v.mergePhase = 1.0;

    v.recycleHold   = Infinity;
    v.__mergeLocked = false;

    v.vy *= 0.3;
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

      if (v.timer < 0) {
        v.timer++;
        continue;
      }

      applyFusionApproachForce(v);

      if (++v.timer >= DOCK_TIME) {
        v.state = "FUSION_ZIPPER";
        v.timer = 0;
      }
    }

    // =================================================
    // ZIPPER — SLIDE ONTO MEMBRANE
    // =================================================
    else if (v.state === "FUSION_ZIPPER") {

      applyFusionApproachForce(v);

      v.timer++;
      const t = constrain(v.timer / ZIPPER_TIME, 0, 1);

      // Early flattening cue for geometry
      v.flatten = t * 0.35;

      if (t >= 1) {
        v.state = "FUSION_PORE";
        v.timer = 0;
      }
    }

    // =================================================
    // FUSION PORE — NT RELEASE
    // =================================================
    else if (v.state === "FUSION_PORE") {

      v.timer++;

      if (v.timer === Math.floor(PORE_TIME * 0.35)) {

        const p = unrotateLocal(v.x, v.y);

        window.dispatchEvent(new CustomEvent("synapticRelease", {
          detail: {
            x: p.x,
            y: p.y,
            membraneX: p.x,
            normalX: -1,
            strength: 1.0
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

      if (v.timer % 10 === 0) {

        const p = unrotateLocal(
          v.x + random(-2, 2),
          v.y + random(-2, 2)
        );

        window.dispatchEvent(new CustomEvent("synapticRelease", {
          detail: {
            x: p.x,
            y: p.y,
            membraneX: p.x,
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
    // MEMBRANE MERGE — FULL OVERLAY → DISAPPEAR
    // =================================================
    else if (v.state === "MEMBRANE_MERGE") {

      if (!v.__mergeLocked) {
        v.__mergeLocked = true;

        // Soften motion but do not kill it
        v.vx *= 0.25;
        v.vy *= 0.25;

        // NTs must be gone before endocytosis
        v.nts = [];
      }

      v.timer++;
      const t = constrain(v.timer / MERGE_TIME, 0, 1);

      v.flatten    = t;
      v.mergePhase = 1 - t;

      // Continue sliding OVER membrane plane
      v.x += (window.SYNAPSE_VESICLE_STOP_X - v.x) * 0.35;

      if (t >= 1) {

        spawnEndocytosisSeed?.(
          v.x + RECYCLE_OFFSET,
          v.y
        );

        v.releaseBias = false;
        v.recycleBias = true;

        v.state = "RECYCLED_TRAVEL";
        v.recycleHold = RECYCLE_HOLD_FRAMES;

        v.vx = random(0.06, 0.10);
        v.vy = random(-0.04, 0.04);
      }
    }
  }
}


// -----------------------------------------------------
// EXPORTS
// -----------------------------------------------------
window.updateVesicleRelease = updateVesicleRelease;
window.triggerVesicleReleaseFromAP = triggerVesicleReleaseFromAP;
