console.log("♻️ synapse/vesicleRecycling loaded");

// =====================================================
// VESICLE RECYCLING — ENDOCYTOSIS + RETURN
// =====================================================
// ✔ Uses shared geometry from synapseConstants.js
// ✔ Receives vesicles ONLY from vesicleRelease.js
// ✔ Returns vesicles to EMPTY state for reloading
// =====================================================

function updateVesicleRecycling() {

  for (const v of synapseVesicles) {

    // ---------------------------------------------
    // READY_FOR_RECYCLING → EMPTY
    // ---------------------------------------------
    if (v.state === "READY_FOR_RECYCLING") {

      // Smooth inward pull away from membrane
      v.x += 1.6;

      // Gentle vertical relaxation toward terminal center
      v.y += (SYNAPSE_TERMINAL_CENTER_Y - v.y) * 0.04;

      // ---------------------------------------------
      // ARRIVED BACK IN CYTOSOL
      // ---------------------------------------------
      if (v.x >= SYNAPSE_TERMINAL_CENTER_X + SYNAPSE_BACK_OFFSET_X) {

        // Redistribute slightly to avoid clustering
        const a = random(TWO_PI);
        const r = random(
          18,
          SYNAPSE_TERMINAL_RADIUS - SYNAPSE_VESICLE_RADIUS - 6
        );

        v.x =
          SYNAPSE_TERMINAL_CENTER_X +
          SYNAPSE_BACK_OFFSET_X +
          cos(a) * r * 0.6;

        v.y =
          SYNAPSE_TERMINAL_CENTER_Y +
          sin(a) * r * 0.6;

        // FULL RESET — hand back to loader
        v.state = VESICLE_STATE.EMPTY;
        v.timer = 0;
        v.nts.length = 0;
      }

      // ---------------------------------------------
      // HARD GEOMETRY SAFETY (capsule interior)
      // ---------------------------------------------
      const dx = v.x - SYNAPSE_TERMINAL_CENTER_X;
      const dy = v.y - SYNAPSE_TERMINAL_CENTER_Y;
      const d  = Math.sqrt(dx * dx + dy * dy);

      const maxR =
        SYNAPSE_TERMINAL_RADIUS - SYNAPSE_VESICLE_RADIUS;

      if (d > maxR) {
        const s = maxR / d;
        v.x = SYNAPSE_TERMINAL_CENTER_X + dx * s;
        v.y = SYNAPSE_TERMINAL_CENTER_Y + dy * s;
      }
    }
  }
}
