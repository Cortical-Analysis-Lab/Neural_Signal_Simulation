console.log("♻️ synapse/vesicleRecycling loaded");

// =====================================================
// VESICLE RECYCLING — ENDOCYTOSIS + RETURN
// =====================================================

// Geometry must match vesicleLoading.js
const SYNAPSE_MEMBRANE_X = 0;

// From neuronShape.js
const BAR_THICK = 340;
const BAR_HALF  = 140;

const TERMINAL_CENTER_X = BAR_THICK / 2;
const TERMINAL_CENTER_Y = 0;
const TERMINAL_RADIUS   = BAR_HALF - 10;

// Back-loading region
const BACK_OFFSET_X = 70;

// -----------------------------------------------------
// UPDATE RECYCLING
// -----------------------------------------------------
function updateVesicleRecycling() {

  for (const v of synapseVesicles) {

    // ---------------------------------------------
    // READY_FOR_RECYCLING → EMPTY
    // ---------------------------------------------
    if (v.state === "READY_FOR_RECYCLING") {

      // Smooth endocytosis pull
      v.x += 1.6;

      // Small vertical damping toward center
      v.y += (TERMINAL_CENTER_Y - v.y) * 0.04;

      // Once back in cytosol
      if (v.x >= TERMINAL_CENTER_X + BACK_OFFSET_X) {

        // Randomize slightly so vesicles don't stack
        const a = random(TWO_PI);
        const r = random(16, TERMINAL_RADIUS - 18);

        v.x = TERMINAL_CENTER_X + BACK_OFFSET_X + cos(a) * r * 0.6;
        v.y = TERMINAL_CENTER_Y + sin(a) * r * 0.6;

        // FULL RESET
        v.state = VESICLE_STATE.EMPTY;
        v.timer = 0;
        v.nts.length = 0;
      }

      // -------------------------------
      // HARD GEOMETRY SAFETY
      // -------------------------------
      const dx = v.x - TERMINAL_CENTER_X;
      const dy = v.y - TERMINAL_CENTER_Y;
      const d  = Math.sqrt(dx*dx + dy*dy);

      if (d > TERMINAL_RADIUS - VESICLE_RADIUS) {
        const s = (TERMINAL_RADIUS - VESICLE_RADIUS) / d;
        v.x = TERMINAL_CENTER_X + dx * s;
        v.y = TERMINAL_CENTER_Y + dy * s;
      }
    }
  }
}
