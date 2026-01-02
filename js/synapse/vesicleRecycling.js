console.log("⚡ synapse/vesicleRelease loaded");

// =====================================================
// VESICLE RELEASE — BIOLOGICAL FUSION
// Docking → Fusion Pore → Membrane Merge
// =====================================================
//
// ✔ Each vesicle gets a unique fusion site
// ✔ Vesicles do NOT overlap
// ✔ Fusion is gradual, not instantaneous
// ✔ NT release is radial into cleft
// =====================================================

// -----------------------------------------------------
// CONFIG
// -----------------------------------------------------
const FUSION_SPREAD_Y = 26;     // vertical spread of fusion sites
const FUSION_JITTER_X = 2.5;   // slight membrane roughness
const FUSION_TIME     = 28;    // frames to fully merge

// -----------------------------------------------------
// AP TRIGGER
// -----------------------------------------------------
function triggerVesicleReleaseFromAP() {

  // Collect already-used fusion sites to avoid overlap
  const usedSites = [];

  for (const v of synapseVesicles) {

    if (v.state === VESICLE_STATE.LOADED) {

      // -----------------------------
      // Assign UNIQUE fusion site
      // -----------------------------
      let fy, tries = 0;

      do {
        fy =
          window.SYNAPSE_TERMINAL_CENTER_Y +
          random(-FUSION_SPREAD_Y, FUSION_SPREAD_Y);
        tries++;
      } while (
        usedSites.some(y => abs(y - fy) < window.SYNAPSE_VESICLE_RADIUS * 1.6) &&
        tries < 10
      );

      usedSites.push(fy);

      v.fusionX =
        window.SYNAPSE_DOCK_X + random(-FUSION_JITTER_X, FUSION_JITTER_X);
      v.fusionY = fy;

      v.state = "DOCKING";
      v.timer = 0;
      v.fusionProgress = 0;
    }
  }
}

// -----------------------------------------------------
// UPDATE RELEASE
// -----------------------------------------------------
function updateVesicleRelease() {

  for (let i = synapseVesicles.length - 1; i >= 0; i--) {
    const v = synapseVesicles[i];

    // ---------------------------------------------
    // DOCKING → FUSION
    // ---------------------------------------------
    if (v.state === "DOCKING") {

      // Smooth approach
      v.x += (v.fusionX - v.x) * 0.22;
      v.y += (v.fusionY - v.y) * 0.22;

      if (dist(v.x, v.y, v.fusionX, v.fusionY) < 1.2) {
        v.state = "FUSING";
        v.timer = 0;

        // Spawn NT burst ONCE, at correct site
        if (typeof spawnSynapticBurst === "function") {
          spawnSynapticBurst(
            v.fusionX,
            v.fusionY,
            {
              normalX: -1, // away from presynaptic membrane
              spread: 0.9
            }
          );
        }
      }
    }

    // ---------------------------------------------
    // FUSION → MEMBRANE MERGE
    // ---------------------------------------------
    else if (v.state === "FUSING") {

      v.timer++;
      v.fusionProgress = v.timer / FUSION_TIME;

      // Vesicle flattens into membrane
      v.radiusScale = lerp(1.0, 0.15, v.fusionProgress);
      v.alpha       = lerp(255, 40, v.fusionProgress);

      if (v.timer >= FUSION_TIME) {

        // Hand membrane to recycling system
        if (typeof spawnEndocytosisSeed === "function") {
          spawnEndocytosisSeed(v.fusionX, v.fusionY);
        }

        synapseVesicles.splice(i, 1);
      }
    }
  }
}
