// =====================================================
// SYNAPTIC VESICLE BURST (VISUAL ONLY)
// =====================================================
console.log("vesicleBurst loaded");

// -----------------------------------------------------
// Parameters
// -----------------------------------------------------
const VESICLE_COUNT = 18;
const VESICLE_LIFETIME = 22;
const VESICLE_SPREAD = 10;

// -----------------------------------------------------
// Active vesicles
// -----------------------------------------------------
const vesicles = [];

// -----------------------------------------------------
// Spawn vesicle burst in synaptic cleft
// -----------------------------------------------------
function spawnVesicleBurst(bouton, postsynapticPoint) {

  for (let i = 0; i < VESICLE_COUNT; i++) {

    const t = random();
    const x = lerp(bouton.x, postsynapticPoint.x, t)
              + random(-VESICLE_SPREAD, VESICLE_SPREAD);
    const y = lerp(bouton.y, postsynapticPoint.y, t)
              + random(-VESICLE_SPREAD, VESICLE_SPREAD);

    vesicles.push({
      x,
      y,
      vx: random(-0.2, 0.4),
      vy: random(-0.4, 0.4),
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

    if (v.life <= 0) {
      vesicles.splice(i, 1);
    }
  }
}

// -----------------------------------------------------
// Draw vesicles (soft glowing dots)
// -----------------------------------------------------
function drawVesicles() {
  vesicles.forEach(v => {
    const a = map(v.life, 0, VESICLE_LIFETIME, 40, 180);

    push();
    noStroke();
    fill(255, 220, 120, a);
    ellipse(v.x, v.y, 4, 4);
    pop();
  });
}
