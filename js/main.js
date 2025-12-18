console.log("✅ main.js loaded");

// =====================================================
// GLOBAL SIMULATION STATE
// =====================================================
const state = {
  time: 0,
  dt: 16.67,
  paused: false,
  mode: "overview" // overview | ion | synapse
};

// =====================================================
// CAMERA STATE (WORLD SPACE ONLY)
// =====================================================
const camera = {
  x: 0,
  y: 0,
  zoom: 1,

  targetX: 0,
  targetY: 0,
  targetZoom: 1,

  lerpSpeed: 0.08
};

// =====================================================
// MODE SWITCHING
// =====================================================
function setMode(mode) {
  state.mode = mode;

  if (mode === "overview") {
    camera.targetX = 0;
    camera.targetY = 0;
    camera.targetZoom = 1.2;   // zoomed out, centered neuron
  }

  if (mode === "ion" || mode === "synapse") {
    camera.targetX = 0;
    camera.targetY = 0;
    camera.targetZoom = 2.5;   // zoomed-in inspection
  }
}

// =====================================================
// P5 SETUP
// =====================================================
let canvas;

function setup() {
  canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent(document.body);
  frameRate(60);

  initSynapses();
  setMode("overview");

  document.getElementById("pauseBtn").onclick = togglePause;
}

// =====================================================
// MAIN LOOP
// =====================================================
function draw() {
  background(15, 17, 21);

  // Smooth camera interpolation
  camera.x    += (camera.targetX    - camera.x)    * camera.lerpSpeed;
  camera.y    += (camera.targetY    - camera.y)    * camera.lerpSpeed;
  camera.zoom += (camera.targetZoom - camera.zoom) * camera.lerpSpeed;

  if (!state.paused) {
    state.time += state.dt;
  }

  // =====================================================
  // APPLY CAMERA TRANSFORM (CENTERED WORLD)
  // =====================================================
  push();
  translate(width / 2, height / 2);
  scale(camera.zoom);
  translate(-camera.x, -camera.y);

  switch (state.mode) {
    case "overview":
      drawOverview(state);
      break;
    case "ion":
      drawIonView(state);
      break;
    case "synapse":
      drawSynapseView(state);
      break;
  }

  pop();

  // =====================================================
  // UI OVERLAY (SCREEN SPACE)
  // =====================================================
  drawTimeReadout();
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
