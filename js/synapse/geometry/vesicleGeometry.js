console.log("🧬 vesicleGeometry loaded — PRODUCTION (OPAQUE + CLEAN)");

// =====================================================
// VESICLE GEOMETRY & RENDERING (READ-ONLY)
// =====================================================
//
// FINAL RULES (LOCKED):
// • Vesicle drawn as rigid circle (no scaling)
// • Vesicle erases directionally via clipX
// • Alpha fades ONLY as a secondary cue
// • NTs always render purple & visible
// • NO debug lines or plane visuals
//
// =====================================================


// -----------------------------------------------------
// COLORS
// -----------------------------------------------------
function vesicleBorderColor() {
  return color(245, 225, 140);
}

// 🔒 More opaque interior
function vesicleFillColor(alpha = 160) {
  return color(245, 225, 140, alpha);
}

// 🔒 Always-purple NTs
function ntFillColor(alpha = 255) {
  return color(185, 120, 255, alpha);
}

function protonColor() {
  return color(255, 90, 90);
}

function atpColor(alpha = 255) {
  return color(120, 200, 255, alpha);
}


// -----------------------------------------------------
// MAIN DRAW ENTRY
// -----------------------------------------------------
function drawSynapseVesicleGeometry() {
  push();
  drawVesicleMembranes();   // membranes first
  drawVesicleContents();    // NTs always on top
  drawPrimingParticles();
  pop();
}


// -----------------------------------------------------
// VESICLE MEMBRANES — DIRECTIONAL ERASE
// -----------------------------------------------------
function drawVesicleMembranes() {

  const vesicles = window.synapseVesicles || [];
  if (!vesicles.length) return;

  const r       = window.SYNAPSE_VESICLE_RADIUS;
  const strokeW = window.SYNAPSE_VESICLE_STROKE;

  for (const v of vesicles) {

    if (!Number.isFinite(v.x) || !Number.isFinite(v.y)) continue;
    if (v.flatten >= 1) continue; // hard erase

    push();
    translate(v.x, v.y);

    // -------------------------------------------------
    // CLIP AWAY CLEFT-SIDE (AUTHORITATIVE FROM RELEASE)
    // -------------------------------------------------
    if (Number.isFinite(v.clipX)) {

      const localClipX = v.clipX - v.x;

      drawingContext.save();
      drawingContext.beginPath();
      drawingContext.rect(
        localClipX,
        -r * 2,
        r * 4,
        r * 4
      );
      drawingContext.clip();
    }

    const fade = constrain(1 - v.flatten, 0, 1);

    stroke(vesicleBorderColor());
    strokeWeight(strokeW);
    fill(vesicleFillColor(160 * fade));

    ellipse(0, 0, r * 2);

    if (Number.isFinite(v.clipX)) {
      drawingContext.restore();
    }

    pop();
  }
}


// -----------------------------------------------------
// NEUROTRANSMITTER CONTENTS — FULL COLOR + CLIP
// -----------------------------------------------------
function drawVesicleContents() {

  const vesicles = window.synapseVesicles || [];
  if (!vesicles.length) return;

  const r = window.SYNAPSE_VESICLE_RADIUS;

  for (const v of vesicles) {

    if (!Array.isArray(v.nts) || !v.nts.length) continue;
    if (v.flatten >= 1) continue;

    push();
    translate(v.x, v.y);

    if (Number.isFinite(v.clipX)) {

      const localClipX = v.clipX - v.x;

      drawingContext.save();
      drawingContext.beginPath();
      drawingContext.rect(
        localClipX,
        -r * 2,
        r * 4,
        r * 4
      );
      drawingContext.clip();
    }

    // 🔒 Always vivid purple
    fill(ntFillColor(255));
    noStroke();

    for (const p of v.nts) {
      circle(p.x, p.y, 3);
    }

    if (Number.isFinite(v.clipX)) {
      drawingContext.restore();
    }

    pop();
  }
}


// -----------------------------------------------------
// PRIMING PARTICLES (UNCHANGED)
// -----------------------------------------------------
function drawPrimingParticles() {

  const ALLOWED = new Set(["PRIMING", "PRIMED", "LOADING"]);

  // H⁺
  fill(protonColor());
  textSize(12);
  textAlign(CENTER, CENTER);

  for (const h of window.synapseH || []) {
    if (!h.target || !ALLOWED.has(h.target.state)) continue;
    push();
    translate(h.x, h.y);
    rotate(-PI);
    text("H⁺", 0, 0);
    pop();
  }

  // ATP / ADP + Pi
  textSize(10);

  for (const a of window.synapseATP || []) {
    if (!a.target || !ALLOWED.has(a.target.state)) continue;
    fill(atpColor(a.alpha ?? 255));
    push();
    translate(a.x, a.y);
    rotate(-PI);
    text(a.state === "ATP" ? "ATP" : "ADP + Pi", 0, 0);
    pop();
  }
}


// -----------------------------------------------------
// EXPORT
// -----------------------------------------------------
window.drawSynapseVesicleGeometry = drawSynapseVesicleGeometry;
