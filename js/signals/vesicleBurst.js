// =====================================================
// SYNAPTIC VESICLE BURST (PRESYNAPTIC → POSTSYNAPTIC)
// =====================================================
console.log("🫧 vesicleBurst loaded");

// -----------------------------------------------------
// Parameters
// -----------------------------------------------------
const VESICLE_LIFETIME = 40;
const VESICLE_SPEED   = 0.8;
const VESICLE_SPREAD  = 4;
const DIRECTIONAL_BIAS = 0.75; // 0 = random, 1 = straight to PSD

// -----------------------------------------------------
// Active vesicles
// -----------------------------------------------------
const vesicles = [];

// -----------------------------------------------------
// Spawn vesicles biased toward postsynaptic density
// -----------------------------------------------------
function spawnVesicleBurst(bouton, postsynaptic) {
  if (!bouton || !postsynaptic) return;

  const count = floor(random(8, 14));

  // Direction vector: bouton → postsynapse
  const dx = postsynaptic.x - bouton.x;
  const dy = postsynaptic.y - bouton.y;
  const mag = sqrt(dx * dx + dy * dy) || 1;

  const ux = dx / mag;
  const uy = dy / mag;

  for (let i = 0; i < count; i++) {

    // Small angular noise
    const jitterX = random(-1, 1) * (1 - DIRECTIONAL_BIAS);
    const jitterY = random(-1, 1) * (1 - DIRECTIONAL_BIAS);

    vesicles.push({
      x: bouton.x + random(-VESICLE_SPREAD, VESICLE_SPREAD),
      y: bouton.y + random(-VESICLE_SPREAD * 0.5, VESICLE_SPREAD * 0.5),

      vx: (ux * DIRECTIONAL_BIAS + jitterX) * VESICLE_SPEED,
      vy: (uy * DIRECTIONAL_BIAS + jitterY) * VESICLE_SPEED,

      life: VESICLE_LIFETIME
    });
  }
}

// -----------------------------------------------------
// Update vesicles (directed diffusion)
// -----------------------------------------------------
function updateVesicles() {
  for (let i = vesicles.length - 1; i >= 0; i--) {
    const v = vesicles[i];

    v.x += v.vx;
    v.y += v.vy;
    v.life--;

    // Mild damping to simulate extracellular resistance
    v.vx *= 0.97;
    v.vy *= 0.97;

    if (v.life <= 0) {
      vesicles.splice(i, 1);
    }
  }
}

// -----------------------------------------------------
// Draw vesicles (synaptic cleft)
// -----------------------------------------------------
function drawVesicles() {
  vesicles.forEach(v => {
    const alpha = map(v.life, 0, VESICLE_LIFETIME, 40, 180);

    push();
    noStroke();
    fill(getColor("vesicle", alpha)); // 🟣 light purple
    ellipse(v.x, v.y, 4, 4);
    pop();
  });
}
