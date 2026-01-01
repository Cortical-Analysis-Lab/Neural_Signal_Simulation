console.log("🫧 synapse/vesicleLoading loaded");

// =====================================================
// SYNAPTIC VESICLE LOADING SYSTEM
// (PRESYNAPTIC LOCAL SPACE — GEOMETRY SAFE)
// =====================================================

// -----------------------------------------------------
// STORAGE
// -----------------------------------------------------
window.synapseVesicles = window.synapseVesicles || [];
var synapseVesicles = window.synapseVesicles;

var synapseH   = [];
var synapseATP = [];

// -----------------------------------------------------
// GEOMETRY — MATCH neuronShape.js
// -----------------------------------------------------
var SYNAPSE_MEMBRANE_X = 0;

// From neuronShape.js
var BAR_THICK = 340;
var BAR_HALF  = 140;

// Capsule center
var TERMINAL_CENTER_X = BAR_THICK / 2;
var TERMINAL_CENTER_Y = 0;
var TERMINAL_RADIUS   = BAR_HALF - 10;

// Back-loading region (deep cytosol)
var BACK_OFFSET_X = 70;

// -----------------------------------------------------
// VISUALS
// -----------------------------------------------------
var VESICLE_RADIUS = 10;
var VESICLE_STROKE = 4;

// -----------------------------------------------------
// CONTROL
// -----------------------------------------------------
var loaderActive = false;
var loaderIndex  = 0;
var MAX_VESICLES = 10;

// -----------------------------------------------------
// STATES
// -----------------------------------------------------
var VESICLE_STATE = {
  EMPTY:   "empty",
  PRIMING:"priming",
  LOADING:"loading",
  LOADED: "loaded"
};

// -----------------------------------------------------
// COLORS
// -----------------------------------------------------
function vesicleBorder() { return color(245, 225, 140); }
function vesicleFill()   { return color(245, 225, 140, 35); }
function ntColor()       { return color(185, 120, 255, 210); }

// -----------------------------------------------------
// GEOMETRY CONSTRAINT (HARD)
// -----------------------------------------------------
function constrainToTerminal(v) {
  let dx = v.x - TERMINAL_CENTER_X;
  let dy = v.y - TERMINAL_CENTER_Y;
  let d  = sqrt(dx*dx + dy*dy);

  if (d > TERMINAL_RADIUS - VESICLE_RADIUS) {
    let s = (TERMINAL_RADIUS - VESICLE_RADIUS) / d;
    v.x = TERMINAL_CENTER_X + dx * s;
    v.y = TERMINAL_CENTER_Y + dy * s;
  }
}

// -----------------------------------------------------
// SPAWN EMPTY VESICLE (BACK ONLY)
// -----------------------------------------------------
function spawnSynapseEmptyVesicle() {

  let a = random(TWO_PI);
  let r = random(20, TERMINAL_RADIUS - 20);

  let x = TERMINAL_CENTER_X + BACK_OFFSET_X + cos(a) * r * 0.6;
  let y = TERMINAL_CENTER_Y + sin(a) * r * 0.6;

  synapseVesicles.push({
    x,
    y,
    state: VESICLE_STATE.EMPTY,
    timer: 0,
    nts: []
  });
}

// -----------------------------------------------------
// SPAWN ATP + H+ (RANDOM APPROACH)
// -----------------------------------------------------
function spawnPrimingParticles(v) {

  let a = random(TWO_PI);
  let d = 32;

  // H+ → enters vesicle
  synapseH.push({
    x: v.x + cos(a) * d,
    y: v.y + sin(a) * d,
    vx: -cos(a) * 0.5,
    vy: -sin(a) * 0.5,
    target: v,
    life: 55
  });

  // ATP → bounce → ADP + Pi
  let a2 = a + random(PI/3, PI/1.2);
  synapseATP.push({
    x: v.x + cos(a2) * (d + 6),
    y: v.y + sin(a2) * (d + 6),
    vx: -cos(a2) * 0.35,
    vy: -sin(a2) * 0.35,
    state: "ATP",
    alpha: 255,
    life: 110
  });
}

// -----------------------------------------------------
// UPDATE VESICLES (LOADING ONLY)
// -----------------------------------------------------
function updateSynapseVesicles() {

  while (synapseVesicles.length < MAX_VESICLES) {
    spawnSynapseEmptyVesicle();
  }

  // SINGLE loader lock
  if (!loaderActive) {
    let v = synapseVesicles[loaderIndex % synapseVesicles.length];
    if (v.state === VESICLE_STATE.EMPTY) {
      v.state = VESICLE_STATE.PRIMING;
      v.timer = 0;
      loaderActive = true;
      spawnPrimingParticles(v);
    }
    loaderIndex++;
  }

  for (let v of synapseVesicles) {

    if (v.state === VESICLE_STATE.PRIMING) {
      v.timer++;
      if (v.timer > 50) {
        v.state = VESICLE_STATE.LOADING;
        v.nts = [];
      }
    }

    if (v.state === VESICLE_STATE.LOADING) {

      if (v.nts.length < 14 && frameCount % 6 === 0) {
        v.nts.push({
          x: random(-4, 4),
          y: random(-4, 4),
          vx: random(-0.3, 0.3),
          vy: random(-0.3, 0.3)
        });
      }

      if (v.nts.length >= 14) {
        v.state = VESICLE_STATE.LOADED;
        loaderActive = false;
      }
    }

    // Neurotransmitter motion (internal)
    for (let p of v.nts) {
      p.x += p.vx;
      p.y += p.vy;
      let d = sqrt(p.x*p.x + p.y*p.y);
      if (d > VESICLE_RADIUS - 3) {
        p.vx *= -1;
        p.vy *= -1;
      }
    }

    constrainToTerminal(v);
  }

  updatePrimingParticles();
}

// -----------------------------------------------------
// UPDATE ATP / H+
// -----------------------------------------------------
function updatePrimingParticles() {

  // H+
  for (let i = synapseH.length - 1; i >= 0; i--) {
    let h = synapseH[i];
    h.x += h.vx;
    h.y += h.vy;
    h.life--;

    if (
      dist(h.x, h.y, h.target.x, h.target.y) < VESICLE_RADIUS &&
      h.life < 25
    ) {
      synapseH.splice(i, 1);
    }
  }

  // ATP → ADP + Pi
  for (let i = synapseATP.length - 1; i >= 0; i--) {
    let a = synapseATP[i];
    a.x += a.vx;
    a.y += a.vy;

    if (a.state === "ATP") {
      for (let v of synapseVesicles) {
        if (dist(a.x, a.y, v.x, v.y) < VESICLE_RADIUS) {
          a.state = "ADP";
          a.vx *= -0.25;
          a.vy *= -0.25;
        }
      }
    } else {
      a.alpha -= 2;
    }

    a.life--;
    if (a.life <= 0 || a.alpha <= 0) {
      synapseATP.splice(i, 1);
    }
  }
}

// -----------------------------------------------------
// DRAW
// -----------------------------------------------------
function drawSynapseVesicles() {
  push();
  strokeWeight(VESICLE_STROKE);

  for (let v of synapseVesicles) {
    stroke(vesicleBorder());
    fill(vesicleFill());
    ellipse(v.x, v.y, VESICLE_RADIUS * 2);

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
