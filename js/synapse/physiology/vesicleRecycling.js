console.log("♻️ vesicleRecycling loaded — AUTHORITATIVE");

// =====================================================
// VESICLE RECYCLING — BIOLOGICAL ENDOCYTOSIS
// =====================================================
//
// ✔ Endocytosis seed → vesicle birth
// ✔ Directed return to reserve pool
// ✔ Hard exclusion from motion / release during travel
// ✔ Clean pool handoff (NO drift)
//
// AUTHORITATIVE RULES:
// • Presynaptic LOCAL space only
// • Recycling owns vesicles during RECYCLED_TRAVEL
// • Pools regain control ONLY after clean handoff
//
// =====================================================


// -----------------------------------------------------
// ENDOCYTOSIS SEEDS (PRESYNAPTIC LOCAL SPACE)
// -----------------------------------------------------
window.endocytosisSeeds = window.endocytosisSeeds || [];


// -----------------------------------------------------
// SPAWN ENDOCYTOSIS SEED (FROM vesicleRelease)
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
// UPDATE RECYCLING — AUTHORITATIVE
// -----------------------------------------------------
function updateVesicleRecycling() {

  const seeds    = window.endocytosisSeeds;
  const vesicles = window.synapseVesicles || [];

  const MAX_VES  = window.SYNAPSE_MAX_VESICLES;
  const V_RADIUS = window.SYNAPSE_VESICLE_RADIUS;

  const STOP_X = window.SYNAPSE_VESICLE_STOP_X;
  const BACK_X = window.SYNAPSE_BACK_OFFSET_X;

  // ===================================================
  // ENDOCYTOSIS SEED STATE MACHINE
  // ===================================================
  for (let i = seeds.length - 1; i >= 0; i--) {

    const e = seeds[i];
    e.timer++;

    // ---------------- PATCH ----------------
    if (e.stage === "PATCH") {
      e.radius = lerp(2, 6, e.timer / 40);
      if (e.timer >= 40) {
        e.stage = "BUD";
        e.timer = 0;
      }
    }

    // ---------------- BUD ----------------
    else if (e.stage === "BUD") {
      e.radius = lerp(6, V_RADIUS, e.timer / 60);
      e.alpha  = lerp(180, 220, e.timer / 60);
      if (e.timer >= 60) {
        e.stage = "PINCH";
        e.timer = 0;
      }
    }

    // ---------------- PINCH → VESICLE BIRTH ----------------
    else if (e.stage === "PINCH") {

      e.radius = lerp(V_RADIUS, V_RADIUS * 0.85, e.timer / 30);

      if (e.timer >= 30) {

        if (vesicles.length < MAX_VES) {

          vesicles.push({

            // Born just inside cytosol (LOCAL SPACE)
            x: e.x + V_RADIUS + random(8, 14),
            y: e.y + random(-4, 4),

            // Directed return toward reserve pool
            vx: random(0.12, 0.18),
            vy: random(-0.04, 0.04),

            radius: V_RADIUS,

            // --------------------------
            // TEMPORARY RECYCLING STATE
            // --------------------------
            state: "RECYCLED_TRAVEL",

            primedH: false,
            primedATP: false,
            nts: [],

            // 🔒 HARD EXCLUSION FLAGS
            releaseBias: false,
            recycleBias: true
          });
        }

        // Seed is consumed
        seeds.splice(i, 1);
      }
    }
  }

  // ===================================================
  // RECYCLED_TRAVEL → EMPTY (CLEAN POOL HANDOFF)
  // ===================================================
  const RESERVE_TARGET_X = STOP_X + BACK_X + 20;

  for (const v of vesicles) {

    if (v.state !== "RECYCLED_TRAVEL") continue;

    // Directed inward motion (NO Brownian, NO pools)
    v.vx += (RESERVE_TARGET_X - v.x) * 0.03;
    v.vx *= 0.82;
    v.vy *= 0.94;

    v.x += v.vx;
    v.y += v.vy;

    // --------------------------
    // AUTHORITATIVE HANDOFF
    // --------------------------
    if (v.x >= RESERVE_TARGET_X - 8) {

      // Snap directly into reserve pool bounds
      if (typeof getReservePoolRect === "function") {
        const pool = getReservePoolRect();
        const r = v.radius;

        v.x = random(pool.xMin + r, pool.xMax - r);
        v.y = random(pool.yMin + r, pool.yMax - r);
      }

      // Pool-compatible reset
      v.state = "EMPTY";
      v.recycleBias = false;

      // Kill residual energy
      v.vx = 0;
      v.vy = 0;
    }
  }
}


// -----------------------------------------------------
// DRAW ENDOCYTOSIS (VISUAL ONLY)
// -----------------------------------------------------
function drawVesicleRecycling() {

  if (!window.endocytosisSeeds.length) return;

  push();
  noStroke();

  for (const e of window.endocytosisSeeds) {
    fill(245, 225, 140, e.alpha);
    ellipse(e.x, e.y, e.radius * 2);
  }

  pop();
}


// -----------------------------------------------------
// EXPORTS
// -----------------------------------------------------
window.updateVesicleRecycling = updateVesicleRecycling;
window.drawVesicleRecycling  = drawVesicleRecycling;
