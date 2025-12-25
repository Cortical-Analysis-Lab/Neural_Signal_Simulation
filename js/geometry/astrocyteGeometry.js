// =====================================================
// ASTROCYTE GEOMETRY — LOCKED TRIPARTITE ENDFEET
// BORDER WAVE GLOW (EDUCATIONAL)
// =====================================================
console.log("astrocyteGeometry loaded (locked + wave glow)");

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
    { x: 271.7, y: -8.8 },    // neuron 1 ↔ 2
    { x: 236.7, y: -40.4 }   // neuron 1 ↔ 3
  ],

  // Glow state
  glowPhase: 0,      // 0 → 1
  glowActive: false
};

// -----------------------------------------------------
// Glow parameters (subtle + slow)
// -----------------------------------------------------
const GLOW_SPEED   = 0.0022;   // 🔑 very slow
const GLOW_WIDTH   = 0.35;     // angular softness
const GLOW_ALPHA   = 140;
const SOMA_TRIGGER = 0.92;

// -----------------------------------------------------
// Initialize astrocyte
// -----------------------------------------------------
function initAstrocyte() {

  if (!neuron2?.soma || !neuron3?.soma) return;

  astrocyte.x = (neuron2.soma.x + neuron3.soma.x) * 0.5;
  astrocyte.y = (neuron2.soma.y + neuron3.soma.y) * 0.5 + 10;

  rebuildAstrocyteArms();
}

// -----------------------------------------------------
// Build arms deterministically
// -----------------------------------------------------
function rebuildAstrocyteArms() {

  astrocyte.arms.length = 0;

  // Background arms (visual only)
  for (let i = 0; i < 5; i++) {
    astrocyte.arms.push({
      angle: TWO_PI * (i / 5),
      length: 55 + i * 4,
      wobble: i * 1.7,
      target: null
    });
  }

  // Functional arms → locked endfeet
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
  astrocyte.glowPhase  = 0;
  astrocyte.glowActive = true;
}

// -----------------------------------------------------
// Draw astrocyte
// -----------------------------------------------------
function drawAstrocyte() {

  push();
  translate(astrocyte.x, astrocyte.y);

  // ---------------- SOMA ----------------
  noStroke();
  fill(getColor("astrocyte"));
  ellipse(0, 0, astrocyte.radius * 2);

  // ---------------- BORDER WAVE ----------------
  if (astrocyte.glowActive) {

    const footAngles = astrocyte.endfeet.map(pt =>
      atan2(pt.y - astrocyte.y, pt.x - astrocyte.x)
    );

    strokeWeight(4);
    noFill();
    beginShape();

    for (let a = 0; a <= TWO_PI; a += 0.08) {

      let minDist = Infinity;

      footAngles.forEach(fa => {
        const waveCenter = fa + astrocyte.glowPhase * TWO_PI;
        const d = angularDistance(a, waveCenter);
        minDist = min(minDist, d);
      });

      const intensity = exp(-sq(minDist / GLOW_WIDTH));

      if (intensity > 0.02) {
        stroke(255, 235, 120, intensity * GLOW_ALPHA);
        vertex(
          cos(a) * astrocyte.radius * 1.15,
          sin(a) * astrocyte.radius * 1.15
        );
      }
    }

    endShape();

    astrocyte.glowPhase += GLOW_SPEED;

    if (astrocyte.glowPhase >= 1) {
      astrocyte.glowActive = false;
    }
  }

  // ---------------- NUCLEUS ----------------
  noStroke();
  fill(190, 80, 210);
  ellipse(0, 0, 10);

  // ---------------- ARMS ----------------
  stroke(getColor("astrocyte"));
  strokeWeight(5);
  noFill();

  astrocyte.arms.forEach(a => {

    const wob = sin(state.time * 0.001 + a.wobble) * 2;
    const L   = a.length;

    beginShape();
    vertex(0, 0);
    quadraticVertex(
      cos(a.angle + 0.3) * (L * 0.5),
      sin(a.angle + 0.3) * (L * 0.5),
      cos(a.angle) * (L + wob),
      sin(a.angle) * (L + wob)
    );
    endShape();

    if (a.target) {
      noStroke();
      fill(getColor("astrocyte"));
      ellipse(
        cos(a.angle) * L,
        sin(a.angle) * L,
        12, 8
      );
    }
  });

  pop();
}

// -----------------------------------------------------
// Helpers
// -----------------------------------------------------
function angularDistance(a, b) {
  let d = abs(a - b);
  return d > PI ? TWO_PI - d : d;
}

// -----------------------------------------------------
// EXPORTS
// -----------------------------------------------------
window.initAstrocyte = initAstrocyte;
window.drawAstrocyte = drawAstrocyte;
window.triggerAstrocyteResponse = triggerAstrocyteResponse;
