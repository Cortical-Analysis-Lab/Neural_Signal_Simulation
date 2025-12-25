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

// -----------------------------------------------------
// Global Toggles
// -----------------------------------------------------
window.myelinEnabled = false;

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
    camera.targetZoom = 1.2;
  }

  if (mode === "ion" || mode === "synapse") {
    camera.targetX = 0;
    camera.targetY = 0;
    camera.targetZoom = 2.5;
  }

  updateOverviewUI();
}

// =====================================================
// P5 SETUP
// =====================================================
let canvas;

function setup() {
  canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent(document.body);
  frameRate(60);

  // ---- Core geometry ----
  initSynapses();
  initAxonPath(neuron);
  initArtery();

  // Myelin nodes (geometry only)
  neuron.axon.myelinNodes = generateMyelinNodes(neuron.axon.path);

  // Dependent neurons
  initNeuron2();
  initNeuron3();
  initAstrocyte();

  setMode("overview");

  // Pause button
  const pauseBtn = document.getElementById("pauseBtn");
  if (pauseBtn) pauseBtn.onclick = togglePause;

  // Myelin toggle
  const myelinToggle = document.getElementById("myelinToggle");
  if (myelinToggle) {
    myelinToggle.checked = window.myelinEnabled;
    myelinToggle.addEventListener("change", () => {
      window.myelinEnabled = myelinToggle.checked;
      console.log("Myelin enabled:", window.myelinEnabled);
    });
  }

  updateOverviewUI();
}

// =====================================================
// MAIN LOOP
// =====================================================
function draw() {
  background(15, 17, 21);

  // =====================================================
  // UPDATE PHASE
  // =====================================================
  if (!state.paused) {
    state.time += state.dt;

    updateHemodynamics();
    updateBloodContents();
    updateSupplyWaves();
    updatePressureWaves();
  }

  // =====================================================
  // DRAW ARTERY (SCREEN SPACE)
  // =====================================================
  drawArtery();

  // =====================================================
  // CAMERA INTERPOLATION
  // =====================================================
  camera.x    += (camera.targetX    - camera.x)    * camera.lerpSpeed;
  camera.y    += (camera.targetY    - camera.y)    * camera.lerpSpeed;
  camera.zoom += (camera.targetZoom - camera.zoom) * camera.lerpSpeed;

  // =====================================================
  // WORLD SPACE (NEURONS)
  // =====================================================
  push();
  translate(width / 2, height / 2);
  scale(camera.zoom);
  translate(-camera.x, -camera.y);

  if (!state.paused) {
    updateSynapseHover();
    updateEPSPs();
    updateSoma();
    updateVoltageTrace();

    if (window.myelinEnabled) {
      updateMyelinAPs();
      updateTerminalDots();
    } else {
      updateAxonSpikes();
      updateTerminalDots();
    }

    updateVesicles();
    updateNeuron2EPSPs();
    updateSynapticCoupling();
  }

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
  const pauseBtn = document.getElementById("pauseBtn");
  if (pauseBtn) {
    pauseBtn.innerText = state.paused ? "Resume" : "Pause";
  }
}

// =====================================================
// PANEL TOGGLING (EDGE TABS)
// =====================================================
function togglePanel(id) {
  const panel = document.getElementById(id);
  if (!panel) return;

  panel.classList.toggle("open");
}

// =====================================================
// RESPONSIVE CANVAS
// =====================================================
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  initArtery();
}

// =====================================================
// OVERVIEW-ONLY UI VISIBILITY
// =====================================================
function updateOverviewUI() {
  const myelinUI = document.getElementById("myelinToggleContainer");
  if (!myelinUI) return;

  myelinUI.style.display =
    state.mode === "overview" ? "flex" : "none";
}
