console.log("♻️ vesicleRecycling loaded");

// =====================================================
// VESICLE RECYCLING — BIOLOGICAL ENDOCYTOSIS
// Membrane Patch → Bud → Pinch → Return
// =====================================================
//
// ✔ Slow budding (visual)
// ✔ Gradual vesicle formation
// ✔ Safe return to cytosolic reserve
// ✔ No coupling to release or NT logic
//
// ⚠️ NO motion authority
// ⚠️ NO membrane enforcement
// ⚠️ VesiclePool owns placement & spacing
// =====================================================


// -----------------------------------------------------
// ENDOCYTOSIS SEEDS (MEMBRANE PATCHES)
// -----------------------------------------------------
window.endocytosisSeeds = window.endocytosisSeeds || [];

// Called by vesicleRelease.js
function spawnEndocytosisSeed(x, y) {
  window.endocytosisSeeds.push({
    x,
    y,

    timer: 0,
    stage: "PATCH", // PATCH → BUD → PINCH

    radius: 2,
    alpha: 180
  });
}


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
    // BUD — vesicle grows (NO TRANSLATION)
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
    // PINCH — scission & vesicle request
    // =================================================
    else if (e.stage === "PINCH") {

      e.radius = lerp(V_RADIUS, V_RADIUS * 0.85, e.timer / 30);

      if (e.timer >= 30) {

        // Respect pool size
        if (vesicles.length < MAX_VES) {

          // Defer placement to vesiclePool
          if (typeof requestNewEmptyVesicle === "function") {
            requestNewEmptyVesicle();
          } else {
            // Fallback (safe)
            vesicles.push({
              x: window.SYNAPSE_TERMINAL_CENTER_X +
                 window.SYNAPSE_BACK_OFFSET_X,
              y: window.SYNAPSE_TERMINAL_CENTER_Y,

              state: "empty",
              primedH: false,
              primedATP: false,
              nts: []
            });
          }
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
