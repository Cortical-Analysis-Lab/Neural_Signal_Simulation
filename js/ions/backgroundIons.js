// =====================================================
// BACKGROUND ECS IONS — STATIC CONTEXT
// =====================================================
console.log("🧂 backgroundIons loaded");

// -----------------------------------------------------
// GLOBAL ECS CONTAINER (RELOAD-SAFE)
// -----------------------------------------------------
window.ecsIons = window.ecsIons || {};
ecsIons.Na = ecsIons.Na || [];
ecsIons.K  = ecsIons.K  || [];

// -----------------------------------------------------
// VISUAL CONSTANTS
// -----------------------------------------------------
const ECS_ION_COUNTS = { Na: 260, K: 160 };

const ION_TEXT_SIZE_NA = 10;
const ION_TEXT_SIZE_K  = 11;

// -----------------------------------------------------
// INITIALIZATION
// -----------------------------------------------------
function initBackgroundIons() {

  // clear without breaking shared references
  ecsIons.Na.length = 0;
  ecsIons.K.length  = 0;

  const b = {
    xmin: -width * 0.9,
    xmax:  width * 0.9,
    ymin: -height * 0.9,
    ymax:  height * 0.9
  };

  function spawn(type) {
    ecsIons[type].push({
      x: random(b.xmin, b.xmax),
      y: random(b.ymin, b.ymax)
    });
  }

  for (let i = 0; i < ECS_ION_COUNTS.Na; i++) spawn("Na");
  for (let i = 0; i < ECS_ION_COUNTS.K;  i++) spawn("K");
}

// -----------------------------------------------------
// DRAW
// -----------------------------------------------------
function drawBackgroundIons() {
  push();
  textAlign(CENTER, CENTER);
  noStroke();

  textSize(ION_TEXT_SIZE_NA);
  fill(getColor("sodium", 120));
  ecsIons.Na.forEach(p => text("Na⁺", p.x, p.y));

  textSize(ION_TEXT_SIZE_K);
  fill(getColor("potassium", 130));
  ecsIons.K.forEach(p => text("K⁺", p.x, p.y));

  pop();
}

// -----------------------------------------------------
// EXPORTS
// -----------------------------------------------------
window.initBackgroundIons = initBackgroundIons;
window.drawBackgroundIons = drawBackgroundIons;
