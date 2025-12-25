// =====================================================
// ASTROCYTE GEOMETRY — LOCKED TRIPARTITE ENDFEET
// Endfoot-local glow ONLY (no arm contamination)
// =====================================================
console.log("astrocyteGeometry loaded (endfoot glow isolated)");

// -----------------------------------------------------
// Astrocyte object
// -----------------------------------------------------
const astrocyte = {
  x: 0,
  y: 0,
  radius: 26,
  arms: [],

  endfeet: [
    { x: 271.7, y: -8.8 },
    { x: 236.7, y: -40.4 }
  ],

  endfootGlow: [0, 0]
};

// -----------------------------------------------------
const ENDFOOT_GLOW_FRAMES = 28;

// -----------------------------------------------------
function initAstrocyte() {

  if (!neuron2?.soma || !neuron3?.soma) return;

  astrocyte.x = (neuron2.soma.x + neuron3.soma.x) * 0.5;
  astrocyte.y = (neuron2.soma.y + neuron3.soma.y) * 0.5 + 10;

  rebuildAstrocyteArms();
}

// -----------------------------------------------------
function rebuildAstrocyteArms() {

  astrocyte.arms.length = 0;

  // Background arms
  const baseArmCount = 5;
  for (let i = 0; i < baseArmCount; i++) {
    astrocyte.arms.push({
      angle: TWO_PI * (i / baseArmCount),
      length: 55 + i * 4,
      wobble: i * 1.3,
      target: null
    });
  }

  // Targeted arms
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
function triggerAstrocyteResponse() {
  astrocyte.endfootGlow = astrocyte.endfootGlow.map(
    () => ENDFOOT_GLOW_FRAMES
  );
}

// -----------------------------------------------------
function drawAstrocyte() {

  push();
  translate(astrocyte.x, astrocyte.y);

  // ================= SOMA =================
  push();
  noStroke();
  fill(getColor("astrocyte"));
  ellipse(0, 0, astrocyte.radius * 2);
  fill(190, 80, 210);
  ellipse(0, 0, 10);
  pop();

  // ================= ARMS =================
  astrocyte.arms.forEach(a => {

    // ---- draw arm ONLY ----
    push();
    stroke(getColor("astrocyte"));
    strokeWeight(5);
    noFill();

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
    pop();

    // ---- draw endfoot ONLY ----
    if (a.target) {

      // Base endfoot
      push();
      noStroke();
      fill(getColor("astrocyte"));
      ellipse(ex, ey, 12, 8);
      pop();

      // Glow halo (ISOLATED)
      const idx = astrocyte.endfeet.indexOf(a.target);
      if (idx !== -1 && astrocyte.endfootGlow[idx] > 0) {

        const alpha = map(
          astrocyte.endfootGlow[idx],
          0, ENDFOOT_GLOW_FRAMES,
          40, 160
        );

        push();
        stroke(255, 235, 120, alpha);
        strokeWeight(3);
        noFill();
        ellipse(ex, ey, 18, 14);
        pop();

        astrocyte.endfootGlow[idx]--;
      }
    }
  });

  pop();
}

// -----------------------------------------------------
window.initAstrocyte = initAstrocyte;
window.drawAstrocyte = drawAstrocyte;
window.triggerAstrocyteResponse = triggerAstrocyteResponse;
