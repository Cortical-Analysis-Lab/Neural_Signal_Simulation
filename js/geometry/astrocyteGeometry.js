// =====================================================
// ASTROCYTE GEOMETRY — LOCKED TRIPARTITE ENDFEET
// Ca²⁺-LIKE MEMBRANE WAVE (EDUCATIONAL)
// =====================================================
console.log("astrocyteGeometry loaded (endfoot-initiated wave)");

// -----------------------------------------------------
// Astrocyte object
// -----------------------------------------------------
const astrocyte = {
  x: 0,
  y: 0,
  radius: 26,
  arms: [],

  // 🔑 LOCKED ENDFEET (WORLD COORDS)
  endfeet: [
    { x: 271.7, y: -8.8 },     // neuron 1 ↔ 2
    { x: 236.7, y: -40.4 }     // neuron 1 ↔ 3
  ],

  // Glow state
  endfootGlow: [0, 0],
  waveActive: false,
  waveAngle: 0,
  somaGlow: 0
};

// -----------------------------------------------------
// Timing (slow + subtle)
// -----------------------------------------------------
const ENDFOOT_GLOW_FRAMES = 28;
const WAVE_SPEED         = 0.0025;   // 🔑 very slow
const WAVE_WIDTH         = 0.22;     // angular half-width
const SOMA_TRIGGER_FRAC  = 0.92;
const SOMA_GLOW_FRAMES   = 40;

// -----------------------------------------------------
// Initialize astrocyte
// -----------------------------------------------------
function initAstrocyte() {

  if (!neuron2?.soma || !neuron3?.soma) return;

  // Place soma between neuron 2 & 3
  astrocyte.x = (neuron2.soma.x + neuron3.soma.x) * 0.5;
  astrocyte.y = (neuron2.soma.y + neuron3.soma.y) * 0.5 + 10;

  rebuildAstrocyteArms();
}

// -----------------------------------------------------
// Build arms deterministically from endfeet
// -----------------------------------------------------
function rebuildAstrocyteArms() {

  astrocyte.arms.length = 0;

  // Background arms (visual texture)
  const baseCount = 5;
  for (let i = 0; i < baseCount; i++) {
    astrocyte.arms.push({
      angle: TWO_PI * (i / baseCount),
      length: 55 + i * 4,
      wobble: i * 1.3,
      target: null
    });
  }

  // Functional arms → endfeet
  astrocyte.endfeet.forEach(pt => {
    const dx = pt.x - astrocyte.x;
    const dy = pt.y - astrocyte.y;
    const d  = dist(astrocyte.x, astrocyte.y, pt.x, pt.y);

    astrocyte.arms.push({
      angle: atan2(dy, dx),
      length: d,
      wobble: random(TWO_PI),
      target: pt
    });
  });
}

// -----------------------------------------------------
// 🔑 TRIGGER — called by vesicleBurst.js
// -----------------------------------------------------
function triggerAstrocyteResponse() {

  // 1️⃣ Endfeet glow first
  astrocyte.endfootGlow = astrocyte.endfootGlow.map(() => ENDFOOT_GLOW_FRAMES);

  // 2️⃣ Compute initial wave angle from FIRST endfoot
  const ef = astrocyte.endfeet[0];
  const dx = ef.x - astrocyte.x;
  const dy = ef.y - astrocyte.y;

  astrocyte.waveAngle  = atan2(dy, dx);   // 🔑 initiation point
  astrocyte.waveActive = true;

  // 3️⃣ Reset soma
  astrocyte.somaGlow = 0;
}

// -----------------------------------------------------
// Draw astrocyte
// -----------------------------------------------------
function drawAstrocyte() {

  push();
  translate(astrocyte.x, astrocyte.y);

  // =====================================================
  // SOMA
  // =====================================================
  noStroke();
  fill(getColor("astrocyte"));
  ellipse(0, 0, astrocyte.radius * 2);

  // Late soma glow (outline only)
  if (astrocyte.somaGlow > 0) {
    stroke(255, 230, 120, 90);
    strokeWeight(5);
    noFill();
    ellipse(0, 0, astrocyte.radius * 2.6);
    astrocyte.somaGlow--;
  }

  // Nucleus
  noStroke();
  fill(190, 80, 210);
  ellipse(0, 0, 10);

  // =====================================================
  // ARMS + ENDFEET
  // =====================================================
  stroke(getColor("astrocyte"));
  strokeWeight(5);
  noFill();

  astrocyte.arms.forEach(a => {

    const wob = sin(state.time * 0.001 + a.wobble) * 2;
    const L   = a.length;

    const cx = cos(a.angle + 0.3) * (L * 0.5);
    const cy = sin(a.angle + 0.3) * (L * 0.5);
    const ex = cos(a.angle) * (L + wob);
    const ey = sin(a.angle) * (L + wob);

    beginShape();
    vertex(0, 0);
    quadraticVertex(cx, cy, ex, ey);
    endShape();

    // Endfoot
    if (a.target) {
      noStroke();
      fill(getColor("astrocyte"));
      ellipse(ex, ey, 12, 8);

      const idx = astrocyte.endfeet.indexOf(a.target);
      if (idx !== -1 && astrocyte.endfootGlow[idx] > 0) {
        stroke(255, 235, 120, 140);
        strokeWeight(3);
        noFill();
        ellipse(ex, ey, 18, 14);
        astrocyte.endfootGlow[idx]--;
      }
    }
  });

  // =====================================================
  // 🌊 Ca²⁺ MEMBRANE WAVE (INITIATES AT ENDFOOT)
  // =====================================================
  if (astrocyte.waveActive) {

    const R = astrocyte.radius * 1.15;
    const STEP = 0.05;

    for (
      let a = astrocyte.waveAngle - WAVE_WIDTH;
      a <= astrocyte.waveAngle + WAVE_WIDTH;
      a += STEP
    ) {
      const alpha =
        map(abs(a - astrocyte.waveAngle), 0, WAVE_WIDTH, 80, 0);

      stroke(255, 235, 120, alpha);
      strokeWeight(3);

      line(
        cos(a) * R,
        sin(a) * R,
        cos(a + STEP) * R,
        sin(a + STEP) * R
      );
    }

    astrocyte.waveAngle += WAVE_SPEED;

    // Trigger soma when wave nearly completes circuit
    if (
      astrocyte.waveAngle >
        atan2(
          astrocyte.endfeet[0].y - astrocyte.y,
          astrocyte.endfeet[0].x - astrocyte.x
        ) + TWO_PI * SOMA_TRIGGER_FRAC &&
      astrocyte.somaGlow === 0
    ) {
      astrocyte.somaGlow = SOMA_GLOW_FRAMES;
    }

    if (astrocyte.waveAngle > TWO_PI * 2) {
      astrocyte.waveActive = false;
    }
  }

  pop();
}

// -----------------------------------------------------
// EXPORTS
// -----------------------------------------------------
window.initAstrocyte = initAstrocyte;
window.drawAstrocyte = drawAstrocyte;
window.triggerAstrocyteResponse = triggerAstrocyteResponse;
