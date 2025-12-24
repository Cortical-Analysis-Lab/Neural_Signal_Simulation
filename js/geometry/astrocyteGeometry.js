// =====================================================
// ASTROCYTE GEOMETRY — USER-PLACED TRIPARTITE ENDFEET
// =====================================================
console.log("astrocyteGeometry loaded (interactive endfeet)");

// -----------------------------------------------------
// Astrocyte object (DECLARE FIRST)
// -----------------------------------------------------
const astrocyte = {
  x: 0,
  y: 0,
  radius: 26,
  arms: [],

  // User-defined endfeet (world coords)
  endfeet: [null, null],

  // Glow state
  endfootGlow: [0, 0],
  borderGlowPhase: 0,
  somaGlow: 0
};

// -----------------------------------------------------
// Glow timing (VERY SLOW)
// -----------------------------------------------------
const ENDFOOT_GLOW_FRAMES = 30;
const BORDER_PROP_SPEED  = 0.003; // slow angular propagation
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
// Rebuild arms based on endfeet
// -----------------------------------------------------
function rebuildAstrocyteArms() {
  astrocyte.arms.length = 0;

  // Base organic arms (background texture)
  const baseArmCount = 5;
  for (let i = 0; i < baseArmCount; i++) {
    astrocyte.arms.push({
      angle: TWO_PI * (i / baseArmCount) + random(-0.4, 0.4),
      length: random(50, 75),
      wobble: random(TWO_PI),
      target: null
    });
  }

  // Targeted arms → user endfeet
  astrocyte.endfeet.forEach(pt => {
    if (!pt) return;

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
// USER INPUT — SHIFT + CLICK to place endfeet
// -----------------------------------------------------
function astrocyteMousePressed(worldX, worldY) {

  // Find first empty slot, else overwrite nearest
  let idx = astrocyte.endfeet.findIndex(e => e === null);

  if (idx === -1) {
    let minD = Infinity;
    idx = 0;
    astrocyte.endfeet.forEach((e, i) => {
      const d = dist(worldX, worldY, e.x, e.y);
      if (d < minD) {
        minD = d;
        idx = i;
      }
    });
  }

  astrocyte.endfeet[idx] = { x: worldX, y: worldY };
  astrocyte.endfootGlow[idx] = ENDFOOT_GLOW_FRAMES;
  astrocyte.borderGlowPhase = 0;

  rebuildAstrocyteArms();

  // 🔑 AUTHORITATIVE LOG
  console.log(
    `🟣 Astrocyte endfoot ${idx}: (${worldX.toFixed(1)}, ${worldY.toFixed(1)})`
  );
}

// -----------------------------------------------------
// Triggered externally (e.g. vesicle release)
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

  // ---------------- SOMA ----------------
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
    for (let a = 0; a < endAngle; a += 0.15) {
      vertex(
        cos(a) * astrocyte.radius * 1.15,
        sin(a) * astrocyte.radius * 1.15
      );
    }
    endShape();
  }

  // Soma glow (late)
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

  // ---------------- ARMS ----------------
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
        stroke(255, 235, 120, 160);
        strokeWeight(3);
        noFill();
        ellipse(ex, ey, 18, 14);
        astrocyte.endfootGlow[idx]--;
      }
    }
  });

  pop();

  // ---------------- Glow propagation ----------------
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
window.astrocyteMousePressed = astrocyteMousePressed;
