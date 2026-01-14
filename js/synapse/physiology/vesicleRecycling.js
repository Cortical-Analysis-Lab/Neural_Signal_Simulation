console.log("♻️ vesicleRecycling loaded — AUTHORITATIVE (SLOW + TRUE BUDDING)");

// =====================================================
// VESICLE RECYCLING — BIOLOGICAL ENDOCYTOSIS
// =====================================================
//
// ✔ Slow, readable membrane budding
// ✔ Patch → bud → pinch (membrane-anchored)
// ✔ Bud grows OUT of curved membrane
// ✔ Vesicle detaches ONLY at final pinch
// ✔ No teleportation, no shortcuts
//
// IMPORTANT ARCHITECTURAL RULES:
// • NO vesicle geometry until DETACH
// • NO flatten, NO clipX during budding
// • ALL positions membrane-relative
// • VesicleGeometry.js remains uninvolved
//
// =====================================================


// -----------------------------------------------------
// ENDOCYTOSIS SEEDS (MEMBRANE-OWNED)
// -----------------------------------------------------
window.endocytosisSeeds = window.endocytosisSeeds || [];


// -----------------------------------------------------
// SPAWN ENDOCYTOSIS SEED (MEMBRANE-LOCKED)
// -----------------------------------------------------
//
// NOTE:
// • x is intentionally ignored
// • Buds are anchored ONLY by membraneX(y)
//
window.spawnEndocytosisSeed = function (x, y) {
  window.endocytosisSeeds.push({
    y,
    timer: 0,
    stage: "PATCH",

    // Geometry (membrane-relative)
    radius: 0.5,     // start essentially invisible
    offset: 0,       // outward growth from membrane
    neck: 0,         // pinch radius

    alpha: 120
  });
};


// -----------------------------------------------------
// UPDATE RECYCLING — AUTHORITATIVE STATE MACHINE
// -----------------------------------------------------
function updateVesicleRecycling() {

  const seeds    = window.endocytosisSeeds;
  const vesicles = window.synapseVesicles || [];

  const MAX_VES = window.SYNAPSE_MAX_VESICLES;
  const R       = window.SYNAPSE_VESICLE_RADIUS;

  const STOP_X = window.SYNAPSE_VESICLE_STOP_X;
  const BACK_X = window.SYNAPSE_BACK_OFFSET_X;

  // ===================================================
  // ENDOCYTOSIS STATE MACHINE (PATCH → BUD → PINCH)
  // ===================================================
  for (let i = seeds.length - 1; i >= 0; i--) {

    const e = seeds[i];
    e.timer++;

    // -------------------------------------------------
    // PATCH — subtle membrane dimple
    // -------------------------------------------------
    if (e.stage === "PATCH") {

      const t = constrain(e.timer / 80, 0, 1);

      // Emphasize emergence via offset, NOT size
      e.radius = lerp(0.5, 2.5, t);
      e.offset = lerp(0.0, 1.2, t);
      e.alpha  = lerp(110, 150, t);

      if (e.timer >= 80) {
        e.stage = "BUD";
        e.timer = 0;
      }
    }

    // -------------------------------------------------
    // BUD — membrane bulges outward
    // -------------------------------------------------
    else if (e.stage === "BUD") {

      const t = constrain(e.timer / 150, 0, 1);

      // Offset leads growth → reads as emergence
      e.offset = lerp(1.2, R * 1.1, t);
      e.radius = lerp(2.5, R, t);

      // Neck forms late and gently
      e.neck  = lerp(0, 6, t);
      e.alpha = lerp(150, 230, t);

      if (e.timer >= 150) {
        e.stage = "PINCH";
        e.timer = 0;
      }
    }

    // -------------------------------------------------
    // PINCH — neck constriction & final separation
    // -------------------------------------------------
    else if (e.stage === "PINCH") {

      const t = constrain(e.timer / 110, 0, 1);

      // Neck collapses
      e.neck   = lerp(6, 0, t);

      // Bud pulls slightly farther outward
      e.offset = lerp(R * 1.1, R * 1.4, t);

      // Slight compression before release
      e.radius = lerp(R, R * 0.9, t);

      if (e.timer >= 110) {

        // -------------------------------
        // DETACH — create real vesicle
        // -------------------------------
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

        // Remove membrane bud ONLY after detachment
        seeds.splice(i, 1);
      }
    }
  }

  // ===================================================
  // RECYCLED_TRAVEL → RESERVE POOL (SOFT HANDOFF)
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

    // Base attachment point (membrane-normal)
    const baseX = membraneX + window.SYNAPSE_VESICLE_STOP_X;
    const budX  = baseX + e.offset;

    // ---------------------------------------------
    // Membrane overlap cue (anchors bud visually)
    // ---------------------------------------------
    noStroke();
    fill(245, 225, 140, e.alpha * 0.45);
    ellipse(
      baseX + e.offset * 0.25,
      e.y,
      e.radius * 1.6,
      e.radius * 1.6
    );

    // ---------------------------------------------
    // Neck constriction (drawn BEFORE bud)
    // ---------------------------------------------
    if (e.stage === "PINCH" && e.neck > 0) {
      noFill();
      stroke(245, 225, 140, e.alpha);
      strokeWeight(2);

      circle(
        baseX + e.offset * 0.35,
        e.y,
        max(1, e.neck * 2)
      );
    }

    // ---------------------------------------------
    // Bud body (membrane-colored dome)
    // ---------------------------------------------
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
