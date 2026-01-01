console.log("🫧 synapse/vesicleLoading loaded");

// =====================================================
// SYNAPTIC VESICLE LOADING SYSTEM
// (PRESYNAPTIC LOCAL SPACE, GEOMETRY SAFE)
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

// Capsule center of presynaptic terminal
var TERMINAL_CENTER_X = BAR_THICK / 2;
var TERMINAL_CENTER_Y = 0;
var TERMINAL_RADIUS   = BAR_HALF - 12;

// Back-loading region (still inside capsule)
var BACK_OFFSET_X = 60;

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

// -----------------------------------------------------
// STATES
// -----------------------------------------------------
var VESICLE_STATE = {
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
function vesicleBorder() {
  return color(245, 225, 140);
}

function vesicleFill() {
  return color(245, 225, 140, 35);
}

function ntColor() {
  return color(185, 120, 255, 210);
}

// -----------------------------------------------------
// SPAWN EMPTY VESICLE (INSIDE CAPSULE)
// -----------------------------------------------------
function spawnSynapseEmptyVesicle() {

  let a = random(TWO_PI);
  let r = random(20, TERMINAL_RADIUS - 20);

  let x = TERMINAL_CENTER_X + BACK_OFFSET_X + cos(a) * r;
  let y = TERMINAL_CENTER_Y + sin(a) * r;

  synapseVesicles.push({
    x,
    y,
    state: VESICLE_STATE.EMPTY,
    timer: 0,
    nts: []
  });
}

// -----------------------------------------------------
// SPAWN ATP + H+ (OMNIDIRECTIONAL)
// -----------------------------------------------------
function spawnPrimingParticles(v) {

  let a = random(TWO_PI);
  let d = 26;

  synapseH.push({
    x: v.x + cos(a) * d,
    y: v.y + sin(a) * d,
    vx: -cos(a) * 0.6,
    vy: -sin(a) * 0.6,
    target: v,
    life: 40
  });

  let a2 = a + random(PI / 4, PI / 1.2);

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
// GEOMETRY CONSTRAINT — CAPSULE INTERIOR
// -----------------------------------------------------
function constrainToTerminal(v) {

  let dx = v.x - TERMINAL_CENTER_X;
  let dy = v.y - TERMINAL_CENTER_Y;
  let d  = sqrt(dx * dx + dy * dy);

  if (d > TERMINAL_RADIUS) {
    let scale = TERMINAL_RADIUS / d;
    v.x = TERMINAL_CENTER_X + dx * scale;
    v.y = TERMINAL_CENTER_Y + dy * scale;
  }
}

// -----------------------------------------------------
// UPDATE VESICLES
// -----------------------------------------------------
function updateSynapseVesicles() {

  while (synapseVesicles.length < 10) {
    spawnSynapseEmptyVesicle();
  }

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
      if (v.timer > 45) {
        v.state = VESICLE_STATE.LOADING;
        v.nts = [];
      }
    }

    if (v.state === VESICLE_STATE.LOADING) {
      if (v.nts.length < 14 && frameCount % 7 === 0) {
        v.nts.push({
          x: random(-4, 4),
          y: random(-4, 4),
          vx: random(-0.35, 0.35),
          vy: random(-0.35, 0.35)
        });
      }

      if (v.nts.length >= 14) {
        v.state = VESICLE_STATE.LOADED;
        loaderActive = false;
      }
    }

    if (v.state === VESICLE_STATE.SNARED) {
      v.x -= 1.4;
      if (v.x <= SYNAPSE_MEMBRANE_X + 2) {
        v.state = VESICLE_STATE.FUSED;
        v.timer = 0;
      }
    }

    if (v.state === VESICLE_STATE.FUSED) {
      v.timer++;
      if (v.timer > 18) {
        v.state = VESICLE_STATE.RECYCLING;
        v.nts = [];
      }
    }

    if (v.state === VESICLE_STATE.RECYCLING) {
      v.x += 1.8;
      if (v.x > TERMINAL_CENTER_X + BACK_OFFSET_X) {
        v.state = VESICLE_STATE.EMPTY;
      }
    }

    // NT particle motion
    for (let p of v.nts) {
      p.x += p.vx;
      p.y += p.vy;
      let d = sqrt(p.x*p.x + p.y*p.y);
      if (d > VESICLE_RADIUS - 2) {
        p.vx *= -1;
        p.vy *= -1;
      }
    }

    // 🔒 FINAL GUARANTEE
    constrainToTerminal(v);
  }

  updatePrimingParticles();
}

// -----------------------------------------------------
// UPDATE ATP / H+
// -----------------------------------------------------
function updatePrimingParticles() {

  for (let i = synapseH.length - 1; i >= 0; i--) {
    let h = synapseH[i];
    h.x += h.vx;
    h.y += h.vy;
    h.life--;

    if (
      h.life <= 0 &&
      dist(h.x, h.y, h.target.x, h.target.y) < VESICLE_RADIUS
    ) {
      synapseH.splice(i, 1);
    }
  }

  for (let i = synapseATP.length - 1; i >= 0; i--) {
    let a = synapseATP[i];
    a.x += a.vx;
    a.y += a.vy;

    if (a.state === "ATP") {
      for (let v of synapseVesicles) {
        if (dist(a.x, a.y, v.x, v.y) < VESICLE_RADIUS) {
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
    if (v.state === VESICLE_STATE.LOADED) {
      v.state = VESICLE_STATE.SNARED;
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

  fill(255, 90, 90);
  textSize(12);
  for (let h of synapseH) text("H⁺", h.x - 4, h.y + 4);

  textSize(10);
  for (let a of synapseATP) {
    fill(120, 200, 255, a.alpha);
    text(a.state === "ATP" ? "ATP" : "ADP + Pi", a.x, a.y);
  }

  pop();
}
