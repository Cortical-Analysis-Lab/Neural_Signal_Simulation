console.log("🔬 SynapseView — ipsilateral neurite merging fixed");

// =====================================================
// COLORS (FROM colors.js WITH FALLBACKS)
// =====================================================
const NEURON_YELLOW = window.COLORS?.neuron ?? [245, 225, 140];
const ASTRO_PURPLE  = window.COLORS?.astrocyte ?? [185, 145, 220];

// =====================================================
// SYNAPSE SCALE (DO NOT CHANGE)
// =====================================================
const SYNAPSE_SCALE = 0.28;

// =====================================================
// SYNAPSE VIEW — STRUCTURAL OUTLINES ONLY
// =====================================================
function drawSynapseView() {
  if (!window.synapseFocus) return;

  push();
  translate(window.synapseFocus.x, window.synapseFocus.y);
  scale(SYNAPSE_SCALE);

  strokeWeight(6);
  strokeJoin(ROUND);
  strokeCap(ROUND);

  drawAstrocyticEndfoot();
  drawPresynapticNeuron();
  drawPostsynapticNeuron();

  pop();
}

// =====================================================
// ASTROCYTIC ENDFOOT (UNCHANGED)
// =====================================================
function drawAstrocyticEndfoot() {
  push();
  translate(0, -120);

  stroke(...ASTRO_PURPLE);
  fill(ASTRO_PURPLE[0], ASTRO_PURPLE[1], ASTRO_PURPLE[2], 45);

  beginShape();
  curveVertex(-220, -30);
  curveVertex(-220, -30);
  curveVertex(-160, -90);
  curveVertex( -60, -120);
  curveVertex(   0, -125);
  curveVertex(  60, -120);
  curveVertex( 160,  -90);
  curveVertex( 220,  -30);
  curveVertex( 200,   20);
  curveVertex( 120,   55);
  curveVertex(   0,   65);
  curveVertex(-120,   55);
  curveVertex(-200,   20);
  curveVertex(-220, -30);
  curveVertex(-220, -30);
  endShape(CLOSE);

  pop();
}

// =====================================================
// PRESYNAPTIC NEURON (RIGHT — IPSILATERAL)
// =====================================================
function drawPresynapticNeuron() {
  push();
  translate(95, 55);

  stroke(...NEURON_YELLOW);
  fill(NEURON_YELLOW[0], NEURON_YELLOW[1], NEURON_YELLOW[2], 35);

  beginShape();

  // OUTER NEURITE (right side only)
  curveVertex(560, -35);
  curveVertex(560, -35);
  curveVertex(470, -45);
  curveVertex(360, -55);

  // OUTER TERMINAL CONTOUR
  curveVertex(260, -160);
  curveVertex(300,  -80);
  curveVertex(320,    0);
  curveVertex(300,   80);
  curveVertex(260,  160);

  // INNER SYNAPTIC FACE
  curveVertex(180,  145);
  curveVertex(155,   75);
  curveVertex(150,    0);
  curveVertex(155,  -75);
  curveVertex(180, -145);

  // RETURN ALONG SAME OUTER SIDE
  curveVertex(260, -160);
  curveVertex(360,  55);
  curveVertex(470,  45);
  curveVertex(560,  35);
  curveVertex(560,  35);

  endShape(CLOSE);
  pop();
}

// =====================================================
// POSTSYNAPTIC NEURON (LEFT — IPSILATERAL)
// =====================================================
function drawPostsynapticNeuron() {
  push();
  translate(-95, 55);

  stroke(...NEURON_YELLOW);
  fill(NEURON_YELLOW[0], NEURON_YELLOW[1], NEURON_YELLOW[2], 35);

  beginShape();

  // OUTER NEURITE (left side only)
  curveVertex(-560, -35);
  curveVertex(-560, -35);
  curveVertex(-470, -45);
  curveVertex(-360, -55);

  // OUTER TERMINAL CONTOUR
  curveVertex(-260, -160);
  curveVertex(-300,  -80);
  curveVertex(-320,    0);
  curveVertex(-300,   80);
  curveVertex(-260,  160);

  // INNER SYNAPTIC FACE
  curveVertex(-180,  145);
  curveVertex(-155,   75);
  curveVertex(-150,    0);
  curveVertex(-155,  -75);
  curveVertex(-180, -145);

  // RETURN SAME SIDE
  curveVertex(-260, -160);
  curveVertex(-360,  55);
  curveVertex(-470,  45);
  curveVertex(-560,  35);
  curveVertex(-560,  35);

  endShape(CLOSE);
  pop();
}
