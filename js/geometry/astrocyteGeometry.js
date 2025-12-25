// =====================================================
// ASTROCYTE GEOMETRY — LOCKED TRIPARTITE ENDFEET
// Endfoot-local Ca²⁺-like glow ONLY
// =====================================================
console.log("astrocyteGeometry loaded (endfoot-only glow)");

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
    { x: 271.7, y: -8.8 },     // neuron 1 ↔ 2
    { x: 236.7, y: -40.4 }     // neuron 1 ↔ 3
  ],

  // Glow state (per endfoot)
  endfootGlow: [0, 0]
};

// -----------------------------------------------------
// Glow timing (slow, subtle)
// -----------------------------------------------------
const ENDFOOT_GLOW_FRAMES = 28;

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
  // Background organic arms (visual only)
  // -----------------------------------------------
  const baseArmCount = 5;
  for (let i = 0; i < baseArmCount; i++) {
    astrocyte.arms.push({
      angle: TWO_PI * (i / baseArmCount),
      length: 55 + i * 4,
      wobble: i * 1.3,
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
// 🔑 Triggered by vesicle release
// -----------------------------------------------------
function triggerAstrocyteResponse() {

  // Activate local glow at BOTH endfeet
  astrocyte.endfootGlow = astrocyte.endfootGlow.map(
    () => ENDFOOT_GLOW_FRAMES
  );
}

// -----------------------------------------------------
// Draw astrocyte
// -----------------------------------------------------
function drawAstrocyte() {

  push();
  translate(astrocyte.x, astrocyte.y);

  // =====================================================
  // SOMA (NO GLOW)
  // =====================================================
  noStroke();
  fill(getColor("astrocyte"));
  ellipse(0, 0, astrocyte.radius * 2);

  // Nucleus
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
    // ENDFOOT (ATTACHED)
    // -----------------------------
    if (a.target) {

      // Base endfoot
      noStroke();
      fill(getColor("astrocyte"));
      ellipse(ex, ey, 12, 8);

      // Glow halo (LOCAL ONLY)
      const idx = astrocyte.endfeet.indexOf(a.target);
      if (idx !== -1 && astrocyte.endfootGlow[idx] > 0) {

        const alpha = map(
          astrocyte.endfootGlow[idx],
          0, ENDFOOT_GLOW_FRAMES,
          40, 160
        );

        stroke(255, 235, 120, alpha);
        strokeWeight(3);
        noFill();
        ellipse(ex, ey, 18, 14);

        astrocyte.endfootGlow[idx]--;
      }
    }
  });

  pop();
}

// -----------------------------------------------------
// EXPORTS
// -----------------------------------------------------
window.initAstrocyte = initAstrocyte;
window.drawAstrocyte = drawAstrocyte;
window.triggerAstrocyteResponse = triggerAstrocyteResponse;
