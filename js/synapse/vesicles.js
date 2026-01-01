console.log("🫧 synapse/vesicles loaded");

// =====================================================
// SYNAPTIC VESICLE SYSTEM — PRESYNAPTIC LOCAL SPACE
// =====================================================

// -----------------------------------------------------
// STORAGE
// -----------------------------------------------------
window.synapseVesicles = window.synapseVesicles || [];
var synapseVesicles = window.synapseVesicles;

var synapseH   = [];
var synapseATP = [];

// -----------------------------------------------------
// GEOMETRY
// -----------------------------------------------------
var SYNAPSE_MEMBRANE_X      = 0;
var SYNAPSE_CLUSTER_X      = 120;
var SYNAPSE_CLUSTER_RADIUS = 70;
var SYNAPSE_CLUSTER_Y      = 0;

// -----------------------------------------------------
// VISUALS
// -----------------------------------------------------
var SYNAPSE_VESICLE_RADIUS = 10;
var SYNAPSE_VESICLE_STROKE = 4;

// -----------------------------------------------------
// CONTROL
// -----------------------------------------------------
var synapseLoaderActive = false;

// -----------------------------------------------------
// STATES
// -----------------------------------------------------
var SYNAPSE_VESICLE_STATES = {
  EMPTY:     "empty",
  PRIMING:   "priming",
  LOADING:   "loading",
  LOADED:    "loaded",
  SNARED:    "snared",
  FUSED:     "fused",
  RECYCLING: "recycling"
};

// -----------------------------------------------------
// COLORS
// -----------------------------------------------------
function synapseColorEmpty()  { return color(210, 220, 235); }
function synapseColorLoaded() { return color(180, 120, 255); }
function synapseColorBorder() { return color(40); }

// -----------------------------------------------------
// SPAWN EMPTY VESICLE
// -----------------------------------------------------
function spawnSynapseEmptyVesicle() {
  var a = random(TWO_PI);
  var r = random(0, SYNAPSE_CLUSTER_RADIUS);

  synapseVesicles.push({
    x: SYNAPSE_CLUSTER_X + cos(a) * r,
    y: SYNAPSE_CLUSTER_Y + sin(a) * r,
    fillLevel: 0,
    state: SYNAPSE_VESICLE_STATES.EMPTY,
    timer: 0
  });
}

// -----------------------------------------------------
// SPAWN ATP + H+ (PRIMING)
// -----------------------------------------------------
function spawnPrimingParticles(v) {

  synapseH.push({
    x: v.x - 24,
    y: v.y,
    vx: 1.6,
    target: v
  });

  synapseATP.push({
    x: v.x - 36,
    y: v.y + random(-8, 8),
    vx: 1.2,
    bounced: false,
    life: 20
  });
}

