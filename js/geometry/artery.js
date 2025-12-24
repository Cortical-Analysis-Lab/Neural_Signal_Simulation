// =====================================================
// ARTERY GEOMETRY + NEUROVASCULAR UNIT (NVU)
// =====================================================
console.log("🩸 artery geometry loaded");

let arteryPath = [];

// -----------------------------------------------------
// Geometry constants
// -----------------------------------------------------
const BASE_LUMEN_RADIUS      = 20;
const PARTICLE_LUMEN_RADIUS = 20;
const BASE_WALL_OFFSET      = 32 * (4 / 3);

// -----------------------------------------------------
// Visual vasomotion (WALLS ONLY)
// -----------------------------------------------------
const VASOMOTION_FREQ = 0.0009;
const VASOMOTION_AMP  = 0.06;
const WALL_WOBBLE_AMP = 2.5;

// -----------------------------------------------------
// Build artery centerline
// -----------------------------------------------------
function initArtery() {
  arteryPath = [];

  const marginLeft = 260;
  const topY = -300;
  const bottomY = height + 300;

  const ctrl1 = { x: marginLeft - 60,  y: height * 0.25 };
  const ctrl2 = { x: marginLeft - 120, y: height * 0.6 };

  const steps = 80;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;

    arteryPath.push({
      x: bezierPoint(
        marginLeft,
        ctrl1.x,
        ctrl2.x,
        marginLeft - 40,
        t
      ),
      y: lerp(topY, bottomY, t),
      phase: t * TWO_PI
    });
  }

  if (typeof initBloodContents === "function") {
    initBloodContents();
  }
}

// -----------------------------------------------------
// Vasomotion scale (walls only)
// -----------------------------------------------------
function getVasomotionScale() {
  return 1.0 + VASOMOTION_AMP * sin(state.time * VASOMOTION_FREQ);
}

// -----------------------------------------------------
// Lumen mapping (particles only)
// -----------------------------------------------------
function getArteryPoint(t, lane = 0) {
  if (!arteryPath.length) return null;

  t = constrain(t, 0, 1);
  const i = floor(t * (arteryPath.length - 1));
  const p0 = arteryPath[i];
  const p1 = arteryPath[min(i + 1, arteryPath.length - 1)];

  const dx = p1.x - p0.x;
  const dy = p1.y - p0.y;
  const len = sqrt(dx * dx + dy * dy) || 1;

  const nx = -dy / len;
  const ny =  dx / len;

  return {
    x: p0.x + nx * lane * PARTICLE_LUMEN_RADIUS,
    y: p0.y + ny * lane * PARTICLE_LUMEN_RADIUS
  };
}

// =====================================================
// DRAW ARTERY + BBB + NVU (BIOLOGICALLY PROPORTIONED)
// =====================================================
function drawArtery() {
  if (!arteryPath.length) return;

  const t = state.time;
  const wallOffset = BASE_WALL_OFFSET * getVasomotionScale();

  strokeCap(ROUND);

  // =========================
  // BLOOD (LUMEN)
  // =========================
  if (typeof drawBloodContents === "function") {
    drawBloodContents();
  }

  // =========================
  // ENDOTHELIUM (LONG CELLS)
  // =========================
  push();
  stroke(getColor("endothelium"));
  strokeWeight(5);
  noFill();

  for (let i = 0; i < arteryPath.length - 2; i += 5) { // longer cells
    const p0 = arteryPath[i];
    const p1 = arteryPath[i + 2];

    const wobL = WALL_WOBBLE_AMP * sin(t * 0.002 + p0.phase);
    const wobR = WALL_WOBBLE_AMP * sin(t * 0.002 + p0.phase + PI);

    line(
      p0.x - wallOffset + 6 - wobL,
      p0.y,
      p1.x - wallOffset + 6 - wobL,
      p1.y
    );

    line(
      p0.x + wallOffset - 6 + wobR,
      p0.y,
      p1.x + wallOffset - 6 + wobR,
      p1.y
    );
  }
  pop();

  // =========================
  // ARTERY WALL
  // =========================
  push();
  stroke(getColor("arteryWall"));
  strokeWeight(8);
  noFill();

  beginShape();
  arteryPath.forEach(p => {
    vertex(
      p.x - wallOffset -
        WALL_WOBBLE_AMP * sin(t * 0.002 + p.phase),
      p.y
    );
  });
  endShape();

  beginShape();
  arteryPath.forEach(p => {
    vertex(
      p.x + wallOffset +
        WALL_WOBBLE_AMP * sin(t * 0.002 + p.phase + PI),
      p.y
    );
  });
  endShape();
  pop();

  // =========================
  // PERICYTES (ELONGATED, GAP-SPANNING)
  // =========================
  push();
  noStroke();
  fill(getColor("pericyte"));

  for (let i = 4; i < arteryPath.length; i += 10) {
    const p = arteryPath[i];
    const wob = WALL_WOBBLE_AMP * sin(t * 0.002 + p.phase);

    // aligned with vessel axis
    ellipse(
      p.x - wallOffset - 8 - wob,
      p.y,
      22, // length spans endothelial gap
      8
    );

    ellipse(
      p.x + wallOffset + 8 + wob,
      p.y,
      22,
      8
    );
  }
  pop();

  // =========================
  // ASTROCYTES (NVU-CORRECT SCALE)
  // =========================
  for (let i = 8; i < arteryPath.length; i += 16) {
    const p = arteryPath[i];

    const somaX = p.x - wallOffset - 90;
    const somaY = p.y + 35 * sin(p.phase * 0.6);

    // ---- soma (≈ half neuron size) ----
    push();
    noStroke();
    fill(getColor("astrocyte"));
    ellipse(somaX, somaY, 22, 22);
    pop();

    // ---- supporting processes ----
    push();
    stroke(getColor("astrocyte"));
    strokeWeight(3);
    noFill();

    const angles = [ -0.7, 0.2, 0.9 ];
    angles.forEach(a => {
      line(
        somaX,
        somaY,
        somaX + 30 * cos(a),
        somaY + 30 * sin(a)
      );
    });

    // ---- vessel-directed process ----
    strokeWeight(4);
    line(
      somaX,
      somaY,
      p.x - wallOffset - 18,
      p.y
    );
    pop();

    // ---- endfoot (bridges pericyte gaps) ----
    push();
    noStroke();
    fill(getColor("astrocyte"));
    ellipse(
      p.x - wallOffset - 18,
      p.y,
      18, // wide enough to cover gap
      6
    );
    pop();
  }

  // =========================
  // INNER HIGHLIGHT
  // =========================
  push();
  stroke(getColor("arteryHighlight", 120));
  strokeWeight(2);
  noFill();

  beginShape();
  arteryPath.forEach(p => {
    vertex(
      p.x - wallOffset + 3 -
        WALL_WOBBLE_AMP * 0.6 * sin(t * 0.002 + p.phase),
      p.y - 3
    );
  });
  endShape();
  pop();
}
