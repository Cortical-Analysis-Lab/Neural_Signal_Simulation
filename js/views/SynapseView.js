console.log("🔬 SynapseView — scaled endfoot morphology loaded");

// =====================================================
// COLORS (FROM colors.js WITH FALLBACKS)
// =====================================================
const NEURON_YELLOW = window.COLORS?.neuron ?? [245, 225, 140];
const ASTRO_PURPLE  = window.COLORS?.astrocyte ?? [185, 145, 220];

// =====================================================
// GLOBAL SCALE (TRUE 3× REDUCTION)
// =====================================================
const SYNAPSE_SCALE = 0.33;

// =====================================================
// SYNAPSE VIEW — STRUCTURAL OUTLINES ONLY
// =====================================================
// World-space origin (0,0) = synaptic cleft center
// =====================================================
function drawSynapseView() {
  if (!window.synapseFocus) return;

  push();
  translate(window.synapseFocus.x, window.synapseFocus.y);
  scale(SYNAPSE_SCALE);

  strokeWeight(6);
  strokeJoin(ROUND);
  strokeCap(ROUND);

  // Astrocytic endfoot (above)
  drawMembrane({
    x: 0,
    y: -90,
    w: 300,
    h: 140,
    flatten: 0.9,
    cleftSide: "bottom",
    color: ASTRO_PURPLE,
    alpha: 45
  });

  // Presynaptic endfoot (right)
  drawMembrane({
    x: 135,
    y: 0,
    w: 260,
    h: 120,
    flatten: 0.25,          // 🔑 very flat at cleft
    cleftSide: "left",
    color: NEURON_YELLOW,
    alpha: 35
  });

  // Postsynaptic endfoot (left)
  drawMembrane({
    x: -135,
    y: 0,
    w: 260,
    h: 120,
    flatten: 0.25,
    cleftSide: "right",
    color: NEURON_YELLOW,
    alpha: 35
  });

  pop();
}

// =====================================================
// GENERIC MEMBRANE / ENDFOOT SHAPE
// =====================================================
function drawMembrane({
  x = 0,
  y = 0,
  w = 200,
  h = 100,
  flatten = 0.4,
  cleftSide = "none", // left | right | top | bottom
  color = [255, 255, 255],
  alpha = 40
}) {
  push();
  translate(x, y);

  stroke(...color);
  fill(color[0], color[1], color[2], alpha);

  const hw = w / 2;
  const hh = h / 2;

  // Flattening bias toward cleft
  const flat = flatten;
  const round = 1.0;

  beginShape();

  // TOP
  curveVertex(-hw * round, -hh * (cleftSide === "top" ? flat : round));
  curveVertex(-hw * round, -hh * (cleftSide === "top" ? flat : round));
  curveVertex(-hw * 0.4,   -hh * round);
  curveVertex(0,           -hh * round);
  curveVertex(hw * 0.4,    -hh * round);
  curveVertex(hw * round,  -hh * (cleftSide === "top" ? flat : round));

  // RIGHT
  curveVertex(hw * (cleftSide === "right" ? flat : round), -hh * 0.2);
  curveVertex(hw * (cleftSide === "right" ? flat : round),  hh * 0.2);

  // BOTTOM
  curveVertex(hw * round,  hh * (cleftSide === "bottom" ? flat : round));
  curveVertex(hw * 0.4,    hh * round);
  curveVertex(0,           hh * round);
  curveVertex(-hw * 0.4,   hh * round);
  curveVertex(-hw * round, hh * (cleftSide === "bottom" ? flat : round));

  // LEFT
  curveVertex(-hw * (cleftSide === "left" ? flat : round),  hh * 0.2);
  curveVertex(-hw * (cleftSide === "left" ? flat : round), -hh * 0.2);

  curveVertex(-hw * round, -hh * (cleftSide === "top" ? flat : round));
  curveVertex(-hw * round, -hh * (cleftSide === "top" ? flat : round));

  endShape(CLOSE);
  pop();
}