// -----------------------------------------------------
// UPDATE VESICLES
// -----------------------------------------------------
function updateSynapseVesicles() {

  if (synapseVesicles.length < 10) {
    spawnSynapseEmptyVesicle();
  }

  for (let v of synapseVesicles) {

    // ---------------------------------
    // EMPTY → PRIMING (SINGLE LOCK)
    // ---------------------------------
    if (
      v.state === SYNAPSE_VESICLE_STATES.EMPTY &&
      !synapseLoaderActive &&
      v.x < SYNAPSE_CLUSTER_X + 8
    ) {
      v.state = SYNAPSE_VESICLE_STATES.PRIMING;
      v.timer = 0;
      synapseLoaderActive = true;
      spawnPrimingParticles(v);
    }

    // ---------------------------------
    // PRIMING
    // ---------------------------------
    if (v.state === SYNAPSE_VESICLE_STATES.PRIMING) {
      v.timer++;
      if (v.timer > 40) {
        v.state = SYNAPSE_VESICLE_STATES.LOADING;
        v.fillLevel = 0;
      }
    }

    // ---------------------------------
    // LOADING
    // ---------------------------------
    if (v.state === SYNAPSE_VESICLE_STATES.LOADING) {
      v.fillLevel += 0.025;
      if (v.fillLevel >= 1) {
        v.fillLevel = 1;
        v.state = SYNAPSE_VESICLE_STATES.LOADED;
        synapseLoaderActive = false;
      }
    }

    // ---------------------------------
    // LOADED (STABLE CLUSTER — FIXED)
    // ---------------------------------
    if (v.state === SYNAPSE_VESICLE_STATES.LOADED) {

      // Local jitter
      v.x += sin(frameCount * 0.02 + v.y) * 0.15;
      v.y += cos(frameCount * 0.02 + v.x) * 0.15;

      // Restoring forces (CRITICAL)
      v.x += (SYNAPSE_CLUSTER_X - v.x) * 0.02;
      v.y += (SYNAPSE_CLUSTER_Y - v.y) * 0.02;
    }

    // ---------------------------------
    // SNARED → FUSED
    // ---------------------------------
    if (v.state === SYNAPSE_VESICLE_STATES.SNARED) {
      v.x -= 1.6;
      if (v.x <= SYNAPSE_MEMBRANE_X + 2) {
        v.state = SYNAPSE_VESICLE_STATES.FUSED;
        v.timer = 0;
      }
    }

    // ---------------------------------
    // FUSED → RECYCLING
    // ---------------------------------
    if (v.state === SYNAPSE_VESICLE_STATES.FUSED) {
      v.timer++;
      if (v.timer > 18) {
        v.state = SYNAPSE_VESICLE_STATES.RECYCLING;
        v.fillLevel = 0;
      }
    }

    // ---------------------------------
    // RECYCLING
    // ---------------------------------
    if (v.state === SYNAPSE_VESICLE_STATES.RECYCLING) {
      v.x += 2.0;
      if (v.x >= SYNAPSE_CLUSTER_X) {
        v.state = SYNAPSE_VESICLE_STATES.EMPTY;
      }
    }
  }

  applyVesicleSeparation();
  updatePrimingParticles();
}

// -----------------------------------------------------
// SOFT NO-OVERLAP
// -----------------------------------------------------
function applyVesicleSeparation() {
  for (let i = 0; i < synapseVesicles.length; i++) {
    for (let j = i + 1; j < synapseVesicles.length; j++) {

      const a = synapseVesicles[i];
      const b = synapseVesicles[j];
      const dx = a.x - b.x;
      const dy = a.y - b.y;
      const d  = sqrt(dx * dx + dy * dy);
      const minD = SYNAPSE_VESICLE_RADIUS * 2.2;

      if (d > 0 && d < minD) {
        const push = (minD - d) * 0.05;
        a.x += (dx / d) * push;
        a.y += (dy / d) * push;
        b.x -= (dx / d) * push;
        b.y -= (dy / d) * push;
      }
    }
  }
}

// -----------------------------------------------------
// UPDATE ATP / H+
// -----------------------------------------------------
function updatePrimingParticles() {

  for (let i = synapseH.length - 1; i >= 0; i--) {
    const h = synapseH[i];
    h.x += h.vx;
    if (dist(h.x, h.y, h.target.x, h.target.y) < 6) {
      synapseH.splice(i, 1);
    }
  }

  for (let i = synapseATP.length - 1; i >= 0; i--) {
    const a = synapseATP[i];
    a.x += a.vx;
    a.life--;

    if (!a.bounced) {
      for (let v of synapseVesicles) {
        if (dist(a.x, a.y, v.x, v.y) < 10) {
          a.vx *= -0.35;
          a.bounced = true;
        }
      }
    }

    if (a.life <= 0) {
      synapseATP.splice(i, 1);
    }
  }
}

// -----------------------------------------------------
// AP TRIGGER
// -----------------------------------------------------
function triggerSynapseVesicleRelease() {
  for (let v of synapseVesicles) {
    if (v.state === SYNAPSE_VESICLE_STATES.LOADED) {
      v.state = SYNAPSE_VESICLE_STATES.SNARED;
    }
  }
}

// -----------------------------------------------------
// DRAW
// -----------------------------------------------------
function drawSynapseVesicles() {
  push();
  strokeWeight(SYNAPSE_VESICLE_STROKE);

  for (let v of synapseVesicles) {
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
      ellipse(v.x, v.y, SYNAPSE_VESICLE_RADIUS * 2 * v.fillLevel);
    }
  }

  noStroke();
  fill(255, 80, 80);
  for (let h of synapseH) circle(h.x, h.y, 5);

  fill(120, 200, 255);
  textSize(10);
  for (let a of synapseATP) {
    text(a.bounced ? "ADP + Pi" : "ATP", a.x, a.y);
  }

  pop();
}
