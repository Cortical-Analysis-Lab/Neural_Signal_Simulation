console.log("✅ main.js loaded");

// =====================================================
// OVERVIEW CAMERA OFFSETS (FINE FRAMING)
// =====================================================
const OVERVIEW_CENTER_X = -70;  // shift neuron left (away from UI)
const OVERVIEW_CENTER_Y = 40;   // slight downward bias

// =====================================================
// UI LAYOUT CONSTANTS (SAFE DRAW AREA)
// =====================================================
const LEFT_PANEL_WIDTH   = 340;
const BOTTOM_PANEL_HEIGHT = 180;
const SAFE_MARGIN        = 50;

// =====================================================
// GLOBAL SIMULATION STATE
// =====================================================
const state = {
  time: 0,
  dt: 16.67,
  paused: false,
  mode: "overview"
};

// =====================================================
// CAMERA STATE (ZOOM + FOCUS ONLY)
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
    camera.targetZoom = 0.9;   // zoomed out for context
  }

  if (mode === "ion" || mode === "synapse") {
    camera.targetX = 0;
    camera.targetY = 0;
    camera.targetZoom = 2.5;   // focused inspection
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
  // SAFE DRAW AREA (SCREEN SPACE)
  // =====================================================
  const safeWidth =
    width - LEFT_PANEL_WIDTH - SAFE_MARGIN * 2;

  const safeHeight =
    height - BOTTOM_PANEL_HEIGHT - SAFE_MARGIN * 2;

  const safeCenterX =
    LEFT_PANEL_WIDTH + SAFE_MARGIN + safeWidth / 2;

  const safeCenterY =
    SAFE_MARGIN + safeHeight / 2;

  // =====================================================
  // APPLY TRANSFORMS
  // =====================================================
  push();
  translate(safeCenterX, safeCenterY);
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
  // UI OVERLAY
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
