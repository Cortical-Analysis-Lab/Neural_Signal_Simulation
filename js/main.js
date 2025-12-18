console.log("✅ main.js loaded");

// =====================================================
// GLOBAL VIEW CONSTANTS
// =====================================================
window.OVERVIEW_SCALE = 1.5;
window.NEURON_Y_OFFSET = 60;

// Height reserved for bottom observation panel (px)
const OBS_PANEL_HEIGHT = 160;   // actual UI panel
const OBS_PANEL_BUFFER = 60;    // safety margin for dendrites + boutons


// =====================================================
// GLOBAL SIMULATION STATE (SINGLE SOURCE OF TRUTH)
// =====================================================
const state = {
  time: 0,          // ms
  dt: 16.67,        // ms (60 FPS)
  paused: false,
  mode: "overview" // overview | ion | synapse
};


// =====================================================
// CAMERA STATE
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
    camera.targetZoom = 1;
  }

  if (mode === "ion") {
    camera.targetX = 0;
    camera.targetY = 0;
    camera.targetZoom = 2.5;
  }

  if (mode === "synapse") {
    camera.targetX = 0;
    camera.targetY = 0;
    camera.targetZoom = 2.5;
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

  document.getElementById("pauseBtn").onclick = togglePause;
}


// =====================================================
// MAIN LOOP
// =====================================================
function draw() {
  background(15, 17, 21);

  // Smooth camera interpolation
  camera.x += (camera.targetX - camera.x) * camera.lerpSpeed;
  camera.y += (camera.targetY - camera.y) * camera.lerpSpeed;
  camera.zoom += (camera.targetZoom - camera.zoom) * camera.lerpSpeed;

  if (!state.paused) {
    state.time += state.dt;
  }

  // =====================================================
  // APPLY CAMERA TRANSFORM
  // Shift UP to avoid bottom observation panel
  // =====================================================
  push();

  translate(
  width / 2,
  height / 2 - (OBS_PANEL_HEIGHT / 2 + OBS_PANEL_BUFFER)
  );

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
  // UI (NOT affected by camera)
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
