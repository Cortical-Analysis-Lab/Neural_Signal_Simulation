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
// SPAWN ENDOCYTOSIS SEED (MEMBRANE-LOCKED)
// -----------------------------------------------------
window.spawnEndocytosisSeed = function (x, y) {
  window.endocytosisSeeds.push({
    y,
    timer: 0,
    stage: "PATCH",

    radius: 2,
    offset: 0,      // distance outward from membrane
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
    // PATCH — shallow dimple
    // -------------------------
    if (e.stage === "PATCH") {

      e.radius = lerp(2, 6, e.timer / 80);
      e.offset = lerp(0, 3, e.timer / 80);
      e.alpha  = lerp(130, 180, e.timer / 80);

      if (e.timer >= 80) {
        e.stage = "BUD";
        e.timer = 0;
      }
    }

    // -------------------------
    // BUD — sphere grows OUTWARD
    // -------------------------
    else if (e.stage === "BUD") {

      e.radius = lerp(6, R, e.timer / 150);
      e.offset = lerp(3, R * 1.05, e.timer / 150);
      e.neck   = lerp(0, 8, e.timer / 150);
      e.alpha  = lerp(180, 230, e.timer / 150);

      if (e.timer >= 150) {
        e.stage = "PINCH";
        e.timer = 0;
      }
    }

    // -------------------------
    // PINCH — neck constriction
    // -------------------------
    else if (e.stage === "PINCH") {

      e.neck   = lerp(8, 0, e.timer / 110);
      e.offset = lerp(R * 1.05, R * 1.4, e.timer / 110);
      e.radius = lerp(R, R * 0.9, e.timer / 110);

      if (e.timer >= 110) {

        if (vesicles.length < MAX_VES) {

          const membraneX =
            window.getSynapticMembraneX?.(e.y) ?? 0;

          vesicles.push({
            x: membraneX + STOP_X + BACK_X + random(10, 16),
            y: e.y + random(-6, 6),

            vx: random(0.035, 0.06),
            vy: random(-0.025, 0.025),

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

    v.vx += dx * 0.012;
    v.vx *= 0.92;
    v.vy *= 0.94;

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

  for (const e of window.endocytosisSeeds) {

    const membraneX =
      window.getSynapticMembraneX?.(e.y) ?? 0;

    const baseX = membraneX + window.SYNAPSE_VESICLE_STOP_X;
    const budX  = baseX + e.offset;

    // --- Neck (draw FIRST, behind bud) ---
    if (e.neck > 0) {
      stroke(245, 225, 140, e.alpha);
      strokeWeight(e.neck);
      line(
        baseX + 1,
        e.y,
        budX - e.radius,
        e.y
      );
    }

    // --- Bud body ---
    noStroke();
    fill(245, 225, 140, e.alpha);
    ellipse(budX, e.y, e.radius * 2);
  }

  pop();
}


// -----------------------------------------------------
// EXPORTS
// -----------------------------------------------------
window.updateVesicleRecycling = updateVesicleRecycling;
window.drawVesicleRecycling  = drawVesicleRecycling;
