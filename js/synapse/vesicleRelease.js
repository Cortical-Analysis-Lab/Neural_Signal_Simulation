console.log("⚡ synapse/vesicleRelease loaded");

// =====================================================
// SYNAPTIC VESICLE RELEASE (AP-TRIGGERED)
// =====================================================
// • Called once per terminal AP
// • No timers, no frame logic
// • Operates only on LOADED vesicles
// =====================================================

function triggerVesicleReleaseFromAP() {

  if (!window.synapseVesicles) return;

  let released = 0;

  for (let v of synapseVesicles) {

    if (v.state === VESICLE_STATE.LOADED) {
      v.state = VESICLE_STATE.SNARED;
      released++;
    }
  }

  // Optional teaching log
  if (released > 0 && typeof logEvent === "function") {
    logEvent(
      "synapse",
      `Action potential triggered vesicle fusion (${released})`,
      "presynaptic terminal"
    );
  }
}
