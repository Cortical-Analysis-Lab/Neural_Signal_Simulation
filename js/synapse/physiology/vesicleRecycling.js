console.log("♻️ vesicleRecycling loaded");

// =====================================================
// VESICLE RECYCLING — BIOLOGICAL ENDOCYTOSIS
// =====================================================
//
// Membrane Patch → Bud → Pinch → Return-to-Pool
//
// ✔ Vesicles are born at DOCK plane (geometry + release owned)
// ✔ Gentle cytosolic return bias (NOT teleport)
// ✔ Pool owns all motion & constraints after birth
// ✔ Safe with vesiclePools / vesicleMotion / vesicleLoading
//
// NON-RESPONSIBILITIES:
// ✘ No Brownian motion
// ✘ No spatial clamping
// ✘ No loading or priming
// ✘ No fusion logic
// =====================================================


// -----------------------------------------------------
// ENDOCYTOSIS SEEDS (MEMBRANE PATCHES)
// -----------------------------------------------------
window.endocytosisSeeds = window.endocytosisSeeds || [];

// Called by vesicleRelease.js (DOCK-space coordinates)
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
// UPDATE RECYCLING (STATE + BIRTH ONLY)
// -----------------------------------------------------
function updateVesicleRecycling() {

  const seeds    = window.endocytosisSeeds;
  const vesicles = window.synapseVesicles || [];

  const MAX_VES  = window.SYNAPSE_MAX_VESICLES;
  const V_RADIUS = window.SYNAPSE_VESICLE_RADIUS;

  // ⚠️ Dock plane is authoritative for birth ONLY
  const dockX = window.SYNAPSE_DOCK_X;

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

        // Respect pool capacity
        if (vesicles.length < MAX_VES) {

          // ------------------------------------------------
          // CREATE NEW EMPTY VESICLE (POOL OWNERSHIP)
          // ------------------------------------------------
          vesicles.push({

            // Born just inside cytosol (right of dock plane)
            x: dockX + V_RADIUS + random(6, 10),
            y: e.y + random(-4, 4),

            // Gentle inward bias (pool motion will take over)
            vx: random(0.03, 0.06),
            vy: random(-0.02, 0.02),

            // ------------------------------------------------
            // CANONICAL STATE (MATCHES OTHER SYSTEMS)
            // ------------------------------------------------
            state: "EMPTY",

            primedH:   false,
            primedATP: false,
            nts:       [],

            // ------------------------------------------------
            // OWNERSHIP FLAGS (CRITICAL)
            // ------------------------------------------------
            owner:       "POOL",
            ownerFrame:  frameCount,

            releaseBias: false,
            recycleBias: false
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
// PUBLIC EXPORTS
// -----------------------------------------------------
window.updateVesicleRecycling = updateVesicleRecycling;
window.drawVesicleRecycling  = drawVesicleRecycling;
