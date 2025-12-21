// =====================================================
// SYNAPTIC VESICLE BURST (PRESYNAPTIC)
// =====================================================
console.log("🫧 vesicleBurst loaded");

// -----------------------------------------------------
// Parameters
// -----------------------------------------------------
const VESICLE_LIFETIME = 40;
const VESICLE_SPEED = 0.6;
const VESICLE_SPREAD = 6;

// -----------------------------------------------------
// Active vesicles
// -----------------------------------------------------
const vesicles = [];

// -----------------------------------------------------
// Spawn vesicles at presynaptic bouton
// -----------------------------------------------------
function spawnVesicleBurst(x, y) {
  const count = floor(random(8, 14));

  for (let i = 0; i < count; i++) {
    vesicles.push({
      x,
      y,
      vx: random(-1, 1) * VESICLE_SPEED,
      vy: random(-0.4, 0.4) * VESICLE_SPEED,
      life: VESICLE_LIFETIME
    });
  }
}

// -----------------------------------------------------
// Update vesicles
// -----------------------------------------------------
function updateVesicles() {
  for (let i = vesicles.length - 1; i >= 0; i--) {
    const v = vesicles[i];

    v.x += v.vx;
    v.y += v.vy;
    v.life--;

    // Gentle diffusion damping
    v.vx *= 0.96;
    v.vy *= 0.96;

    if (v.life <= 0) {
      vesicles.splice(i, 1);
    }
  }
}

// -----------------------------------------------------
// Draw vesicles (synaptic cleft only)
// -----------------------------------------------------
function drawVesicles() {
  vesicles.forEach(v => {
    const alpha = map(v.life, 0, VESICLE_LIFETIME, 40, 180);

    push();
    noStroke();
    fill(getColor("vesicle", alpha));
    ellipse(v.x, v.y, 4, 4);
    pop();
  });
}
