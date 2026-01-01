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
var SYNAPSE_MEMBRANE_X = 0;

// Back (cytosolic) loading region
var SYNAPSE_BACK_X      = 160;
var SYNAPSE_BACK_RADIUS = 90;
var SYNAPSE_BACK_Y      = 0;

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
function vesicleBorderColor() {
  return color(245, 225, 140);
}

function vesicleFillColor() {
  return color(245, 225, 140, 35);
}

function ntColor() {
  return color(185, 120, 255, 210);
}

// -----------------------------------------------------
// SPAWN EMPTY VESICLE (BACK CLUSTER)
// -----------------------------------------------------
function spawnSynapseEmptyVesicle() {
  var a = random(TWO_PI);
  var r = random(30, SYNAPSE_BACK_RADIUS);

  synapseVesicles.push({
    x: SYNAPSE_BACK_X + cos(a) * r,
    y: SYNAPSE_BACK_Y + sin(a) * r,
    state: SYNAPSE_VESICLE_STATES.EMPTY,
    timer: 0,
    nts: []
  });
}

// -----------------------------------------------------
// SPAWN ATP + H+ (OMNIDIRECTIONAL APPROACH)
// -----------------------------------------------------
function spawnPrimingParticles(v) {

  // Random approach angle
  var a = random(TWO_PI);
  var d = 26;

  // H+
  synapseH.push({
    x: v.x + cos(a) * d,
    y: v.y + sin(a) * d,
    vx: -cos(a) * 0.6,
    vy: -sin(a) * 0.6,
    target: v,
    life: 40   // ⏱️ minimum lifetime before uptake
  });

  // ATP (different angle)
  var a2 = a + random(PI / 3, PI / 1.5);

  synapseATP.push({
    x: v.x + cos(a2) * (d + 6),
    y: v.y + sin(a2) * (d + 6),
    vx: -cos(a2) * 0.4,
    vy: -sin(a2) * 0.4,
    state: "ATP",
    alpha: 255,
    life: 90
  });
}

// -----------------------------------------------------
// UPDATE VESICLES
// -----------------------------------------------------
function updateSynapseVesicles() {

  while (synapseVesicles.length < 10) {
    spawnSynapseEmptyVesicle();
  }

  // One-at-a-time loader (round robin)
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

    // LOADING — NT accumulation
    if (v.state === SYNAPSE_VESICLE_STATES.LOADING) {
      if (v.nts.length < 14 && frameCount % 7 === 0) {
        v.nts.push({
          x: random(-4, 4),
          y: random(-4, 4),
          vx: random(-0.35, 0.35),
          vy: random(-0.35, 0.35)
        });
      }

      if (v.nts.length >= 14) {
        v.state = SYNAPSE_VESICLE_STATES.LOADED;
        synapseLoaderActive = false;
      }
    }

    // LOADED — STAY WHERE IT LOADED
    // (no recentering, no drift)

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

    // RECYCLING → BACK
    if (v.state === SYNAPSE_VESICLE_STATES.RECYCLING) {
      v.x += 1.8;
      if (v.x >= SYNAPSE_BACK_X) {
        v.state = SYNAPSE_VESICLE_STATES.EMPTY;
      }
    }

    // NT particle motion
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

  applyVesicleSeparation();
  updatePrimingParticles();
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
      const d  = sqrt(dx*dx + dy*dy);
      const minD = SYNAPSE_VESICLE_RADIUS * 2.6;

      if (d > 0 && d < minD) {
        const push = (minD - d) * 0.08;
        a.x += (dx/d) * push;
        a.y += (dy/d) * push;
        b.x -= (dx/d) * push;
        b.y -= (dy/d) * push;
      }
    }
  }
}

// -----------------------------------------------------
// UPDATE ATP / H+
// -----------------------------------------------------
function updatePrimingParticles() {

  // H+ → disappear ONLY after lifetime AND collision
  for (let i = synapseH.length - 1; i >= 0; i--) {
    const h = synapseH[i];
    h.x += h.vx;
    h.y += h.vy;
    h.life--;

    if (
      h.life <= 0 &&
      dist(h.x, h.y, h.target.x, h.target.y) < SYNAPSE_VESICLE_RADIUS
    ) {
      synapseH.splice(i, 1);
    }
  }

  // ATP → ADP + Pi → slow fade
  for (let i = synapseATP.length - 1; i >= 0; i--) {
    const a = synapseATP[i];
    a.x += a.vx;
    a.y += a.vy;

    if (a.state === "ATP") {
      for (let v of synapseVesicles) {
        if (dist(a.x, a.y, v.x, v.y) < SYNAPSE_VESICLE_RADIUS) {
          a.state = "ADP";
          a.vx *= -0.3;
          a.vy *= -0.3;
        }
      }
    } else {
      a.alpha -= 4;
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

    stroke(vesicleBorderColor());
    fill(vesicleFillColor());
    ellipse(v.x, v.y, SYNAPSE_VESICLE_RADIUS * 2);

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
