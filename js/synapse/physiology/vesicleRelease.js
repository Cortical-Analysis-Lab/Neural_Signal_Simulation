console.log("⚡ vesicleRelease loaded — CONTINUOUS FUSION MODEL (INSTRUMENTED)");

// =====================================================
// VESICLE RELEASE — SPATIALLY CONTINUOUS (AUTHORITATIVE)
// =====================================================
//
// CORE MODEL:
// • Vesicle center moves continuously across fusion plane
// • Fusion progress = spatial overlap, NOT timers
// • NT release begins after 25% membrane crossing
// • Geometry reacts only to v.flatten
//
// DEBUG GOAL:
// • PROVE spatial crossing numerically
//
// =====================================================


// -----------------------------------------------------
// LOCAL SPACE UN-ROTATION (CRITICAL)
// -----------------------------------------------------
function unrotateLocal(x, y) {
  return { x: -x, y: -y };
}


// -----------------------------------------------------
// TIMING (ONLY FOR DOCKING DELAY)
// -----------------------------------------------------
const DOCK_TIME = 90;
const RELEASE_JITTER_MIN = 0;
const RELEASE_JITTER_MAX = 18;
const RECYCLE_HOLD_FRAMES = 40;


// -----------------------------------------------------
// RECYCLING OFFSET
// -----------------------------------------------------
const RECYCLE_OFFSET =
  window.SYNAPSE_VESICLE_RADIUS * 2.5;


// -----------------------------------------------------
// APPROACH FORCE (TO STOP PLANE ONLY)
// -----------------------------------------------------
function applyDockingForce(v) {

  const targetX =
    window.SYNAPSE_VESICLE_STOP_X + (v.dockBiasX ?? 0);

  const dx = targetX - v.x;
  const dist = Math.abs(dx);

  const strength = map(dist, 0, 40, 0.004, 0.025, true);
  const pull = constrain(dx * strength, -0.35, 0.35);

  v.vx += pull;

  v.x += v.vx;
  v.y += v.vy;

  v.vx *= 0.9;
  v.vy *= 0.95;
}


// -----------------------------------------------------
// AP TRIGGER
// -----------------------------------------------------
function triggerVesicleReleaseFromAP() {

  const vesicles = window.synapseVesicles || [];

  const ready = vesicles.filter(v =>
    v.state === "LOADED" &&
    !v.releaseBias &&
    !v.recycleBias
  );

  for (const v of ready) {

    v.releaseBias = true;
    v.recycleBias = false;

    v.owner = "RELEASE";
    v.ownerFrame = frameCount;

    v.dockBiasX = random(-2.5, 2.5);
    v.dockBiasY = random(-3, 3);

    v.state = "DOCKING";
    v.timer = -Math.floor(
      random(RELEASE_JITTER_MIN, RELEASE_JITTER_MAX)
    );

    // Geometry-visible values
    v.flatten = 0;

    // Debug sentinels
    v.__ntStarted = false;
    v.__mergeLocked = false;
    v.__reportedFullFusion = false;

    v.vy *= 0.3;
  }
}


// -----------------------------------------------------
// MAIN UPDATE
// -----------------------------------------------------
function updateVesicleRelease() {

  const vesicles = window.synapseVesicles || [];
  const r = window.SYNAPSE_VESICLE_RADIUS;
  const knifeX = window.SYNAPSE_FUSION_PLANE_X;

  for (const v of vesicles) {

    if (!v.releaseBias) continue;

    // =================================================
    // DOCKING
    // =================================================
    if (v.state === "DOCKING") {

      if (v.timer < 0) {
        v.timer++;
        continue;
      }

      applyDockingForce(v);

      if (++v.timer >= DOCK_TIME) {
        v.state = "FUSING";
        v.timer = 0;
      }
    }

    // =================================================
    // FUSING — CONTINUOUS SLIDE ACROSS KNIFE
    // =================================================
    else if (v.state === "FUSING") {

      // Slow forward drift INTO membrane
      v.vx += -0.012;
      v.x += v.vx;
      v.y += v.vy;

      v.vx *= 0.92;
      v.vy *= 0.97;

      // -----------------------------------------------
      // Spatial fusion progress (CRITICAL)
      // -----------------------------------------------
      const fusionDepth =
        (knifeX - v.x) / r;

      const f = constrain(fusionDepth, 0, 1);
      v.flatten = f;

      // -----------------------------------------------
      // 🔎 DEBUG LOG (THROTTLED)
      // -----------------------------------------------
      if (frameCount % 15 === 0) {
        console.log(
          "[FUSING]",
          "x:", v.x.toFixed(2),
          "knifeX:", knifeX.toFixed(2),
          "Δ:", (knifeX - v.x).toFixed(2),
          "fusionDepth:", fusionDepth.toFixed(2),
          "flatten:", f.toFixed(2)
        );
      }

      // -----------------------------------------------
      // NT RELEASE STARTS AT 25%
      // -----------------------------------------------
      if (f >= 0.25 && !v.__ntStarted) {

        v.__ntStarted = true;

        console.log("🧠 NT RELEASE START @ flatten =", f.toFixed(2));

        const p = unrotateLocal(v.x, v.y);

        window.dispatchEvent(new CustomEvent("synapticRelease", {
          detail: {
            x: p.x,
            y: p.y,
            membraneX: p.x,
            normalX: -1,
            strength: 1.0
          }
        }));
      }

      // -----------------------------------------------
      // CONTINUOUS RELEASE WHILE CROSSING
      // -----------------------------------------------
      if (v.__ntStarted && frameCount % 12 === 0 && f < 0.95) {

        const p = unrotateLocal(
          v.x + random(-2, 2),
          v.y + random(-2, 2)
        );

        window.dispatchEvent(new CustomEvent("synapticRelease", {
          detail: {
            x: p.x,
            y: p.y,
            membraneX: p.x,
            normalX: -1,
            strength: 0.8
          }
        }));
      }

      // -----------------------------------------------
      // FULLY CONSUMED → RECYCLE
      // -----------------------------------------------
      if (f >= 1 && !v.__mergeLocked) {

        console.log("✅ FULL FUSION REACHED — flatten =", f.toFixed(2));
        v.__mergeLocked = true;

        v.nts = [];

        spawnEndocytosisSeed?.(
          v.x + RECYCLE_OFFSET,
          v.y
        );

        v.releaseBias = false;
        v.recycleBias = true;

        v.state = "RECYCLED_TRAVEL";
        v.recycleHold = RECYCLE_HOLD_FRAMES;

        v.vx = random(0.06, 0.10);
        v.vy = random(-0.04, 0.04);
      }

      // -----------------------------------------------
      // ❗ SAFETY WARNING (ONE TIME)
      // -----------------------------------------------
      if (v.flatten < 1 && v.x < knifeX - 3 * r && !v.__reportedFullFusion) {
        console.warn(
          "⚠️ Vesicle passed knife but flatten < 1",
          "x:", v.x.toFixed(2),
          "knifeX:", knifeX.toFixed(2),
          "flatten:", v.flatten.toFixed(2)
        );
        v.__reportedFullFusion = true;
      }
    }
  }
}


// -----------------------------------------------------
// EXPORTS
// -----------------------------------------------------
window.updateVesicleRelease = updateVesicleRelease;
window.triggerVesicleReleaseFromAP = triggerVesicleReleaseFromAP;
