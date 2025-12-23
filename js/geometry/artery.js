// =====================================================
// ARTERY GEOMETRY — CUTAWAY VASCULATURE (FOUNDATION)
// =====================================================
console.log("🩸 artery geometry loaded");

// =====================================================
// CONFIGURATION
// =====================================================
const artery = {

  // Positioning
  x: 140,          // left-side placement
  yTop: -200,
  yBottom: null,   // auto-set based on canvas

  // Geometry
  radius: 26,      // lumen radius
  wallThickness: 8,

  // Curvature
  bendAmplitude: 18,
  bendFrequency: 0.002
};

// =====================================================
// INITIALIZE (call after canvas size is known)
// =====================================================
function initArtery() {
  artery.yBottom = height + 200;
}

// =====================================================
// MAIN DRAW FUNCTION
// =====================================================
function drawArtery() {
  drawArteryLumen();
  drawArteryWalls();
  drawArteryHighlight();
}

// =====================================================
// LUMEN (INTERIOR — BLOOD SPACE)
// =====================================================
function drawArteryLumen() {
  noStroke();
  fill(getColor("arteryLumen"));

  beginShape();
  for (let y = artery.yTop; y <= artery.yBottom; y += 10) {
    const offset = arteryOffset(y);
    vertex(artery.x + offset, y);
  }
  for (let y = artery.yBottom; y >= artery.yTop; y -= 10) {
    const offset = arteryOffset(y);
    vertex(
      artery.x + offset + artery.radius * 2,
      y
    );
  }
  endShape(CLOSE);
}

// =====================================================
// ARTERY WALLS (LEFT & RIGHT)
// =====================================================
function drawArteryWalls() {
  stroke(getColor("arteryWall"));
  strokeCap(ROUND);
  strokeWeight(artery.wallThickness);
  noFill();

  // Left wall
  beginShape();
  for (let y = artery.yTop; y <= artery.yBottom; y += 10) {
    vertex(
      artery.x + arteryOffset(y),
      y
    );
  }
  endShape();

  // Right wall
  beginShape();
  for (let y = artery.yTop; y <= artery.yBottom; y += 10) {
    vertex(
      artery.x + arteryOffset(y) + artery.radius * 2,
      y
    );
  }
  endShape();
}

// =====================================================
// SUBTLE SPECULAR HIGHLIGHT
// =====================================================
function drawArteryHighlight() {
  stroke(getColor("arteryHighlight", 120));
  strokeWeight(2);
  noFill();

  beginShape();
  for (let y = artery.yTop; y <= artery.yBottom; y += 14) {
    vertex(
      artery.x + arteryOffset(y) + 4,
      y
    );
  }
  endShape();
}

// =====================================================
// ORGANIC OFFSET (PULSATION / BEND)
// =====================================================
function arteryOffset(y) {
  return sin(
    y * artery.bendFrequency + frameCount * 0.01
  ) * artery.bendAmplitude;
}
