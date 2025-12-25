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
window.myelinEnabled  = false;
window.loggingEnabled = false;

// -----------------------------------------------------
// SAFE LOGGING WRAPPER
// -----------------------------------------------------
function safeLog(type, message = null, target = null) {
  if (typeof logEvent === "function") {
    logEvent(type, message, target);
  }
}

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
// SYNAPSE FOCUS CONTEXT (PERSISTENT)
// =====================================================
window.synapseFocus = null;

// =====================================================
// SET SYNAPSE FOCUS FROM WORLD COORDS
// =====================================================
function setSynapseFocusFromWorld(x, y) {

  window.synapseFocus = {
    x,
    y,
    releaseProb: 0.9,
    diffusionDelay: 10
  };

  console.log(
    `📍 Synapse focus set (world coords): x=${x.toFixed(2)}, y=${y.toFixed(2)}`
  );
}

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

  else if (mode === "synapse") {

    if (window.synapseFocus) {
      camera.targetX = window.synapseFocus.x;
      camera.targetY = window.synapseFocus.y;
      camera.targetZoom = 5.0;
    } else {
      console.warn("⚠️ No synapse selected. Click one in Overview first.");
      camera.targetZoom = 4.0;
    }
  }

  else {
    camera.targetZoom = 2.5;
  }

  updateOverviewUI();

  if (typeof updateUIPanelContent === "function") {
    updateUIPanelContent(mode);
  }

  safeLog("system", `Switched to ${mode} view`);
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

  neuron.axon.myelinNodes = generateMyelinNodes(neuron.axon.path);

  initNeuron2();
  initNeuron3();
  initAstrocyte();

  setMode("overview");

  // ----------------------
  // Pause button
  // ----------------------
  const pauseBtn = document.getElementById("pauseBtn");
  if (pauseBtn) pauseBtn.onclick = togglePause;

  // ----------------------
  // Myelin toggle
  // ----------------------
  const myelinToggle = document.getElementById("myelinToggle");
  if (myelinToggle) {
    myelinToggle.checked = window.myelinEnabled;

    myelinToggle.addEventListener("change", () => {
      window.myelinEnabled = myelinToggle.checked;
      safeLog(
        "system",
        `Myelin ${window.myelinEnabled ? "enabled" : "disabled"}`
      );
    });
  }

  // ----------------------
  // Logging toggle
  // ----------------------
  const logToggle = document.getElementById("logToggle");
  if (logToggle) {
    logToggle.checked = false;

    logToggle.addEventListener("change", () => {
      window.loggingEnabled = logToggle.checked;
      if (typeof setEventLogOpen === "function") {
        setEventLogOpen(logToggle.checked);
      }
    });
  }

  updateOverviewUI();

  if (typeof updateUIPanelContent === "function") {
    updateUIPanelContent(state.mode);
  }
}

// =====================================================
// CLICK TO SELECT SYNAPSE (OVERVIEW ONLY)
// =====================================================
function mousePressed() {

  // Only allow selection in Overview
  if (state.mode !== "overview") return;

  // Convert screen → world coordinates
  const worldX =
    (mouseX - width / 2) / camera.zoom + camera.x;
  const worldY =
    (mouseY - height / 2) / camera.zoom + camera.y;

  setSynapseFocusFromWorld(worldX, worldY);
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
  // DRAW ARTERY (HIDE IN SYNAPSE VIEW)
  // =====================================================
  if (state.mode !== "synapse") {
    drawArtery();
  }

  // =====================================================
  // CAMERA INTERPOLATION
  // =====================================================
  camera.x    += (camera.targetX    - camera.x)    * camera.lerpSpeed;
  camera.y    += (camera.targetY    - camera.y)    * camera.lerpSpeed;
  camera.zoom += (camera.targetZoom - camera.zoom) * camera.lerpSpeed;

  // =====================================================
  // WORLD SPACE
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
    } else {
      updateAxonSpikes();
    }

    updateTerminalDots();
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

  // -----------------------------------------------------
  // Optional: show selected synapse marker in Overview
  // -----------------------------------------------------
  if (state.mode === "overview" && window.synapseFocus) {
    push();
    stroke(255, 200, 80);
    strokeWeight(2);
    noFill();
    ellipse(
      window.synapseFocus.x,
      window.synapseFocus.y,
      18,
      18
    );
    pop();
  }

  if (typeof drawHighlightOverlay === "function") {
    drawHighlightOverlay();
  }

  pop();

  // =====================================================
  // UI OVERLAY
  // =====================================================
  drawTimeReadout();

  if (typeof drawEventLog === "function") {
    drawEventLog();
  }
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

  safeLog(
    "system",
    state.paused ? "Simulation paused" : "Simulation resumed"
  );
}

// =====================================================
// PANEL TOGGLING
// =====================================================
function togglePanel(id) {
  const panel = document.getElementById(id);
  if (panel) panel.classList.toggle("open");
}

// =====================================================
// RESPONSIVE CANVAS
// =====================================================
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  initArtery();
}

// =====================================================
// MODE-DEPENDENT UI VISIBILITY
// =====================================================
function updateOverviewUI() {
  const myelinUI = document.getElementById("myelinToggleContainer");
  const logUI    = document.getElementById("logToggleContainer");

  const visible = state.mode === "overview";

  if (myelinUI) myelinUI.style.display = visible ? "flex" : "none";
  if (logUI)    logUI.style.display    = visible ? "flex" : "none";
}
