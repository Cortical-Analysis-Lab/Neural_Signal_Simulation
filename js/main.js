console.log("✅ main.js loaded");

// =====================================================
// GLOBAL VIEW CONSTANTS
// =====================================================
window.OVERVIEW_SCALE = 1.2;

// =====================================================
// OVERVIEW CAMERA OFFSETS (FINE FRAMING)
// =====================================================
const OVERVIEW_CENTER_X = -70;  // move neuron left
const OVERVIEW_CENTER_Y = 60;   // move neuron down


// =====================================================
// UI LAYOUT CONSTANTS (SAFE DRAW AREA)
// =====================================================
const LEFT_PANEL_WIDTH = 340;
const BOTTOM_PANEL_HEIGHT = 180;
const SAFE_MARGIN = 50; // generous buffer for dendrites & controls

// =====================================================
// GLOBAL SIMULATION STATE
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
    camera.targetX = OVERVIEW_CENTER_X;
    camera.targetY = OVERVIEW_CENTER_Y;
    camera.targetZoom = 0.9;
  }

  if (mode === "ion" || mode === "synapse") {
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
  recenterNeuronGeometry();   // ✅ THIS LINE

  setMode("overview");

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
  // SAFE DRAW AREA CALCULATION
  // =====================================================
  const safeWidth =
    width - LEFT_PANEL_WIDTH - SAFE_MARGIN * 2;

  const safeHeight =
    height - BOTTOM_PANEL_HEIGHT - SAFE_MARGIN * 2;

  const centerX =
    LEFT_PANEL_WIDTH + SAFE_MARGIN + safeWidth / 2;

  const centerY =
    SAFE_MARGIN + safeHeight / 2;

  // =====================================================
  // APPLY CAMERA + SAFE AREA TRANSFORM
  // =====================================================
  push();
  translate(centerX, centerY);
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
