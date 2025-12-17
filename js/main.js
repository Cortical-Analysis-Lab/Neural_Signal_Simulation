// =====================================================
// GLOBAL SIMULATION STATE (SINGLE SOURCE OF TRUTH)
// =====================================================
const state = {
  time: 0,          // ms
  dt: 16.67,        // ms (60 FPS)
  paused: false,
  mode: "overview" // overview | ionZoom | synapseZoom
};
function setMode(mode) {
  state.mode = mode;
}
// =====================================================
// P5 SETUP
// =====================================================
function setup() {
  const canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent(document.body);
  frameRate(60);

  document.getElementById("pauseBtn").onclick = togglePause;
}

// =====================================================
// MAIN LOOP
// =====================================================
function draw() {
  background(15, 17, 21);

  if (!state.paused) {
    state.time += state.dt;
  }

  switch (state.mode) {
  case "overview":
    drawOverviewView(state);
    break;
  case "ion":
    drawIonView(state);
    break;
  case "synapse":
    drawSynapseView(state);
    break;
};
  drawTimeReadout();
}

// =====================================================
// BASELINE VISUAL (TEMPORARY)
// =====================================================
function drawBaseline() {
  push();
  stroke(80);
  noFill();
  ellipse(width / 2, height / 2, 200, 200);
  pop();
}

// =====================================================
// UI HELPERS
// =====================================================
function drawTimeReadout() {
  push();
  fill(220);
  noStroke();
  textSize(14);
  textAlign(RIGHT, TOP);
  text(`t = ${state.time.toFixed(0)} ms`, width - 20, 20);
  pop();
}

function togglePause() {
  state.paused = !state.paused;
  document.getElementById("pauseBtn").innerText =
    state.paused ? "Resume" : "Pause";
}

// =====================================================
// RESPONSIVE CANVAS
// =====================================================
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
