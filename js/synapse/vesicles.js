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
// CONTROL (ROUND-ROBIN LOADER)
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
function synapseColorEmpty()  { return color(210, 220, 235); }
function synapseColorLoaded() { return color(180, 120, 255); }
function synapseColorBorder() { return color(40); }

// -----------------------------------------------------
// SPAWN EMPTY VESICLE (FIXED COUNT = 10)
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
    x: v.x - 20,
    y: v.y,
    vx: 0.9,
    target: v
  });

  synapseATP.push({
    x: v.x - 28,
    y: v.y,
    vx: 0.6,
    state: "ATP",
    alpha: 255,
    life: 40
  });
}

// -----------------------------------------------------
// UPDATE VESICLES
// -----------------------------------------------------
function updateSynapseVesicles() {

  // Maintain EXACTLY 10 vesicles
  while (synapseVesicles.length < 10) {
    spawnSynapseEmptyVesicle();
  }

  // -------------------------------------------------
  // ROUND-ROBIN PRIMING SELECTION
  // -------------------------------------------------
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

    // -------------------------
    // PRIMING
    // -------------------------
    if (v.state === SYNAPSE_VESICLE_STATES.PRIMING) {
      v.timer++;
      if (v.timer > 45) {
        v.state = SYNAPSE_VESICLE_STATES.LOADING;
        v.fillLevel = 0;
      }
    }

    // -------------------------
    // LOADING (ONE AT A TIME)
    // -------------------------
    if (v.state === SYNAPSE_VESICLE_STATES.LOADING) {
      v.fillLevel += 0.02;
      if (v.fillLevel >= 1) {
        v.fillLevel = 1;
        v.state = SYNAPSE_VESICLE_STATES.LOADED;
        synapseLoaderActive = false;
      }
    }

    // -------------------------
    // LOADED (STABLE CLUSTER)
    // -------------------------
    if (v.state === SYNAPSE_VESICLE_STATES.LOADED) {
      v.x += sin(frameCount * 0.02 + v.y) * 0.12;
      v.y += cos(frameCount * 0.02 + v.x) * 0.12;

      // gentle restoring force
      v.x += (SYNAPSE_CLUSTER_X - v.x) * 0.02;
      v.y += (SYNAPSE_CLUSTER_Y - v.y) * 0.02;
    }

    // -------------------------
    // SNARED → FUSED
    // -------------------------
    if (v.state === SYNAPSE_VESICLE_STATES.SNARED) {
      v.x -= 1.4;
      if (v.x <= SYNAPSE_MEMBRANE_X + 2) {
        v.state = SYNAPSE_VESICLE_STATES.FUSED;
        v.timer = 0;
      }
    }

    // -------------------------
    // FUSED → RECYCLING
    // -------------------------
    if (v.state === SYNAPSE_VESICLE_STATES.FUSED) {
      v.timer++;
      if (v.timer > 18) {
        v.state = SYNAPSE_VESICLE_STATES.RECYCLING;
        v.fillLevel = 0;
      }
    }

    // -------------------------
    // RECYCLING
    // -------------------------
    if (v.state === SYNAPSE_VESICLE_STATES.RECYCLING) {
      v.x += 1.8;
      if (v.x >= SYNAPSE_CLUSTER_X) {
        v.state = SYNAPSE_VESICLE_STATES.EMPTY;
      }
    }
  }

  applyVesicleSeparation();
  updatePrimingParticles();
}

// -----------------------------------------------------
// ATP / H+ UPDATES (SLOW + FADE)
// -----------------------------------------------------
function updatePrimingParticles() {

  // H+ enters vesicle
  for (let i = synapseH.length - 1; i >= 0; i--) {
    const h = synapseH[i];
    h.x += h.vx;
    if (dist(h.x, h.y, h.target.x, h.target.y) < 6) {
      synapseH.splice(i, 1);
    }
  }

  // ATP → ADP + Pi (SLOW + FADE)
  for (let i = synapseATP.length - 1; i >= 0; i--) {
    const a = synapseATP[i];

    if (a.state === "ATP") {
      a.x += a.vx;

      for (let v of synapseVesicles) {
        if (dist(a.x, a.y, v.x, v.y) < 10) {
          a.state = "ADP";
          a.vx = -0.15;   // very small recoil
        }
      }
    } else {
      a.alpha -= 12;
    }

    a.life--;
    if (a.life <= 0 || a.alpha <= 0) {
      synapseATP.splice(i, 1);
    }
  }
}

// -----------------------------------------------------
// NO-OVERLAP
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
        const push = (minD - d) * 0.04;
        a.x += (dx / d) * push;
        a.y += (dy / d) * push;
        b.x -= (dx / d) * push;
        b.y -= (dy / d) * push;
      }
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

  // H+
  fill(255, 80, 80);
  textSize(12);
  for (let h of synapseH) {
    text("H⁺", h.x - 4, h.y + 4);
  }

  // ATP / ADP + Pi (FADE)
  textSize(10);
  for (let a of synapseATP) {
    fill(120, 200, 255, a.alpha);
    text(a.state === "ATP" ? "ATP" : "ADP + Pi", a.x, a.y);
  }

  pop();
}
