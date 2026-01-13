console.log("♻️ vesicleRecycling loaded — AUTHORITATIVE (SLOW + BUDDING)");

// =====================================================
// VESICLE RECYCLING — BIOLOGICAL ENDOCYTOSIS
// =====================================================
//
// ✔ Slower, readable endocytosis
// ✔ Patch → bud → pinch (membrane-attached)
// ✔ Vesicle detaches ONLY at final pinch
// ✔ Smooth return to reserve pool
//
// =====================================================


// -----------------------------------------------------
// ENDOCYTOSIS SEEDS
// -----------------------------------------------------
window.endocytosisSeeds = window.endocytosisSeeds || [];


// -----------------------------------------------------
// SPAWN ENDOCYTOSIS SEED (MEMBRANE-LOCKED)
// -----------------------------------------------------
window.spawnEndocytosisSeed = function (x, y) {
  window.endocytosisSeeds.push({
    x,
    y,
    timer: 0,
    stage: "PATCH",
    radius: 2,
    neck: 0,
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
  // ENDOCYTOSIS SEED STATE MACHINE (SLOW + BIOLOGICAL)
  // ===================================================
  for (let i = seeds.length - 1; i >= 0; i--) {

    const e = seeds[i];
    e.timer++;

    // -------------------------
    // PATCH (membrane dimple)
    // -------------------------
    if (e.stage === "PATCH") {

      e.radius = lerp(2, 6, e.timer / 70);
      e.alpha  = lerp(140, 190, e.timer / 70);

      if (e.timer >= 70) {
        e.stage = "BUD";
        e.timer = 0;
      }
    }

    // -------------------------
    // BUD (growing sphere)
    // -------------------------
    else if (e.stage === "BUD") {

      e.radius = lerp(6, V_RADIUS, e.timer / 120);
      e.neck   = lerp(0, 6, e.timer / 120);
      e.alpha  = lerp(190, 220, e.timer / 120);

      if (e.timer >= 120) {
        e.stage = "PINCH";
        e.timer = 0;
      }
    }

    // -------------------------
    // PINCH (neck constriction)
    // -------------------------
    else if (e.stage === "PINCH") {

      e.neck   = lerp(6, 0, e.timer / 90);
      e.radius = lerp(V_RADIUS, V_RADIUS * 0.9, e.timer / 90);

      if (e.timer >= 90) {

        // ----------- Detach vesicle -----------
        if (vesicles.length < MAX_VES) {

          vesicles.push({

            // Start just cytosolic to membrane
            x: e.x + V_RADIUS + random(6, 12),
            y: e.y + random(-6, 6),

            vx: random(0.04, 0.07),
            vy: random(-0.03, 0.03),

            radius: V_RADIUS,

            recycleBiasX: random(-10, 10),
            recycleBiasY: random(-12, 12),

            state: "RECYCLED_TRAVEL",

            primedH: false,
            primedATP: false,
            nts: [],

            releaseBias: false,
            recycleBias: true,

            flatten: 0,
            clipX: undefined
          });
        }

        seeds.splice(i, 1);
      }
    }
  }

  // ===================================================
  // RECYCLED_TRAVEL → SOFT HANDOFF (SLOWER)
  // ===================================================
  const RESERVE_TARGET_X = STOP_X + BACK_X + 20;

  for (const v of vesicles) {

    if (v.state !== "RECYCLED_TRAVEL") continue;

    const dx =
      (RESERVE_TARGET_X + (v.recycleBiasX ?? 0)) - v.x;

    v.vx += dx * 0.015;
    v.vy += (v.recycleBiasY ?? 0) * 0.002;

    v.vx *= 0.90;
    v.vy *= 0.92;

    v.x += v.vx;
    v.y += v.vy;

    // --------------------------
    // CLEAN HANDOFF
    // --------------------------
    if (dx > -6) {

      v.state = "EMPTY";
      v.recycleBias = false;

      v.vx *= 0.3;
      v.vy *= 0.3;

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

    // Bud body
    fill(245, 225, 140, e.alpha);
    ellipse(e.x, e.y, e.radius * 2);

    // Neck (during bud/pinch)
    if (e.neck > 0) {
      stroke(245, 225, 140, e.alpha);
      strokeWeight(e.neck);
      line(
        e.x - e.radius,
        e.y,
        e.x - e.radius - 6,
        e.y
      );
    }
  }

  pop();
}


// -----------------------------------------------------
// EXPORTS
// -----------------------------------------------------
window.updateVesicleRecycling = updateVesicleRecycling;
window.drawVesicleRecycling  = drawVesicleRecycling;
