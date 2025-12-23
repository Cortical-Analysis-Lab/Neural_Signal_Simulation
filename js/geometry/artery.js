// =====================================================
// ARTERY GEOMETRY (STATIC, LEFT-SIDE, TUBULAR)
// =====================================================
console.log("🩸 artery geometry loaded");

let arteryPath = [];

// -----------------------------------------------------
// BUILD STATIC ARTERY PATH (SCREEN SPACE)
// -----------------------------------------------------
function initArtery() {
  arteryPath = [];

  // 🔑 Fixed screen-space placement
  const marginLeft = 240;          // hugs left UI panel
  const topY       = -300;
  const bottomY    = height + 300;

  // Gentle anatomical bow around neuron 1
  const bendOut = 90;

  const ctrl1 = {
    x: marginLeft + bendOut,
    y: height * 0.25
  };

  const ctrl2 = {
    x: marginLeft + bendOut,
    y: height * 0.65
  };

  const steps = 80;

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

// -----------------------------------------------------
// DRAW ARTERY (STATIC, BACKGROUND LAYER)
// -----------------------------------------------------
function drawArtery() {
  if (!arteryPath.length) return;

  const WALL_OFFSET = 18;

  strokeCap(ROUND);
  noFill();

  // =============================
  // LUMEN (inside the vessel)
  // =============================
  stroke(getColor("arteryLumen"));
  strokeWeight(22);
  beginShape();
  arteryPath.forEach(p => vertex(p.x, p.y));
  endShape();

  // =============================
  // LEFT WALL
  // =============================
  stroke(getColor("arteryWall"));
  strokeWeight(6);
  beginShape();
  arteryPath.forEach(p => vertex(p.x - WALL_OFFSET, p.y));
  endShape();

  // =============================
  // RIGHT WALL
  // =============================
  beginShape();
  arteryPath.forEach(p => vertex(p.x + WALL_OFFSET, p.y));
  endShape();

  // =============================
  // SPECULAR HIGHLIGHT
  // =============================
  stroke(getColor("arteryHighlight", 150));
  strokeWeight(2);
  beginShape();
  arteryPath.forEach(p =>
    vertex(p.x - WALL_OFFSET + 2, p.y - 3)
  );
  endShape();
}
