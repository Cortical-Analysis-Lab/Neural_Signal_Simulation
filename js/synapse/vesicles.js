console.log("🫧 synapse/vesicles loaded");

// =====================================================
// SYNAPTIC VESICLE SYSTEM — PRESYNAPTIC LOCAL SPACE
// =====================================================
// ✔ Thick border circles
// ✔ Empty → loaded → release → recycle
// ✔ Event-driven AP release
// ✔ Teaching-first visuals
// =====================================================

// -----------------------------------------------------
// STORAGE (RELOAD SAFE, FULLY NAMESPACED)
// -----------------------------------------------------
window.synapseVesicles = window.synapseVesicles || [];
var synapseVesicles = window.synapseVesicles;

// -----------------------------------------------------
// TUNING CONSTANTS (NAMESPACED)
// -----------------------------------------------------
var SYNAPSE_VESICLE_RADIUS = 10;
var SYNAPSE_VESICLE_STROKE = 4;

var SYNAPSE_MAX_LOADED_VESICLES = 6;

var SYNAPSE_BACK_ZONE_Y  = -90;
var SYNAPSE_FRONT_ZONE_Y = -25;

var SYNAPSE_LOAD_DISTANCE = 14;

// -----------------------------------------------------
// COLORS (NAMESPACED, ES5 SAFE)
// -----------------------------------------------------
function synapseColorEmpty() {
  return color(210, 220, 235);
}

function synapseColorLoaded() {
  return color(180, 120, 255);
}

function synapseColorBorder() {
  return color(40);
}

// -----------------------------------------------------
// VESICLE STATES (NAMESPACED)
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
// SPAWN EMPTY VESICLE (BACK OF PRESYNAPSE)
// -----------------------------------------------------
function spawnSynapseEmptyVesicle() {
  synapseVesicles.push({
    x: random(-40, 40),
    y: random(
      SYNAPSE_BACK_ZONE_Y - 10,
      SYNAPSE_BACK_ZONE_Y + 10
    ),
    vx: random(-0.3, 0.3),
    vy: random(0.3, 0.6),

    fillLevel: 0,
    state: SYNAPSE_VESICLE_STATES.EMPTY,
    timer: 0
  });
}

// -----------------------------------------------------
// ATP / H+ LOADING LOGIC (SYMBOLIC)
// -----------------------------------------------------
function attemptSynapseVesicleLoading(v) {
  if (v.state !== SYNAPSE_VESICLE_STATES.EMPTY) return;

  if (abs(v.y - SYNAPSE_FRONT_ZONE_Y) < SYNAPSE_LOAD_DISTANCE) {
    v.state = SYNAPSE_VESICLE_STATES.LOADING;
    v.fillLevel = 0;
  }
}

// -----------------------------------------------------
// UPDATE SYNAPTIC VESICLES (STATE MACHINE)
// -----------------------------------------------------
function updateSynapseVesicles() {

  // Maintain population
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
      v.y += v.vy;
      v.x += v.vx;
      attemptSynapseVesicleLoading(v);
    }

    // LOADING
    else if (v.state === SYNAPSE_VESICLE_STATES.LOADING) {
      v.fillLevel += 0.04;
      if (v.fillLevel >= 1) {
        v.fillLevel = 1;
        v.state = SYNAPSE_VESICLE_STATES.LOADED;
        v.y = random(
          SYNAPSE_FRONT_ZONE_Y - 10,
          SYNAPSE_FRONT_ZONE_Y + 10
        );
        v.x = random(-50, 50);
      }
    }

    // LOADED (DOCKED)
    else if (v.state === SYNAPSE_VESICLE_STATES.LOADED) {
      v.x += sin(frameCount * 0.02 + v.y) * 0.2;
    }

    // SNARED → FUSED
    else if (v.state === SYNAPSE_VESICLE_STATES.SNARED) {
      v.y += 0.8;
      if (v.y > -5) {
        v.state = SYNAPSE_VESICLE_STATES.FUSED;
        v.timer = 0;
      }
    }

    // FUSED
    else if (v.state === SYNAPSE_VESICLE_STATES.FUSED) {
      v.timer++;
      if (v.timer > 20) {
        v.state = SYNAPSE_VESICLE_STATES.RECYCLING;
        v.fillLevel = 0;
      }
    }

    // RECYCLING → EMPTY
    else if (v.state === SYNAPSE_VESICLE_STATES.RECYCLING) {
      v.y -= 1.2;
      if (v.y < SYNAPSE_BACK_ZONE_Y) {
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
// DRAW SYNAPTIC VESICLES (LOCAL SPACE)
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

    ellipse(
      v.x,
      v.y,
      SYNAPSE_VESICLE_RADIUS * 2
    );

    // Neurotransmitter fill
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
