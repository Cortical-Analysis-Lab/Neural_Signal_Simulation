console.log("♻️ vesicleRecycling loaded");

// =====================================================
// VESICLE RECYCLING — BIOLOGICAL ENDOCYTOSIS
// =====================================================
//
// Membrane Patch → Bud → Pinch → Return-to-Pool
//
// RESPONSIBILITIES:
// ✔ Visual endocytosis sequence
// ✔ Vesicle birth at fusion plane (single authority)
// ✔ Gentle cytosolic bias on birth (NO teleport)
// ✔ Clean handoff to pool system
//
// NON-RESPONSIBILITIES:
// ✘ No Brownian motion
// ✘ No confinement
// ✘ No loading or priming
// ✘ No fusion logic
//
// HARD RULES:
// • Newly born vesicles MUST start as EMPTY
// • Pool system owns them immediately
// • Recycling NEVER creates releaseBias vesicles
//
// =====================================================


// -----------------------------------------------------
// ENDOCYTOSIS SEEDS (MEMBRANE PATCHES)
// -----------------------------------------------------
window.endocytosisSeeds = window.endocytosisSeeds || [];


// -----------------------------------------------------
// SPAWN ENDOCYTOSIS SEED
// (CALLED BY vesicleRelease.js — WORLD SPACE)
// -----------------------------------------------------
window.spawnEndocytosisSeed = function (x, y) {

  window.endocytosisSeeds.push({
    x,
    y,

    timer: 0,
    stage: "PATCH", // PATCH → BUD → PINCH

    radius: 2,
    alpha: 180
  });
};


// -----------------------------------------------------
// UPDATE RECYCLING — STATE MACHINE + BIRTH
// -----------------------------------------------------
function updateVesicleRecycling() {

  const seeds    = window.endocytosisSeeds;
  const vesicles = window.synapseVesicles || [];

  const MAX_VES  = window.SYNAPSE_MAX_VESICLES;
  const V_RADIUS = window.SYNAPSE_VESICLE_RADIUS;

  // 🔴 SINGLE AUTHORITATIVE PHYSICS PLANE
  const fusionX = window.SYNAPSE_VESICLE_STOP_X;

  if (!Number.isFinite(fusionX)) {
    console.error("❌ SYNAPSE_VESICLE_STOP_X is invalid");
    return;
  }

  for (let i = seeds.length - 1; i >= 0; i--) {

    const e = seeds[i];
    e.timer++;

    // =================================================
    // PATCH — membrane indentation
    // =================================================
    if (e.stage === "PATCH") {

      e.radius = lerp(2, 6, e.timer / 40);

      if (e.timer >= 40) {
        e.stage = "BUD";
        e.timer = 0;
      }
    }

    // =================================================
    // BUD — vesicle curvature forms
    // =================================================
    else if (e.stage === "BUD") {

      e.radius = lerp(6, V_RADIUS, e.timer / 60);
      e.alpha  = lerp(180, 220, e.timer / 60);

      if (e.timer >= 60) {
        e.stage = "PINCH";
        e.timer = 0;
      }
    }

    // =================================================
    // PINCH — scission & vesicle birth
    // =================================================
    else if (e.stage === "PINCH") {

      e.radius = lerp(V_RADIUS, V_RADIUS * 0.85, e.timer / 30);

      if (e.timer >= 30) {

        // ---------------------------------------------
        // CREATE VESICLE (POOL-OWNED IMMEDIATELY)
        // ---------------------------------------------
        if (vesicles.length < MAX_VES) {

          vesicles.push({

            // Born just inside cytosol (right of fusion plane)
            x: fusionX + V_RADIUS + random(6, 12),
            y: e.y + random(-4, 4),

            // Gentle inward bias — pool motion takes over
            vx: random(0.03, 0.06),
            vy: random(-0.02, 0.02),

            radius: V_RADIUS,

            // ------------------------------------------
            // CANONICAL STATE
            // ------------------------------------------
            state: "EMPTY",

            primedH:   false,
            primedATP: false,
            nts:       [],

            // ------------------------------------------
            // OWNERSHIP FLAGS (POOL ONLY)
            // ------------------------------------------
            owner:       "POOL",
            ownerFrame:  frameCount,

            releaseBias: false,
            recycleBias: false
          });
        }

        // Remove seed — NO RESPAWN
        seeds.splice(i, 1);
      }
    }
  }
}


// -----------------------------------------------------
// DRAW ENDOCYTOSIS (VISUAL ONLY)
// -----------------------------------------------------
function drawVesicleRecycling() {

  push();
  noStroke();

  for (const e of window.endocytosisSeeds) {
    fill(245, 225, 140, e.alpha);
    ellipse(e.x, e.y, e.radius * 2);
  }

  pop();
}


// -----------------------------------------------------
// PUBLIC EXPORTS
// -----------------------------------------------------
window.updateVesicleRecycling = updateVesicleRecycling;
window.drawVesicleRecycling  = drawVesicleRecycling;
