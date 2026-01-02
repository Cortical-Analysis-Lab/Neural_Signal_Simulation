console.log("🟣 astrocyteSynapse loaded");

// =====================================================
// COLORS
// =====================================================
const ASTRO_PURPLE = window.COLORS?.astrocyte ?? [185, 145, 220];

// =====================================================
// ASTROCYTIC ENDFOOT (LOCAL SPACE)
// =====================================================
function drawAstrocyteSynapse() {
  push();
  translate(0, -140); // astrocyte vertical position

  stroke(...ASTRO_PURPLE);
  fill(ASTRO_PURPLE[0], ASTRO_PURPLE[1], ASTRO_PURPLE[2], 45);

  beginShape();
  curveVertex(-200, -10);
  curveVertex(-220, -30);
  curveVertex(-160, -90);
  curveVertex(-60, -120);
  curveVertex(0, -125);
  curveVertex(60, -120);
  curveVertex(160, -90);
  curveVertex(220, -30);
  curveVertex(200, 20);
  curveVertex(120, 55);
  curveVertex(0, 65);
  curveVertex(-120, 55);
  curveVertex(-200, 20);

  // smooth return — OPEN PATH (no nub)
  curveVertex(-220, -30);
  curveVertex(-200, -10);

  endShape();
  pop();
}
