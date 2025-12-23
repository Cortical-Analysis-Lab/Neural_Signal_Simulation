// =====================================================
// ARTERY GEOMETRY (STATIC, LEFT-SIDE, TUBULAR)
// =====================================================
console.log("🩸 artery geometry loaded");

let arteryPath = [];

function initArtery() {
  arteryPath = [];

  const marginLeft = 260;        // just right of mode panel
  const topY = -300;
  const bottomY = height + 300;

  // 🔁 Curve LEFT (toward panel)
  const ctrl1 = {
    x: marginLeft - 60,
    y: height * 0.25
  };

  const ctrl2 = {
    x: marginLeft - 120,
    y: height * 0.6
  };

  const steps = 80;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;

    const x = bezierPoint(
      marginLeft,
      ctrl1.x,
      ctrl2.x,
      marginLeft - 40,
      t
    );

    const y = lerp(topY, bottomY, t);
    arteryPath.push({ x, y });
  }
}

// =====================================================
// DRAW ARTERY (STATIC, SCREEN SPACE)
// =====================================================
function drawArtery() {
  if (!arteryPath.length) return;

  // 🔥 Twice as wide
  const WALL_OFFSET = 32;

  strokeCap(ROUND);
  noFill();

  // ---- LUMEN (inside) ----
  stroke(getColor("arteryLumen"));
  strokeWeight(40);
  beginShape();
  arteryPath.forEach(p => vertex(p.x, p.y));
  endShape();

  // ---- LEFT WALL ----
  stroke(getColor("arteryWall"));
  strokeWeight(8);
  beginShape();
  arteryPath.forEach(p => vertex(p.x - WALL_OFFSET, p.y));
  endShape();

  // ---- RIGHT WALL ----
  beginShape();
  arteryPath.forEach(p => vertex(p.x + WALL_OFFSET, p.y));
  endShape();

  // ---- HIGHLIGHT ----
  stroke(getColor("arteryHighlight", 160));
  strokeWeight(3);
  beginShape();
  arteryPath.forEach(p =>
    vertex(p.x - WALL_OFFSET + 4, p.y - 4)
  );
  endShape();
}
