console.log("🫧 synapse/vesicles loaded");

// =====================================================
// SYNAPTIC VESICLE SYSTEM — PRESYNAPTIC LOCAL SPACE
// =====================================================
// ✔ Thick border circles
// ✔ Empty → loaded → release → recycle
// ✔ Event-driven AP release
// ✔ Geometry-correct (x = 0 membrane)
// =====================================================

// -----------------------------------------------------
// STORAGE (RELOAD SAFE, FULLY NAMESPACED)
// -----------------------------------------------------
window.synapseVesicles = window.synapseVesicles || [];
var synapseVesicles = window.synapseVesicles;

// -----------------------------------------------------
// VISUAL CONSTANTS
// -----------------------------------------------------
var SYNAPSE_VESICLE_RADIUS = 10;
var SYNAPSE_VESICLE_STROKE = 4;

// -----------------------------------------------------
// GEOMETRY-AWARE PRESYNAPTIC BOUNDS
// (Derived from neuronShape.js)
// -----------------------------------------------------
var SYNAPSE_MEMBRANE_X = 0;      // synaptic face
var SYNAPSE_INNER_X    = 220;    // cytosolic depth
var SYNAPSE_BAR_HALF_Y = 200;    // vertical half-height

var SYNAPSE_LOAD_DISTANCE_X = 40;
var SYNAPSE_MAX_LOADED_VESICLES = 6;

// -----------------------------------------------------
// COLORS (ES5 SAFE)
// -----------------------------------------------------
function synapseColorEmpty()  { return color(210, 220, 235); }
function synapseColorLoaded() { return color(180, 120, 255); }
function synapseColorBorder() { return color(40); }

// -----------------------------------------------------
// VESICLE STATES
// -----------------------------------------------------
var SYNAPSE_VESICLE_STATES = {
  EMPTY:     "empty",
  LOADING:   "loading",
  LOADED:    "loaded",
  SNARED:    "snared",
  FUSED:     "fused",
  RECYCLING: "recycling"
};

// -----------------------------------------------------
// SPAWN EMPTY VESICLE (INSIDE CYTOSOL)
// -----------------------------------------------------
function spawnSynapseEmptyVesicle() {
  synapseVesicles.push({
    x: random(80, SYNAPSE_INNER_X),
    y: random(
      -SYNAPSE_BAR_HALF_Y + 40,
       SYNAPSE_BAR_HALF_Y - 40
    ),
    vx: random(-0.4, -0.7),   // drift toward membrane
    vy: random(-0.2,  0.2),

    fillLevel: 0,
    state: SYNAPSE_VESICLE_STATES.EMPTY,
    timer: 0
  });
}

// -----------------------------------------------------
// LOADING CHECK (NEAR MEMBRANE)
// -----------------------------------------------------
function attemptSynapseVesicleLoading(v) {
  if (v.state !== SYNAPSE_VESICLE_STATES.EMPTY) return;

  if (v.x <= SYNAPSE_LOAD_DISTANCE_X) {
    v.state = SYNAPSE_VESICLE_STATES.LOADING;
    v.fillLevel = 0;
    v.vx = 0;
    v.vy = 0;
  }
}

// -----------------------------------------------------
// UPDATE SYNAPTIC VESICLES (STATE MACHINE)
// -----------------------------------------------------
function updateSynapseVesicles() {

  // Maintain vesicle pool
  var loadedCount = 0;
  for (var i = 0; i < synapseVesicles.length; i++) {
    if (synapseVesicles[i].state === SYNAPSE_VESICLE_STATES.LOADED) {
      loadedCount++;
    }
  }

  if (
    synapseVesicles.length < 10 &&
    loadedCount < SYNAPSE_MAX_LOADED_VESICLES
  ) {
    spawnSynapseEmptyVesicle();
  }

  for (var i = 0; i < synapseVesicles.length; i++) {
    var v = synapseVesicles[i];

    // EMPTY → LOADING
    if (v.state === SYNAPSE_VESICLE_STATES.EMPTY) {
      v.x += v.vx;
      v.y += v.vy;
      attemptSynapseVesicleLoading(v);
    }

    // LOADING (vacuum fill)
    else if (v.state === SYNAPSE_VESICLE_STATES.LOADING) {
      v.fillLevel += 0.04;
      if (v.fillLevel >= 1) {
        v.fillLevel = 1;
        v.state = SYNAPSE_VESICLE_STATES.LOADED;
      }
    }

    // LOADED (DOCKED AT MEMBRANE)
    else if (v.state === SYNAPSE_VESICLE_STATES.LOADED) {
      v.y += sin(frameCount * 0.03 + v.x) * 0.25;
    }

    // SNARED → FUSED
    else if (v.state === SYNAPSE_VESICLE_STATES.SNARED) {
      v.x -= 1.4;
      if (v.x <= SYNAPSE_MEMBRANE_X + 2) {
        v.state = SYNAPSE_VESICLE_STATES.FUSED;
        v.timer = 0;
      }
    }

    // FUSED
    else if (v.state === SYNAPSE_VESICLE_STATES.FUSED) {
      v.timer++;
      if (v.timer > 18) {
        v.state = SYNAPSE_VESICLE_STATES.RECYCLING;
      }
    }

    // RECYCLING → EMPTY
    else if (v.state === SYNAPSE_VESICLE_STATES.RECYCLING) {
      v.x += 1.8;
      if (v.x >= SYNAPSE_INNER_X) {
        v.state = SYNAPSE_VESICLE_STATES.EMPTY;
      }
    }
  }
}

// -----------------------------------------------------
// AP TRIGGER — RELEASE LOADED VESICLES
// -----------------------------------------------------
function triggerSynapseVesicleRelease() {
  for (var i = 0; i < synapseVesicles.length; i++) {
    if (synapseVesicles[i].state === SYNAPSE_VESICLE_STATES.LOADED) {
      synapseVesicles[i].state = SYNAPSE_VESICLE_STATES.SNARED;
    }
  }
}

// -----------------------------------------------------
// DRAW SYNAPTIC VESICLES
// -----------------------------------------------------
function drawSynapseVesicles() {
  push();
  strokeWeight(SYNAPSE_VESICLE_STROKE);

  for (var i = 0; i < synapseVesicles.length; i++) {
    var v = synapseVesicles[i];

    stroke(synapseColorBorder());
    fill(
      v.state === SYNAPSE_VESICLE_STATES.LOADED ||
      v.state === SYNAPSE_VESICLE_STATES.FUSED
        ? synapseColorLoaded()
        : synapseColorEmpty()
    );

    ellipse(v.x, v.y, SYNAPSE_VESICLE_RADIUS * 2);

    if (v.fillLevel > 0) {
      noStroke();
      fill(200, 140, 255, 180);
      ellipse(
        v.x,
        v.y,
        SYNAPSE_VESICLE_RADIUS * 2 * v.fillLevel
      );
    }
  }

  pop();
}
