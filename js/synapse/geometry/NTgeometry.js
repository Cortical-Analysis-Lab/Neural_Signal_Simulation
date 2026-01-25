console.log("🧬 NTgeometry loaded — GEOMETRY AUTHORITY");

// =====================================================
// NEUROTRANSMITTER (NT) GEOMETRY — DRAW ONLY
// =====================================================
//
// RESPONSIBILITIES:
// ✔ Defines NT radius
// ✔ Defines NT color & alpha mapping
// ✔ Draws NT particles
//
// HARD RULES:
// • NO motion
// • NO constraints
// • NO astrocyte awareness
// • NO vesicle awareness
// • NO lifecycle logic
//
// =====================================================


// -----------------------------------------------------
// 🔑 AUTHORITATIVE GEOMETRY
// -----------------------------------------------------
window.NT_RADIUS = 2.4;


// -----------------------------------------------------
// 🎨 COLOR MODEL (AUTHORITATIVE)
// -----------------------------------------------------
function ntFillColor(alpha = 255) {
  return color(185, 120, 255, alpha);
}


// -----------------------------------------------------
// MAIN DRAW ENTRY (AUTHORITATIVE)
// -----------------------------------------------------
//
// synapticBurst.js EXPECTS this name
//
window.drawNTGeometry = function (nts) {

  if (!Array.isArray(nts) || nts.length === 0) return;

  push();
  noStroke();
  blendMode(ADD);

  for (const p of nts) {

    if (
      !Number.isFinite(p.x) ||
      !Number.isFinite(p.y)
    ) continue;

    const a = Number.isFinite(p.alpha) ? p.alpha : 255;

    fill(ntFillColor(a));
    circle(p.x, p.y, window.NT_RADIUS);
  }

  blendMode(BLEND);
  pop();
};


// -----------------------------------------------------
// 🟦 DEBUG DRAW — NT ORIGINS (OPTIONAL)
// -----------------------------------------------------
window.drawNTDebugPoints = function (nts) {

  if (!window.SHOW_SYNAPSE_DEBUG) return;
  if (!Array.isArray(nts)) return;

  push();
  stroke(255, 80, 200, 120);
  strokeWeight(1);
  noFill();

  for (const p of nts) {
    if (!Number.isFinite(p.x) || !Number.isFinite(p.y)) continue;
    circle(p.x, p.y, window.NT_RADIUS * 2.2);
  }

  pop();
};


// -----------------------------------------------------
// 🔒 CONTRACT ASSERTION
// -----------------------------------------------------
if (window.DEBUG_SYNapseContracts) {
  console.log("🔒 NTgeometry contract: DRAW ONLY");
}
