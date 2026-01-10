console.log("♻️ vesicleRecycling loaded — AUTHORITATIVE");

// =====================================================
// VESICLE RECYCLING — BIOLOGICAL ENDOCYTOSIS
// =====================================================
//
// ✔ Endocytosis seed → vesicle birth
// ✔ Directed return to reserve pool
// ✔ Smooth, gliding handoff
// ✔ No teleportation
//
// AUTHORITATIVE RULES:
// • Presynaptic LOCAL space only
// • Recycling owns vesicles during RECYCLED_TRAVEL
// • Pools regain control ONLY after clean handoff
//
// =====================================================


// -----------------------------------------------------
// ENDOCYTOSIS SEEDS
// -----------------------------------------------------
window.endocytosisSeeds = window.endocytosisSeeds || [];


// -----------------------------------------------------
// SPAWN ENDOCYTOSIS SEED
// -----------------------------------------------------
window.spawnEndocytosisSeed = function (x, y) {
  window.endocytosisSeeds.push({
    x,
    y,
    timer: 0,
    stage: "PATCH",
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

    if (e.stage === "PATCH") {
      e.radius = lerp(2, 6, e.timer / 40);
      if (e.timer >= 40) {
        e.stage = "BUD";
        e.timer = 0;
      }
    }

    else if (e.stage === "BUD") {
      e.radius = lerp(6, V_RADIUS, e.timer / 60);
      e.alpha  = lerp(180, 220, e.timer / 60);
      if (e.timer >= 60) {
        e.stage = "PINCH";
        e.timer = 0;
      }
    }

    else if (e.stage === "PINCH") {

      e.radius = lerp(V_RADIUS, V_RADIUS * 0.85, e.timer / 30);

      if (e.timer >= 30) {

        if (vesicles.length < MAX_VES) {

          vesicles.push({

            x: e.x + V_RADIUS + random(8, 14),
            y: e.y + random(-6, 6),

            vx: random(0.10, 0.16),
            vy: random(-0.04, 0.04),

            radius: V_RADIUS,

            // Per-vesicle return bias (anti-cluster)
            recycleBiasX: random(-8, 8),
            recycleBiasY: random(-10, 10),

            state: "RECYCLED_TRAVEL",

            primedH: false,
            primedATP: false,
            nts: [],

            releaseBias: false,
            recycleBias: true
          });
        }

        seeds.splice(i, 1);
      }
    }
  }

  // ===================================================
  // RECYCLED_TRAVEL → SOFT HANDOFF
  // ===================================================
  const RESERVE_TARGET_X = STOP_X + BACK_X + 20;

  for (const v of vesicles) {

    if (v.state !== "RECYCLED_TRAVEL") continue;

    // Soft inward glide (no snap)
    const dx = (RESERVE_TARGET_X + (v.recycleBiasX ?? 0)) - v.x;
    v.vx += dx * 0.02;

    v.vx *= 0.88;
    v.vy *= 0.90;

    v.x += v.vx;
    v.y += v.vy;

    // --------------------------
    // CLEAN, SMOOTH HANDOFF
    // --------------------------
    if (dx > -6) {

      v.state = "EMPTY";
      v.recycleBias = false;

      // Gentle energy decay
      v.vx *= 0.35;
      v.vy *= 0.35;

      // Remove recycle-only properties
      delete v.recycleBiasX;
      delete v.recycleBiasY;
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
