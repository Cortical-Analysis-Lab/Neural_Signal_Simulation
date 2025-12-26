console.log("🔬 SynapseView — unified membrane morphology loaded");

// =====================================================
// COLORS (FROM colors.js WITH FALLBACKS)
// =====================================================
const NEURON_YELLOW = window.COLORS?.neuron ?? [245, 225, 140];
const ASTRO_PURPLE  = window.COLORS?.astrocyte ?? [185, 145, 220];

// =====================================================
// SYNAPSE VIEW — STRUCTURAL OUTLINES ONLY
// =====================================================
// World-space origin (0,0) = synaptic cleft center
// All components share membrane morphology
// =====================================================
function drawSynapseView() {
  if (!window.synapseFocus) return;

  push();
  translate(window.synapseFocus.x, window.synapseFocus.y);

  strokeWeight(6);
  strokeJoin(ROUND);
  strokeCap(ROUND);

  // Astrocyte above
  drawMembrane({
    x: 0,
    y: -95,
    w: 300,
    h: 130,
    flatten: 0.85,
    color: ASTRO_PURPLE,
    alpha: 45
  });

  // Presynaptic (right)
  drawMembrane({
    x: 130,
    y: 0,
    w: 240,
    h: 110,
    flatten: 0.55,
    color: NEURON_YELLOW,
    alpha: 35
  });

  // Postsynaptic (left)
  drawMembrane({
    x: -130,
    y: 0,
    w: 240,
    h: 110,
    flatten: 0.55,
    color: NEURON_YELLOW,
    alpha: 35,
    flipX: true
  });

  pop();
}

// =====================================================
// GENERIC MEMBRANE SHAPE (ROUNDED, FLATTENED)
// =====================================================
function drawMembrane({
  x = 0,
  y = 0,
  w = 200,
  h = 100,
  flatten = 0.6,
  color = [255, 255, 255],
  alpha = 40,
  flipX = false
}) {
  push();
  translate(x, y);
  if (flipX) scale(-1, 1);

  stroke(...color);
  fill(color[0], color[1], color[2], alpha);

  const hw = w / 2;
  const hh = h / 2;
  const f  = flatten;

  beginShape();
  curveVertex(-hw, -hh * f);
  curveVertex(-hw, -hh * f);

  curveVertex(-hw * 0.6, -hh);
  curveVertex(-hw * 0.2, -hh * 1.1);
  curveVertex(0,        -hh * 1.15);
  curveVertex(hw * 0.2, -hh * 1.1);
  curveVertex(hw * 0.6, -hh);
  curveVertex(hw,       -hh * f);

  curveVertex(hw * 0.9,  hh * 0.2);
  curveVertex(hw * 0.4,  hh * 0.55);
  curveVertex(0,         hh * 0.65);
  curveVertex(-hw * 0.4, hh * 0.55);
  curveVertex(-hw * 0.9, hh * 0.2);

  curveVertex(-hw, -hh * f);
  curveVertex(-hw, -hh * f);
  endShape(CLOSE);

  pop();
}
