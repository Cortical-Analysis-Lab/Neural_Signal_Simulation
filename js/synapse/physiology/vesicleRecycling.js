console.log("♻️ vesicleRecycling loaded — AUTHORITATIVE (SLOW + TRUE BUDDING)");

// =====================================================
// VESICLE RECYCLING — BIOLOGICAL ENDOCYTOSIS
// =====================================================
//
// ✔ Slow, readable membrane budding
// ✔ Patch → bud → pinch (membrane-anchored)
// ✔ Bud grows OUT of curved membrane
// ✔ Vesicle detaches ONLY at final pinch
//
// =====================================================


// -----------------------------------------------------
// ENDOCYTOSIS SEEDS
// -----------------------------------------------------
window.endocytosisSeeds = window.endocytosisSeeds || [];


// -----------------------------------------------------
// SPAWN ENDOCYTOSIS SEED (Y-LOCKED, MEMBRANE-X DYNAMIC)
// -----------------------------------------------------
window.spawnEndocytosisSeed = function (x, y) {
  window.endocytosisSeeds.push({
    y,
    timer: 0,
    stage: "PATCH",
    radius: 2,
    offset: 0,   // distance outward from membrane
    neck: 0,
    alpha: 160
  });
};


// -----------------------------------------------------
// UPDATE RECYCLING — AUTHORITATIVE
// -----------------------------------------------------
function updateVesicleRecycling() {

  const seeds    = window.endocytosisSeeds;
  const vesicles = window.synapseVesicles || [];

  const MAX_VES  = window.SYNAPSE_MAX_VESICLES;
  const R        = window.SYNAPSE_VESICLE_RADIUS;

  const STOP_X = window.SYNAPSE_VESICLE_STOP_X;
  const BACK_X = window.SYNAPSE_BACK_OFFSET_X;

  // ===================================================
  // ENDOCYTOSIS STATE MACHINE (SLOW + BIOLOGICAL)
  // ===================================================
  for (let i = seeds.length - 1; i >= 0; i--) {

    const e = seeds[i];
    e.timer++;

    // -------------------------
    // PATCH (membrane dimple)
    // -------------------------
    if (e.stage === "PATCH") {

      e.radius = lerp(2, 6, e.timer / 70);
      e.offset = lerp(0, 2, e.timer / 70);
      e.alpha  = lerp(140, 180, e.timer / 70);

      if (e.timer >= 70) {
        e.stage = "BUD";
        e.timer = 0;
      }
    }

    // -------------------------
    // BUD (sphere grows outward)
    // -------------------------
    else if (e.stage === "BUD") {

      e.radius = lerp(6, R, e.timer / 120);
      e.offset = lerp(2, R * 0.85, e.timer / 120);
      e.neck   = lerp(0, 6, e.timer / 120);
      e.alpha  = lerp(180, 220, e.timer / 120);

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
      e.offset = lerp(R * 0.85, R * 1.2, e.timer / 90);
      e.radius = lerp(R, R * 0.9, e.timer / 90);

      if (e.timer >= 90) {

        if (vesicles.length < MAX_VES) {

          const membraneX =
            window.getSynapticMembraneX?.(e.y) ?? 0;

          vesicles.push({
            x: membraneX + STOP_X + BACK_X + random(8, 14),
            y: e.y + random(-6, 6),

            vx: random(0.04, 0.07),
            vy: random(-0.03, 0.03),

            state: "RECYCLED_TRAVEL",
            recycleBias: true,

            nts: [],
            flatten: 0,
            clipX: undefined
          });
        }

        seeds.splice(i, 1);
      }
    }
  }

  // ===================================================
  // RECYCLED_TRAVEL → SOFT HANDOFF (SLOW)
  // ===================================================
  const RESERVE_TARGET_X = STOP_X + BACK_X + 20;

  for (const v of vesicles) {

    if (v.state !== "RECYCLED_TRAVEL") continue;

    const dx = RESERVE_TARGET_X - v.x;

    v.vx += dx * 0.015;
    v.vx *= 0.90;
    v.vy *= 0.92;

    v.x += v.vx;
    v.y += v.vy;

    if (dx > -6) {
      v.state = "EMPTY";
      v.recycleBias = false;
      v.vx *= 0.3;
      v.vy *= 0.3;
    }
  }
}


// -----------------------------------------------------
// DRAW ENDOCYTOSIS — TRUE MEMBRANE BUDDING
// -----------------------------------------------------
function drawVesicleRecycling() {

  if (!window.endocytosisSeeds.length) return;

  push();
  noStroke();

  for (const e of window.endocytosisSeeds) {

    const membraneX =
      window.getSynapticMembraneX?.(e.y) ?? 0;

    const baseX = membraneX + window.SYNAPSE_VESICLE_STOP_X;
    const budX  = baseX + e.offset;

    // Bud body
    fill(245, 225, 140, e.alpha);
    ellipse(budX, e.y, e.radius * 2);

    // Neck
    if (e.neck > 0) {
      stroke(245, 225, 140, e.alpha);
      strokeWeight(e.neck);
      line(
        baseX,
        e.y,
        budX - e.radius,
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
