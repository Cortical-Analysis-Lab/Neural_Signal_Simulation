console.log("♻️ synapse/vesicleRecycling loaded");

// =====================================================
// VESICLE RECYCLING — ENDOCYTOSIS + RETURN
// =====================================================
// Uses shared geometry from synapseConstants.js
// =====================================================

function updateVesicleRecycling() {

  for (const v of synapseVesicles) {

    // ---------------------------------------------
    // READY_FOR_RECYCLING → EMPTY
    // ---------------------------------------------
    if (v.state === "READY_FOR_RECYCLING") {

      // Smooth endocytosis pull back into cytosol
      v.x += 1.6;

      // Gentle vertical damping toward terminal center
      v.y += (SYNAPSE_TERMINAL_CENTER_Y - v.y) * 0.04;

      // Once vesicle reaches back-loading zone
      if (v.x >= SYNAPSE_TERMINAL_CENTER_X + SYNAPSE_BACK_OFFSET_X) {

        // Small random redistribution to prevent stacking
        const a = random(TWO_PI);
        const r = random(16, SYNAPSE_TERMINAL_RADIUS - 18);

        v.x = SYNAPSE_TERMINAL_CENTER_X +
              SYNAPSE_BACK_OFFSET_X +
              cos(a) * r * 0.6;

        v.y = SYNAPSE_TERMINAL_CENTER_Y +
              sin(a) * r * 0.6;

        // FULL RESET (hand back to loader)
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

      if (d > SYNAPSE_TERMINAL_RADIUS - SYNAPSE_VESICLE_RADIUS) {
        const s = (SYNAPSE_TERMINAL_RADIUS - SYNAPSE_VESICLE_RADIUS) / d;
        v.x = SYNAPSE_TERMINAL_CENTER_X + dx * s;
        v.y = SYNAPSE_TERMINAL_CENTER_Y + dy * s;
      }
    }
  }
}
