// =====================================================
// ASTROCYTE GEOMETRY — TRIPARTITE SYNAPSE (NEURON 2 ↔ 3)
// =====================================================
console.log("astrocyteGeometry loaded");

// -----------------------------------------------------
// Astrocyte object
// -----------------------------------------------------
const astrocyte = {
  x: 0,
  y: 0,
  radius: 26,
  arms: []
};

// -----------------------------------------------------
// Initialize astrocyte near synaptic midpoint
// -----------------------------------------------------
function initAstrocyte() {

  if (!neuron2?.synapses?.length || !neuron3?.synapses?.length) return;

  // --- find centroid between neuron 2 & 3 synapses ---
  let sx = 0, sy = 0, n = 0;

  neuron2.synapses.forEach(s => {
    sx += s.x;
    sy += s.y;
    n++;
  });

  neuron3.synapses.forEach(s => {
    sx += s.x;
    sy += s.y;
    n++;
  });

  astrocyte.x = sx / n;
  astrocyte.y = sy / n;

  // --- generate organic arms ---
  astrocyte.arms.length = 0;

  const armCount = 9;

  for (let i = 0; i < armCount; i++) {
    const angle = TWO_PI * (i / armCount) + random(-0.2, 0.2);
    const len   = random(45, 75);

    astrocyte.arms.push({
      angle,
      length: len,
      wobble: random(TWO_PI)
    });
  }
}

// -----------------------------------------------------
// Draw astrocyte
// -----------------------------------------------------
function drawAstrocyte() {

  if (!astrocyte.arms.length) return;

  push();
  translate(astrocyte.x, astrocyte.y);

  // -----------------------------
  // Soma
  // -----------------------------
  noStroke();
  fill(getColor("astrocyte"));
  ellipse(0, 0, astrocyte.radius * 2);

  // Nucleus
  fill(180, 60, 200);
  ellipse(0, 0, 10);

  // -----------------------------
  // Arms
  // -----------------------------
  stroke(getColor("astrocyte"));
  strokeWeight(5);
  noFill();

  astrocyte.arms.forEach(a => {

    const wob = sin(state.time * 0.001 + a.wobble) * 4;

    const x1 = cos(a.angle) * astrocyte.radius;
    const y1 = sin(a.angle) * astrocyte.radius;

    const x2 = cos(a.angle + 0.2) * (a.length * 0.5);
    const y2 = sin(a.angle + 0.2) * (a.length * 0.5);

    const x3 = cos(a.angle) * (a.length + wob);
    const y3 = sin(a.angle) * (a.length + wob);

    beginShape();
    vertex(0, 0);
    quadraticVertex(x2, y2, x3, y3);
    endShape();
  });

  pop();
}

// -----------------------------------------------------
// EXPORTS
// -----------------------------------------------------
window.initAstrocyte = initAstrocyte;
window.drawAstrocyte = drawAstrocyte;
