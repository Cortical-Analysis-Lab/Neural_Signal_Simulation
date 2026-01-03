console.log("♻️ vesicleRecycling loaded");

// =====================================================
// VESICLE RECYCLING — BIOLOGICAL ENDOCYTOSIS
// Membrane Patch → Bud → Pinch → Return-to-Pool
// =====================================================
//
// ✔ Vesicles are born at membrane
// ✔ Gentle cytosolic return bias (NOT teleport)
// ✔ VesiclePool owns motion & constraints
// ✔ Safe with all existing logic
//
// ⚠️ NO Brownian motion
// ⚠️ NO constraint enforcement
// ⚠️ NO loading logic
// =====================================================


// -----------------------------------------------------
// ENDOCYTOSIS SEEDS (MEMBRANE PATCHES)
// -----------------------------------------------------
window.endocytosisSeeds = window.endocytosisSeeds || [];

// Called by vesicleRelease.js
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
// UPDATE RECYCLING
// -----------------------------------------------------
function updateVesicleRecycling() {

  const seeds    = window.endocytosisSeeds;
  const vesicles = window.synapseVesicles || [];

  const MAX_VES  = window.SYNAPSE_MAX_VESICLES;
  const V_RADIUS = window.SYNAPSE_VESICLE_RADIUS;

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
    // BUD — vesicle forms at membrane
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

        // Respect pool size
        if (vesicles.length < MAX_VES) {

          // ------------------------------------------------
          // CREATE NEW EMPTY VESICLE AT MEMBRANE
          // ------------------------------------------------
          const cy    = window.SYNAPSE_TERMINAL_CENTER_Y;
          const stopX = window.SYNAPSE_VESICLE_STOP_X;

          vesicles.push({
            // Born at membrane
            x: stopX + random(2, 6),
            y: e.y + random(-4, 4),

            // Gentle drift BACK into cytosol
            vx: random(0.04, 0.07),
            vy: random(-0.02, 0.02),

            // Core state
            state: "empty",
            primedH: false,
            primedATP: false,
            nts: [],

            // ------------------------------------------------
            // 🔑 RETURN BIAS FLAG
            // Allows pool to guide vesicle home
            // ------------------------------------------------
            recycleBias: true
          });
        }

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
// PUBLIC EXPORT
// -----------------------------------------------------
window.updateVesicleRecycling = updateVesicleRecycling;
window.drawVesicleRecycling   = drawVesicleRecycling;
