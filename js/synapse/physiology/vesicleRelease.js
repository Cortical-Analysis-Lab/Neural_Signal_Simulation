console.log("⚡ vesicleRelease loaded — CONTINUOUS FUSION MODEL (RIGHTWARD, INSTRUMENTED)");

// =====================================================
// VESICLE RELEASE — SPATIALLY CONTINUOUS (AUTHORITATIVE)
// =====================================================
//
// COORDINATE MODEL (LOCKED):
// • +X points TOWARD synaptic cleft
// • Vesicles move RIGHTWARD (increasing x)
// • Fusion plane is crossed when vesicle overlaps it
//
// CORE MODEL:
// • Fusion progress = spatial overlap of vesicle with plane
// • NT release begins after 25% overlap
// • Geometry reacts ONLY to v.flatten
//
// =====================================================


// -----------------------------------------------------
// LOCAL SPACE UN-ROTATION (POSTSYNAPTIC SPACE)
// -----------------------------------------------------
function unrotateLocal(x, y) {
  return { x: -x, y: -y };
}


// -----------------------------------------------------
// TIMING (DOCKING ONLY — NOT BIOLOGICAL)
// -----------------------------------------------------
const DOCK_TIME = 90;
const RELEASE_JITTER_MIN = 0;
const RELEASE_JITTER_MAX = 18;
const RECYCLE_HOLD_FRAMES = 40;


// -----------------------------------------------------
// RECYCLING OFFSET (POST-FUSION)
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

    // 🔑 SINGLE GEOMETRY INPUT
    v.flatten = 0;

    // Debug sentinels
    v.__ntStarted = false;
    v.__mergeLocked = false;
    v.__debugOnce = false;

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
    // FUSING — RIGHTWARD INTO CLEFT
    // =================================================
    else if (v.state === "FUSING") {

      // ------------------------------------------------
      // FORWARD MOTION (RIGHTWARD = +X)
      // ------------------------------------------------
      v.vx += +0.012;
      v.x  += v.vx;
      v.y  += v.vy;

      v.vx *= 0.92;
      v.vy *= 0.97;

      // ------------------------------------------------
      // EDGE-BASED FUSION PROGRESS (MONOTONIC)
      //
      // leftEdge  = v.x - r
      // rightEdge = v.x + r
      //
      // fusion begins when rightEdge crosses knife
      // fusion complete when leftEdge crosses knife
      // ------------------------------------------------
      const leftEdge  = v.x - r;
      const rightEdge = v.x + r;

      const fusionDepth =
        (rightEdge - knifeX) / (2 * r);

      const f = constrain(fusionDepth, 0, 1);
      v.flatten = f;

      // ------------------------------------------------
      // 🔎 DEBUG (THIS MUST RAMP 0 → 1 SMOOTHLY)
      // ------------------------------------------------
      if (frameCount % 15 === 0) {
        console.log(
          "[FUSING]",
          "x:", v.x.toFixed(2),
          "left:", leftEdge.toFixed(2),
          "right:", rightEdge.toFixed(2),
          "knifeX:", knifeX.toFixed(2),
          "fusionDepth:", fusionDepth.toFixed(2),
          "flatten:", f.toFixed(2)
        );
      }

      // ------------------------------------------------
      // NT RELEASE STARTS AT 25%
      // ------------------------------------------------
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

      // ------------------------------------------------
      // CONTINUOUS RELEASE WHILE CROSSING
      // ------------------------------------------------
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

      // ------------------------------------------------
      // FULL FUSION → RECYCLE
      // ------------------------------------------------
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

        v.vx = random(-0.10, -0.06); // move back LEFT after fusion
        v.vy = random(-0.04, 0.04);
      }
    }
  }
}


// -----------------------------------------------------
// EXPORTS
// -----------------------------------------------------
window.updateVesicleRelease = updateVesicleRelease;
window.triggerVesicleReleaseFromAP = triggerVesicleReleaseFromAP;
