console.log("♻️ synapse/vesicleRecycling loaded");

// =====================================================
// VESICLE RECYCLING — ENDOCYTOSIS → BUD → RETURN
// =====================================================
//
// ✔ Vesicle membrane merges completely during release
// ✔ New vesicle slowly buds from membrane
// ✔ Vesicle migrates back to loading pool
// ✔ Fully decoupled from release & loading logic
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
    y0: y,
    radius: 2,        // starts as tiny pit
    phase: "PIT",     // PIT → BUD → FREE
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
  const V_RADIUS = window.SYNAPSE_VESICLE_RADIUS;

  for (let i = endocytosisSeeds.length - 1; i >= 0; i--) {
    const e = endocytosisSeeds[i];
    e.timer++;

    // -------------------------------------------------
    // PHASE 1 — MEMBRANE PIT FORMS
    // -------------------------------------------------
    if (e.phase === "PIT") {

      // Slight inward pull
      e.x += 0.6;
      e.y += (CENTER_Y - e.y) * 0.05;

      // Grow pit curvature
      e.radius += 0.15;

      if (e.radius >= V_RADIUS * 0.6) {
        e.phase = "BUD";
        e.timer = 0;
      }
    }

    // -------------------------------------------------
    // PHASE 2 — BUD PINCHES OFF
    // -------------------------------------------------
    else if (e.phase === "BUD") {

      // Bud rounds out
      e.radius += 0.25;

      // Slight detachment drift
      e.x += 0.9;
      e.y += (CENTER_Y - e.y) * 0.04;

      if (e.radius >= V_RADIUS) {
        e.phase = "FREE";
        e.timer = 0;

        // Convert bud → free vesicle
        synapseVesicles.push({
          x: e.x,
          y: e.y,
          dockOffsetY: random(-18, 18),
          state: VESICLE_STATE.EMPTY,
          timer: 0,
          nts: []
        });

        endocytosisSeeds.splice(i, 1);
      }
    }
  }
}

// -----------------------------------------------------
// DRAW ENDOCYTOSIS (OPTIONAL, BIO-STYLE)
// -----------------------------------------------------
function drawEndocytosisSeeds() {
  push();
  noFill();
  stroke(180, 220, 255, 180);
  strokeWeight(2);

  for (const e of endocytosisSeeds) {
    ellipse(e.x, e.y, e.radius * 2);
  }

  pop();
}
