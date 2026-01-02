console.log("♻️ synapse/vesicleRecycling loaded");

// =====================================================
// VESICLE RECYCLING — BIOLOGICAL ENDOCYTOSIS
// Membrane Patch → Bud → Pinch → Return
// =====================================================
//
// ✔ Slow budding (visual)
// ✔ Gradual vesicle formation
// ✔ Migration back to loading zone
// ✔ No coupling to release or NT logic
// =====================================================

// -----------------------------------------------------
// ENDOCYTOSIS SEEDS (membrane patches)
// -----------------------------------------------------
window.endocytosisSeeds = window.endocytosisSeeds || [];

// Called by vesicleRelease.js
function spawnEndocytosisSeed(x, y) {
  endocytosisSeeds.push({
    x,
    y,

    // lifecycle
    timer: 0,
    stage: "PATCH", // PATCH → BUD → PINCH → RETURN

    // geometry
    radius: 2,
    alpha: 180
  });
}

// -----------------------------------------------------
// UPDATE RECYCLING
// -----------------------------------------------------
function updateVesicleRecycling() {

  const CENTER_X = window.SYNAPSE_TERMINAL_CENTER_X;
  const CENTER_Y = window.SYNAPSE_TERMINAL_CENTER_Y;
  const RADIUS   = window.SYNAPSE_TERMINAL_RADIUS;
  const BACK     = window.SYNAPSE_BACK_OFFSET_X;
  const V_RADIUS = window.SYNAPSE_VESICLE_RADIUS;

  for (let i = endocytosisSeeds.length - 1; i >= 0; i--) {
    const e = endocytosisSeeds[i];
    e.timer++;

    // =================================================
    // PATCH — membrane indentation
    // =================================================
    if (e.stage === "PATCH") {

      e.radius = lerp(2, 6, e.timer / 40);

      if (e.timer > 40) {
        e.stage = "BUD";
        e.timer = 0;
      }
    }

    // =================================================
    // BUD — vesicle grows outward
    // =================================================
    else if (e.stage === "BUD") {

      e.radius = lerp(6, V_RADIUS, e.timer / 60);
      e.alpha  = lerp(180, 220, e.timer / 60);

      // Gentle inward pull
      e.x += 0.3;
      e.y += (CENTER_Y - e.y) * 0.03;

      if (e.timer > 60) {
        e.stage = "PINCH";
        e.timer = 0;
      }
    }

    // =================================================
    // PINCH — scission event
    // =================================================
    else if (e.stage === "PINCH") {

      e.radius = lerp(V_RADIUS, V_RADIUS * 0.85, e.timer / 30);

      if (e.timer > 30) {

        // Spawn NEW EMPTY vesicle
        const a = random(TWO_PI);
        const r = random(18, RADIUS - 24);

        synapseVesicles.push({
          x: CENTER_X + BACK + cos(a) * r * 0.5,
          y: CENTER_Y + sin(a) * r * 0.5,

          dockOffsetY: random(-18, 18),
          state: VESICLE_STATE.EMPTY,
          timer: 0,
          nts: []
        });

        endocytosisSeeds.splice(i, 1);
        continue;
      }
    }
  }
}

// -----------------------------------------------------
// DRAW ENDOCYTOSIS (OPTIONAL BUT HIGHLY RECOMMENDED)
// -----------------------------------------------------
function drawVesicleRecycling() {
  push();
  noStroke();

  for (const e of endocytosisSeeds) {
    fill(245, 225, 140, e.alpha);
    ellipse(e.x, e.y, e.radius * 2);
  }

  pop();
}
