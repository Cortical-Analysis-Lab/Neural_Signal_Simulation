console.log("♻️ synapse/vesicleRecycling loaded");

// =====================================================
// VESICLE RECYCLING — ENDOCYTOSIS
// =====================================================

function updateVesicleRecycling() {

  for (const v of synapseVesicles) {

    if (v.state === "recycling") {
      v.x += 2.0;

      if (v.x >= CLUSTER_X) {
        v.state = VESICLE_STATE.EMPTY;
        v.fill = 0;
      }
    }
  }
}
