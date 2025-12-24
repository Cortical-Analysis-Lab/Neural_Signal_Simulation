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

  // -------------------------------------------------
  // Find centroid between neuron 2 & 3 synapses
  // -------------------------------------------------
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
  astrocyte.y = sy / n - 20; // 🔑 slightly up & between neurons

  // -------------------------------------------------
  // Select synapses for tripartite contact (1–2)
  // -------------------------------------------------
  astrocyte.arms.length = 0;

  const targets = [
    ...(neuron2.synapses || []),
    ...(neuron3.synapses || [])
  ]
    .filter(s =>
      dist(s.x, s.y, astrocyte.x, astrocyte.y) < 120
    )
    .slice(0, 2); // 🔑 only 1–2 arms

  targets.forEach(s => {
    astrocyte.arms.push({
      endX: s.x,
      endY: s.y,
      wobble: random(TWO_PI)
    });
  });
}

// -----------------------------------------------------
// Draw astrocyte
// -----------------------------------------------------
function drawAstrocyte() {

  if (!astrocyte.arms.length) return;

  push();
  translate(astrocyte.x, astrocyte.y);

  // =============================
  // Soma
  // =============================
  noStroke();
  fill(getColor("astrocyte"));
  ellipse(0, 0, astrocyte.radius * 2);

  // Nucleus
  fill(180, 60, 200);
  ellipse(0, 0, 10);

  // =============================
  // Arms → Synapses
  // =============================
  stroke(getColor("astrocyte"));
  strokeWeight(5);
  noFill();

  astrocyte.arms.forEach(a => {

    const wob = sin(state.time * 0.001 + a.wobble) * 6;

    const endX = a.endX - astrocyte.x;
    const endY = a.endY - astrocyte.y;

    const midX = endX * 0.5 + wob;
    const midY = endY * 0.5 - 8;

    // Arm curve
    beginShape();
    vertex(0, 0);
    quadraticVertex(midX, midY, endX, endY);
    endShape();

    // Endfoot cap (tripartite contact)
    noStroke();
    fill(getColor("astrocyte"));
    ellipse(endX, endY, 12, 8);
  });

  pop();
}

// -----------------------------------------------------
// EXPORTS
// -----------------------------------------------------
window.initAstrocyte = initAstrocyte;
window.drawAstrocyte = drawAstrocyte;
