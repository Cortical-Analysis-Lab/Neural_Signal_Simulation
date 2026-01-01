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
var synapseLoaderIndex  = 0;

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
function synapseColorEmpty()  { return color(210, 220, 235, 160); }
function synapseColorBorder() { return color(40); }

// Neurotransmitter particles
function ntColor() { return color(185, 120, 255, 200); }

// -----------------------------------------------------
// SPAWN EMPTY VESICLE
// -----------------------------------------------------
function spawnSynapseEmptyVesicle() {
  var a = random(TWO_PI);
  var r = random(0, SYNAPSE_CLUSTER_RADIUS);

  synapseVesicles.push({
    x: SYNAPSE_CLUSTER_X + cos(a) * r,
    y: SYNAPSE_CLUSTER_Y + sin(a) * r,
    state: SYNAPSE_VESICLE_STATES.EMPTY,
    timer: 0,
    nts: [] // neurotransmitter particles
  });
}

// -----------------------------------------------------
// SPAWN ATP + H+ (OFFSET PATHS)
// -----------------------------------------------------
function spawnPrimingParticles(v) {

  // H+ (lower approach)
  synapseH.push({
    x: v.x - 22,
    y: v.y + 6,
    vx: 0.8,
    target: v
  });

  // ATP (upper approach)
  synapseATP.push({
    x: v.x - 30,
    y: v.y - 6,
    vx: 0.5,
    state: "ATP",
    alpha: 255,
    life: 70
  });
}

// -----------------------------------------------------
// UPDATE VESICLES
// -----------------------------------------------------
function updateSynapseVesicles() {

  while (synapseVesicles.length < 10) {
    spawnSynapseEmptyVesicle();
  }

  // Round-robin priming
  if (!synapseLoaderActive) {
    var v = synapseVesicles[synapseLoaderIndex % synapseVesicles.length];
    if (v.state === SYNAPSE_VESICLE_STATES.EMPTY) {
      v.state = SYNAPSE_VESICLE_STATES.PRIMING;
      v.timer = 0;
      synapseLoaderActive = true;
      spawnPrimingParticles(v);
    }
    synapseLoaderIndex++;
  }

  for (let v of synapseVesicles) {

    // PRIMING
    if (v.state === SYNAPSE_VESICLE_STATES.PRIMING) {
      v.timer++;
      if (v.timer > 45) {
        v.state = SYNAPSE_VESICLE_STATES.LOADING;
        v.nts = [];
      }
    }

    // LOADING — add particles gradually
    if (v.state === SYNAPSE_VESICLE_STATES.LOADING) {
      if (v.nts.length < 12 && frameCount % 8 === 0) {
        v.nts.push({
          x: random(-4, 4),
          y: random(-4, 4),
          vx: random(-0.4, 0.4),
          vy: random(-0.4, 0.4)
        });
      }

      if (v.nts.length >= 12) {
        v.state = SYNAPSE_VESICLE_STATES.LOADED;
        synapseLoaderActive = false;
      }
    }

    // LOADED — confined motion
    if (v.state === SYNAPSE_VESICLE_STATES.LOADED) {
      v.x += (SYNAPSE_CLUSTER_X - v.x) * 0.02;
      v.y += (SYNAPSE_CLUSTER_Y - v.y) * 0.02;
    }

    // SNARED → FUSED
    if (v.state === SYNAPSE_VESICLE_STATES.SNARED) {
      v.x -= 1.4;
      if (v.x <= SYNAPSE_MEMBRANE_X + 2) {
        v.state = SYNAPSE_VESICLE_STATES.FUSED;
        v.timer = 0;
      }
    }

    // FUSED → RECYCLING
    if (v.state === SYNAPSE_VESICLE_STATES.FUSED) {
      v.timer++;
      if (v.timer > 18) {
        v.state = SYNAPSE_VESICLE_STATES.RECYCLING;
        v.nts = [];
      }
    }

    // RECYCLING
    if (v.state === SYNAPSE_VESICLE_STATES.RECYCLING) {
      v.x += 1.8;
      if (v.x >= SYNAPSE_CLUSTER_X) {
        v.state = SYNAPSE_VESICLE_STATES.EMPTY;
      }
    }

    // Update neurotransmitter particles
    for (let p of v.nts) {
      p.x += p.vx;
      p.y += p.vy;

      const d = sqrt(p.x*p.x + p.y*p.y);
      if (d > SYNAPSE_VESICLE_RADIUS - 2) {
        p.vx *= -1;
        p.vy *= -1;
      }
    }
  }

  updatePrimingParticles();
}

// -----------------------------------------------------
// UPDATE ATP / H+
// -----------------------------------------------------
function updatePrimingParticles() {

  // H+ → disappears into vesicle
  for (let i = synapseH.length - 1; i >= 0; i--) {
    const h = synapseH[i];
    h.x += h.vx;
    if (dist(h.x, h.y, h.target.x, h.target.y) < 6) {
      synapseH.splice(i, 1);
    }
  }

  // ATP → ADP + Pi (slow fade)
  for (let i = synapseATP.length - 1; i >= 0; i--) {
    const a = synapseATP[i];
    a.x += a.vx;

    if (a.state === "ATP") {
      for (let v of synapseVesicles) {
        if (dist(a.x, a.y, v.x, v.y) < 10) {
          a.state = "ADP";
          a.vx = -0.12;
        }
      }
    } else {
      a.alpha -= 6; // slower fade
    }

    a.life--;
    if (a.life <= 0 || a.alpha <= 0) {
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

    // Vesicle membrane + cytosol
    stroke(synapseColorBorder());
    fill(synapseColorEmpty());
    ellipse(v.x, v.y, SYNAPSE_VESICLE_RADIUS * 2);

    // Neurotransmitter particles
    noStroke();
    fill(ntColor());
    for (let p of v.nts) {
      circle(v.x + p.x, v.y + p.y, 3);
    }
  }

  // H+
  fill(255, 90, 90);
  textSize(12);
  for (let h of synapseH) {
    text("H⁺", h.x - 4, h.y + 4);
  }

  // ATP / ADP + Pi
  textSize(10);
  for (let a of synapseATP) {
    fill(120, 200, 255, a.alpha);
    text(a.state === "ATP" ? "ATP" : "ADP + Pi", a.x, a.y);
  }

  pop();
}
