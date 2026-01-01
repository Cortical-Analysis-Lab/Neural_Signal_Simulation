console.log("♻️ synapse/vesicleRecycling loaded");

// =====================================================
// VESICLE RECYCLING — ENDOCYTOSIS + RETURN
// =====================================================
// ✔ Uses shared geometry from synapseConstants.js
// ✔ Receives vesicles ONLY from vesicleRelease.js
// ✔ Returns vesicles to EMPTY state for reloading
// ✔ No loading logic here
// ✔ No release logic here
// =====================================================

// -----------------------------------------------------
// SHORT ALIASES → GLOBAL CONSTANTS
// -----------------------------------------------------
const CENTER_X    = window.SYNAPSE_TERMINAL_CENTER_X;
const CENTER_Y    = window.SYNAPSE_TERMINAL_CENTER_Y;
const RADIUS      = window.SYNAPSE_TERMINAL_RADIUS;
const BACK_OFFSET = window.SYNAPSE_BACK_OFFSET_X;

const V_RADIUS    = window.SYNAPSE_VESICLE_RADIUS;

// -----------------------------------------------------
// UPDATE RECYCLING
// -----------------------------------------------------
function updateVesicleRecycling() {

  for (const v of synapseVesicles) {

    // ---------------------------------------------
    // READY_FOR_RECYCLING → EMPTY
    // ---------------------------------------------
    if (v.state === "READY_FOR_RECYCLING") {

      // -----------------------------------------
      // ENDOCYTOSIS: smooth inward pull
      // -----------------------------------------
      v.x += 1.6;

      // 🔑 DO NOT vertically center
      // Preserve docking lane separation
      // (this was causing stacking before)
      if (v.dockOffsetY !== undefined) {
        v.y += (v.dockOffsetY - v.y) * 0.02;
      }

      // -----------------------------------------
      // ARRIVED BACK IN CYTOSOL
      // -----------------------------------------
      if (v.x >= CENTER_X + BACK_OFFSET) {

        // Redistribute vesicle in back cytosol
        const a = random(TWO_PI);
        const r = random(
          18,
          RADIUS - V_RADIUS - 8
        );

        v.x =
          CENTER_X +
          BACK_OFFSET +
          cos(a) * r * 0.55;

        v.y =
          CENTER_Y +
          sin(a) * r * 0.55;

        // -------------------------------------
        // FULL RESET — return to loader
        // -------------------------------------
        v.state = VESICLE_STATE.EMPTY;
        v.timer = 0;
        v.nts.length = 0;

        // Assign NEW docking lane for next cycle
        v.dockOffsetY = random(-18, 18);
      }

      // -----------------------------------------
      // HARD GEOMETRY SAFETY (CAPSULE ONLY)
      // -----------------------------------------
      const dx = v.x - CENTER_X;
      const dy = v.y - CENTER_Y;
      const d  = Math.sqrt(dx * dx + dy * dy);

      const maxR = RADIUS - V_RADIUS - 1;
      if (d > maxR) {
        const s = maxR / d;
        v.x = CENTER_X + dx * s;
        v.y = CENTER_Y + dy * s;
      }
    }
  }
}
