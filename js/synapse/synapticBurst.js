console.log("🫧 synapticBurst loaded");

// =====================================================
// SYNAPTIC NEUROTRANSMITTER BURST SYSTEM
// =====================================================

window.synapticNTs = window.synapticNTs || [];

// -----------------------------------------------------
// LISTEN FOR RELEASE EVENTS
// -----------------------------------------------------
window.addEventListener("synapticRelease", (e) => {

  const { x, y, strength } = e.detail;

  const count = floor(12 * strength);

  for (let i = 0; i < count; i++) {
    synapticNTs.push({
      x,
      y,
      vx: random(0.6, 1.4),
      vy: random(-0.6, 0.6),
      life: random(80, 140),
      alpha: 255
    });
  }
});

// -----------------------------------------------------
// UPDATE
// -----------------------------------------------------
function updateSynapticBurst() {

  for (let i = synapticNTs.length - 1; i >= 0; i--) {
    const p = synapticNTs[i];

    p.x += p.vx;
    p.y += p.vy;
    p.vx *= 0.98;
    p.vy *= 0.98;

    p.alpha -= 2;
    p.life--;

    if (p.life <= 0 || p.alpha <= 0) {
      synapticNTs.splice(i, 1);
    }
  }
}

// -----------------------------------------------------
// DRAW
// -----------------------------------------------------
function drawSynapticBurst() {
  push();
  noStroke();
  fill(185, 120, 255, 200);

  for (const p of synapticNTs) {
    circle(p.x, p.y, 3);
  }

  pop();
}
