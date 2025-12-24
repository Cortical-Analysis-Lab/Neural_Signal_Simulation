// =====================================================
// ASTROCYTE GEOMETRY — LOCKED TRIPARTITE ENDFEET
// =====================================================
console.log("astrocyteGeometry loaded (locked endfeet)");

// -----------------------------------------------------
// Astrocyte object
// -----------------------------------------------------
const astrocyte = {
  x: 0,
  y: 0,
  radius: 26,
  arms: [],

  // 🔑 LOCKED ENDFEET (WORLD COORDINATES)
  endfeet: [
    { x: 271.7, y: -8.8 },    // neuron 1 ↔ 2 synaptic cleft
    { x: 236.7, y: -40.4 }    // neuron 1 ↔ 3 synaptic cleft
  ],

  // Glow state
  endfootGlow: [0, 0],
  borderGlowPhase: 0,
  somaGlow: 0
};

// -----------------------------------------------------
// Glow timing (VERY SLOW, EDUCATIONAL)
// -----------------------------------------------------
const ENDFOOT_GLOW_FRAMES = 30;
const BORDER_PROP_SPEED  = 0.003;   // slow circumferential spread
const SOMA_GLOW_TRIGGER  = 0.95;
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
// Build arms deterministically from locked endfeet
// -----------------------------------------------------
function rebuildAstrocyteArms() {

  astrocyte.arms.length = 0;

  // -----------------------------------------------
  // Background organic arms (visual texture only)
  // -----------------------------------------------
  const baseArmCount = 5;
  for (let i = 0; i < baseArmCount; i++) {
    astrocyte.arms.push({
      angle: TWO_PI * (i / baseArmCount),
      length: 55 + i * 4,
      wobble: i * 1.7,
      target: null
    });
  }

  // -----------------------------------------------
  // Functional arms → synaptic endfeet
  // -----------------------------------------------
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
// Triggered by vesicle release
// -----------------------------------------------------
function triggerAstrocyteResponse() {
  astrocyte.endfootGlow = astrocyte.endfootGlow.map(() => ENDFOOT_GLOW_FRAMES);
  astrocyte.borderGlowPhase = 0;
  astrocyte.somaGlow = 0;
}

// -----------------------------------------------------
// Draw astrocyte
// -----------------------------------------------------
function drawAstrocyte() {

  push();
  translate(astrocyte.x, astrocyte.y);

  // =====================================================
  // SOMA (purple fill, glow is outline only)
  // =====================================================
  noStroke();
  fill(getColor("astrocyte"));
  ellipse(0, 0, astrocyte.radius * 2);

  // Border glow propagation
  if (astrocyte.borderGlowPhase > 0) {
    stroke(255, 235, 120, 120);
    strokeWeight(4);
    noFill();

    const endAngle = TWO_PI * astrocyte.borderGlowPhase;
    beginShape();
    for (let a = 0; a < endAngle; a += 0.12) {
      vertex(
        cos(a) * astrocyte.radius * 1.15,
        sin(a) * astrocyte.radius * 1.15
      );
    }
    endShape();
  }

  // Soma glow (late, slow)
  if (astrocyte.somaGlow > 0) {
    stroke(255, 230, 120, 100);
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

    // -----------------------------
    // ENDFOOT (attached, stable)
    // -----------------------------
    if (a.target) {
      noStroke();
      fill(getColor("astrocyte"));
      ellipse(ex, ey, 12, 8);

      const idx = astrocyte.endfeet.indexOf(a.target);
      if (idx !== -1 && astrocyte.endfootGlow[idx] > 0) {
        stroke(255, 235, 120, 160);
        strokeWeight(3);
        noFill();
        ellipse(ex, ey, 18, 14);
        astrocyte.endfootGlow[idx]--;
      }
    }
  });

  pop();

  // --------------------------------------------------
  // Glow propagation (endfoot → border → soma)
  // --------------------------------------------------
  if (astrocyte.endfootGlow.some(g => g > 0)) {

    astrocyte.borderGlowPhase = min(
      1,
      astrocyte.borderGlowPhase + BORDER_PROP_SPEED
    );

    if (
      astrocyte.borderGlowPhase > SOMA_GLOW_TRIGGER &&
      astrocyte.somaGlow === 0
    ) {
      astrocyte.somaGlow = SOMA_GLOW_FRAMES;
    }
  }
}

// -----------------------------------------------------
// EXPORTS
// -----------------------------------------------------
window.initAstrocyte = initAstrocyte;
window.drawAstrocyte = drawAstrocyte;
window.triggerAstrocyteResponse = triggerAstrocyteResponse;
