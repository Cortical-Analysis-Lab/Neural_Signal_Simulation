console.log("♻️ synapse/vesicleRecycling loaded");

// =====================================================
// VESICLE RECYCLING — ENDOCYTOSIS → NEW VESICLE
// =====================================================
//
// ✔ Receives membrane "ghosts"
// ✔ Generates NEW vesicles
// ✔ No coupling to release logic
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
    timer: 0
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

  for (let i = endocytosisSeeds.length - 1; i >= 0; i--) {
    const e = endocytosisSeeds[i];
    e.timer++;

    // Slow inward pull
    e.x += 1.2;
    e.y += (CENTER_Y - e.y) * 0.05;

    // ---------------------------------------------
    // Endocytosis complete → spawn NEW vesicle
    // ---------------------------------------------
    if (e.timer > 40) {

      const a = random(TWO_PI);
      const r = random(18, RADIUS - 20);

      synapseVesicles.push({
        x: CENTER_X + BACK + cos(a) * r * 0.5,
        y: CENTER_Y + sin(a) * r * 0.5,
        dockOffsetY: random(-18, 18),
        state: VESICLE_STATE.EMPTY,
        timer: 0,
        nts: []
      });

      endocytosisSeeds.splice(i, 1);
    }
  }
}
