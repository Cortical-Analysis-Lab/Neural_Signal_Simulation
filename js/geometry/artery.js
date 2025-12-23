// =====================================================
// ARTERY GEOMETRY (STATIC, LEFT-SIDE, TUBULAR)
// =====================================================
console.log("🩸 artery geometry loaded");

let arteryPath = [];

function initArtery() {
  arteryPath = [];

  const marginLeft = 260;        // just right of mode panel
  const topY = -200;
  const bottomY = height + 200;

  // Control points for gentle anatomical curve
  const ctrl1 = {
    x: marginLeft + 40,
    y: height * 0.25
  };

  const ctrl2 = {
    x: marginLeft + 80,
    y: height * 0.55
  };

  // Sample the curve once
  const steps = 60;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;

    const x = bezierPoint(
      marginLeft,
      ctrl1.x,
      ctrl2.x,
      marginLeft + 20,
      t
    );

    const y = lerp(topY, bottomY, t);

    arteryPath.push({ x, y });
  }
}

// =====================================================
// DRAW ARTERY (NO MOTION, BACKGROUND)
// =====================================================
function drawArtery() {
  if (!arteryPath.length) return;

  const WALL_OFFSET = 16;

  strokeCap(ROUND);
  noFill();

  // ---- LUMEN (inside) ----
  stroke(getColor("arteryLumen"));
  strokeWeight(20);
  beginShape();
  arteryPath.forEach(p => vertex(p.x, p.y));
  endShape();

  // ---- LEFT WALL ----
  stroke(getColor("arteryWall"));
  strokeWeight(6);
  beginShape();
  arteryPath.forEach(p => vertex(p.x - WALL_OFFSET, p.y));
  endShape();

  // ---- RIGHT WALL ----
  beginShape();
  arteryPath.forEach(p => vertex(p.x + WALL_OFFSET, p.y));
  endShape();

  // ---- HIGHLIGHT ----
  stroke(getColor("arteryHighlight", 160));
  strokeWeight(2);
  beginShape();
  arteryPath.forEach(p =>
    vertex(p.x - WALL_OFFSET + 2, p.y - 2)
  );
  endShape();
}
