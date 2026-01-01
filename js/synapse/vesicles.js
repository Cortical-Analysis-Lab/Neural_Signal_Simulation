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
var SYNAPSE_CLUSTER_Y      = 0;
var SYNAPSE_CLUSTER_RADIUS = 95;   // ⬅ increased spacing

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
// COLORS (MATCH NEURON)
// -----------------------------------------------------
function vesicleBorderColor() {
  return color(245, 225, 140); // same yellow as neuron outline
}

function vesicleFillColor() {
  return color(245, 225, 140, 35); // translucent neuron cytosol
}

function ntColor() {
  return color(185, 120, 255, 210);
}

// -----------------------------------------------------
// SPAWN EMPTY VESICLE (SPREAD CLUSTER)
// -----------------------------------------------------
function spawnSynapseEmptyVesicle() {
  var a = random(TWO_PI);
  var r = random(40, SYNAPSE_CLUSTER_RADIUS); // avoid center pileup

  synapseVesicles.push({
    x: SYNAPSE_CLUSTER_X + cos(a) * r,
    y: SYNAPSE_CLUSTER_Y + sin(a) * r,
    state: SYNAPSE_VESICLE_STATES.EMPTY,
    timer: 0,
    nts: []
  });
}

// -----------------------------------------------------
// SPAWN ATP + H+
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
    life: 80
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

    // LOADING — gradual NT accumulation
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

    // LOADED — confined, centered
    if (v.state === SYNAPSE_VESICLE_STATES.LOADED) {
      v.x += (SYNAPSE_CLUSTER_X - v.x) * 0.025;
      v.y += (SYNAPSE_CLUSTER_Y - v.y) * 0.025;
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
// STRONGER NO-OVERLAP + RADIAL SPREAD
// -----------------------------------------------------
function applyVesicleSeparation() {

  // Pairwise repulsion
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

  // Radial restoring force (prevents pile-up)
  for (let v of synapseVesicles) {
    const dx = v.x - SYNAPSE_CLUSTER_X;
    const dy = v.y - SYNAPSE_CLUSTER_Y;
    const d  = sqrt(dx*dx + dy*dy) || 1;

    const targetR = SYNAPSE_CLUSTER_RADIUS * 0.6;
    v.x += (dx/d) * (targetR - d) * 0.01;
    v.y += (dy/d) * (targetR - d) * 0.01;
  }
}

// -----------------------------------------------------
// UPDATE ATP / H+
// -----------------------------------------------------
function updatePrimingParticles() {

  // H+
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

    // Vesicle shell + cytosol
    stroke(vesicleBorderColor());
    fill(vesicleFillColor());
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
