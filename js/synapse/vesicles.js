console.log("🫧 synapse/vesicles loaded");

// =====================================================
// VESICLE SYSTEM — PRESYNAPTIC LOCAL SPACE
// =====================================================
// ✔ Thick border circles
// ✔ Empty → loaded → release → recycle
// ✔ Event-driven AP release
// ✔ Teaching-first visuals
// =====================================================

// -----------------------------------------------------
// STORAGE (RELOAD SAFE)
// -----------------------------------------------------
window.synapticVesicles = window.synapticVesicles || [];
const vesicles = window.synapticVesicles;

// -----------------------------------------------------
// TUNING CONSTANTS
// -----------------------------------------------------
const VESICLE_RADIUS = 10;
const VESICLE_STROKE = 4;

const MAX_LOADED_VESICLES = 6;

const BACK_ZONE_Y  = -90;
const FRONT_ZONE_Y = -25;

const LOAD_DISTANCE = 14;
const FUSE_DISTANCE = 6;

// -----------------------------------------------------
// COLORS
// -----------------------------------------------------
const COLOR_EMPTY = () => color(210, 220, 235);
const COLOR_LOADED = () => color(180, 120, 255);
const COLOR_BORDER = () => color(40);

// -----------------------------------------------------
// VESICLE STATES
// -----------------------------------------------------
const STATES = {
  EMPTY:        "empty",
  LOADING:      "loading",
  LOADED:       "loaded",
  SNARED:       "snared",
  FUSED:        "fused",
  RECYCLING:    "recycling"
};

// -----------------------------------------------------
// SPAWN EMPTY VESICLE (BACK OF PRESYNAPSE)
// -----------------------------------------------------
function spawnEmptyVesicle() {
  vesicles.push({
    x: random(-40, 40),
    y: random(BACK_ZONE_Y - 10, BACK_ZONE_Y + 10),
    vx: random(-0.3, 0.3),
    vy: random(0.3, 0.6),

    fillLevel: 0,
    state: STATES.EMPTY,
    timer: 0
  });
}

// -----------------------------------------------------
// ATP / H+ INTERACTION (SYMBOLIC)
// -----------------------------------------------------
function attemptLoading(v) {
  if (v.state !== STATES.EMPTY) return;

  const nearLoader = abs(v.y - FRONT_ZONE_Y) < LOAD_DISTANCE;

  if (nearLoader) {
    v.state = STATES.LOADING;
    v.fillLevel = 0;
  }
}

// -----------------------------------------------------
// UPDATE VESICLE STATE MACHINE
// -----------------------------------------------------
function updateVesicles() {

  // Maintain population
  const loadedCount = vesicles.filter(v => v.state === STATES.LOADED).length;
  if (vesicles.length < 10 && loadedCount < MAX_LOADED_VESICLES) {
    spawnEmptyVesicle();
  }

  vesicles.forEach(v => {

    // -----------------------------
    // EMPTY → LOADING
    // -----------------------------
    if (v.state === STATES.EMPTY) {
      v.y += v.vy;
      v.x += v.vx;
      attemptLoading(v);
    }

    // -----------------------------
    // LOADING (H+ in, ATP → ADP+Pi)
    // -----------------------------
    else if (v.state === STATES.LOADING) {
      v.fillLevel += 0.04;
      if (v.fillLevel >= 1) {
        v.fillLevel = 1;
        v.state = STATES.LOADED;
        v.y = random(FRONT_ZONE_Y - 10, FRONT_ZONE_Y + 10);
        v.x = random(-50, 50);
      }
    }

    // -----------------------------
    // LOADED (DOCKED, WAITING)
    // -----------------------------
    else if (v.state === STATES.LOADED) {
      v.x += sin(frameCount * 0.02 + v.y) * 0.2;
    }

    // -----------------------------
    // SNARED → FUSED
    // -----------------------------
    else if (v.state === STATES.SNARED) {
      v.y += 0.8;
      if (v.y > -5) {
        v.state = STATES.FUSED;
        v.timer = 0;
      }
    }

    // -----------------------------
    // FUSED (NEUROTRANSMITTER DUMP)
    // -----------------------------
    else if (v.state === STATES.FUSED) {
      v.timer++;
      if (v.timer > 20) {
        v.state = STATES.RECYCLING;
        v.fillLevel = 0;
      }
    }

    // -----------------------------
    // RECYCLING → EMPTY
    // -----------------------------
    else if (v.state === STATES.RECYCLING) {
      v.y -= 1.2;
      if (v.y < BACK_ZONE_Y) {
        v.state = STATES.EMPTY;
      }
    }
  });
}

// -----------------------------------------------------
// ACTION POTENTIAL TRIGGER
// -----------------------------------------------------
function triggerVesicleRelease() {
  vesicles.forEach(v => {
    if (v.state === STATES.LOADED) {
      v.state = STATES.SNARED;
    }
  });
}

// -----------------------------------------------------
// DRAW VESICLES (LOCAL SPACE)
// -----------------------------------------------------
function drawVesicles() {
  push();
  noFill();
  strokeWeight(VESICLE_STROKE);

  vesicles.forEach(v => {

    stroke(COLOR_BORDER());

    if (v.state === STATES.LOADED || v.state === STATES.FUSED) {
      fill(COLOR_LOADED());
    } else {
      fill(COLOR_EMPTY());
    }

    ellipse(v.x, v.y, VESICLE_RADIUS * 2);

    // Neurotransmitter fill (vacuum loading)
    if (v.fillLevel > 0) {
      noStroke();
      fill(200, 140, 255, 180);
      ellipse(
        v.x,
        v.y,
        VESICLE_RADIUS * 2 * v.fillLevel
      );
    }
  });

  pop();
}
