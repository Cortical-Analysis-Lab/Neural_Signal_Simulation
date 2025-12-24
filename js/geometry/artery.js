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
// Vessel local frame
// -----------------------------------------------------
function getVesselFrame(i) {
  const p0 = arteryPath[i];
  const p1 = arteryPath[min(i + 1, arteryPath.length - 1)];

  const dx = p1.x - p0.x;
  const dy = p1.y - p0.y;
  const len = sqrt(dx * dx + dy * dy) || 1;

  return {
    x: p0.x,
    y: p0.y,
    tx: dx / len,
    ty: dy / len,
    nx: -dy / len,
    ny:  dx / len,
    phase: p0.phase
  };
}

// -----------------------------------------------------
// Lumen mapping (particles only)
// -----------------------------------------------------
function getArteryPoint(t, lane = 0) {
  if (!arteryPath.length) return null;

  t = constrain(t, 0, 1);
  const i = floor(t * (arteryPath.length - 1));
  const f = getVesselFrame(i);

  return {
    x: f.x + f.nx * lane * PARTICLE_LUMEN_RADIUS,
    y: f.y + f.ny * lane * PARTICLE_LUMEN_RADIUS
  };
}

// =====================================================
// DRAW ARTERY + NVU (REFINED PROPORTIONS)
// =====================================================
function drawArtery() {
  if (!arteryPath.length) return;

  const t = state.time;
  const wallOffset = BASE_WALL_OFFSET * getVasomotionScale();

  strokeCap(ROUND);

  // =========================
  // BLOOD
  // =========================
  if (typeof drawBloodContents === "function") {
    drawBloodContents();
  }

  // =========================
  // ENDOTHELIUM (LONGER, TIGHTER)
  // =========================
  push();
  stroke(getColor("endothelium"));
  strokeWeight(6);
  noFill();

  for (let i = 0; i < arteryPath.length - 4; i += 4) {
    const f = getVesselFrame(i);
    const wob = WALL_WOBBLE_AMP * sin(t * 0.002 + f.phase);

    const ox = f.nx * (wallOffset - 6 + wob);
    const oy = f.ny * (wallOffset - 6 + wob);

    line(
      f.x + ox,
      f.y + oy,
      f.x + ox + f.tx * 60,
      f.y + oy + f.ty * 60
    );

    line(
      f.x - ox,
      f.y - oy,
      f.x - ox + f.tx * 60,
      f.y - oy + f.ty * 60
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
  // PERICYTES (ELONGATED, PARALLEL)
  // =========================
  push();
  noStroke();
  fill(getColor("pericyte"));

  for (let i = 4; i < arteryPath.length; i += 8) {
    const f = getVesselFrame(i);
    const wob = WALL_WOBBLE_AMP * sin(t * 0.002 + f.phase);

    for (let side of [-1, 1]) {
      const ox = f.nx * side * (wallOffset + 10 + wob);
      const oy = f.ny * side * (wallOffset + 10 + wob);

      push();
      translate(f.x + ox, f.y + oy);
      rotate(atan2(f.ty, f.tx));
      ellipse(0, 0, 130, 22);
      pop();
    }
  }
  pop();

  // =========================
  // ASTROCYTES (SOMA OVER PERICYTE, ENDFEET BRIDGE GAPS)
  // =========================
  for (let side of [-1, 1]) {
    for (let i = 4; i < arteryPath.length - 8; i += 8) {

      const fC = getVesselFrame(i);
      const fP = getVesselFrame(i - 4);
      const fN = getVesselFrame(i + 4);

      const wob = WALL_WOBBLE_AMP * sin(t * 0.002 + fC.phase);
      const somaOffset = wallOffset + 100 + wob;

      const sx = fC.x + fC.nx * side * somaOffset;
      const sy = fC.y + fC.ny * side * somaOffset;

      // ---- soma ----
      push();
      noStroke();
      fill(getColor("astrocyte"));
      ellipse(sx, sy, 36, 36);
      pop();

      // ---- main process ----
      push();
      stroke(getColor("astrocyte"));
      strokeWeight(6);
      line(
        sx,
        sy,
        fC.x + fC.nx * side * (wallOffset + 34),
        fC.y + fC.ny * side * (wallOffset + 34)
      );
      pop();

      // ---- upstream endfoot ----
      push();
      noStroke();
      fill(getColor("astrocyte"));
      translate(
        (fP.x + fC.x) / 2 +
          fC.nx * side * (wallOffset + 26 + wob),
        (fP.y + fC.y) / 2 +
          fC.ny * side * (wallOffset + 26 + wob)
      );
      rotate(atan2(fC.ty, fC.tx));
      ellipse(0, 0, 48, 12);
      pop();

      // ---- downstream endfoot ----
      push();
      noStroke();
      fill(getColor("astrocyte"));
      translate(
        (fC.x + fN.x) / 2 +
          fC.nx * side * (wallOffset + 26 + wob),
        (fC.y + fN.y) / 2 +
          fC.ny * side * (wallOffset + 26 + wob)
      );
      rotate(atan2(fC.ty, fC.tx));
      ellipse(0, 0, 48, 12);
      pop();
    }
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
