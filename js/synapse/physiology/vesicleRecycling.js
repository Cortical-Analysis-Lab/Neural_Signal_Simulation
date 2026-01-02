console.log("♻️ vesicleRecycling loaded");

// =====================================================
// VESICLE RECYCLING — BIOLOGICAL ENDOCYTOSIS
// Membrane Patch → Bud → Pinch → Return
// =====================================================
//
// ✔ Slow budding (visual)
// ✔ Gradual vesicle formation
// ✔ Migration back to cytosolic reserve
// ✔ No coupling to release or NT logic
//
// ⚠️ NO motion authority
// ⚠️ NO membrane enforcement
// ⚠️ Uses window.synapseVesicles ONLY
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

    // lifecycle
    timer: 0,
    stage: "PATCH", // PATCH → BUD → PINCH

    // geometry
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

  const CENTER_X = window.SYNAPSE_TERMINAL_CENTER_X;
  const CENTER_Y = window.SYNAPSE_TERMINAL_CENTER_Y;
  const RADIUS   = window.SYNAPSE_TERMINAL_RADIUS;
  const BACK     = window.SYNAPSE_BACK_OFFSET_X;
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
    // BUD — vesicle grows inward
    // =================================================
    else if (e.stage === "BUD") {

      e.radius = lerp(6, V_RADIUS, e.timer / 60);
      e.alpha  = lerp(180, 220, e.timer / 60);

      // Gentle inward pull (visual only)
      e.x += 0.35;
      e.y += (CENTER_Y - e.y) * 0.03;

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

        // Spawn ONE new EMPTY vesicle in cytosol
        const a = random(TWO_PI);
        const r = random(RADIUS * 0.25, RADIUS * 0.55);

        vesicles.push({
          x: CENTER_X + BACK + cos(a) * r * 0.5,
          y: CENTER_Y + sin(a) * r * 0.5,

          state: "empty",
          primedH: false,
          primedATP: false,
          nts: []
        });

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
