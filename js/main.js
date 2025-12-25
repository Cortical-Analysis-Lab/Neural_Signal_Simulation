console.log("✅ main.js loaded");

// =====================================================
// GLOBAL SIMULATION STATE
// =====================================================
const state = {
  time: 0,
  dt: 16.67,
  paused: false,
  mode: "overview",          // overview | ion | synapse
  transition: null           // null | "toSynapse" | "toOverview"
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

  startX: 0,
  startY: 0,
  startZoom: 1,

  targetX: 0,
  targetY: 0,
  targetZoom: 1,

  t: 0,                 // transition progress
  duration: 120         // frames
};

// =====================================================
// 🔒 LOCKED SYNAPSE FOCUS (BIOLOGICAL ANCHOR)
// =====================================================
window.synapseFocus = {
  x: 272.08,
  y: -0.42,
  releaseProb: 0.9,
  diffusionDelay: 10
};

// =====================================================
// EASING FUNCTION (SMOOTHSTEP)
// =====================================================
function easeInOut(t) {
  return t * t * (3 - 2 * t);
}

// =====================================================
// BEGIN CAMERA TRANSITION
// =====================================================
function beginTransition(targetMode) {

  camera.startX = camera.x;
  camera.startY = camera.y;
  camera.startZoom = camera.zoom;

  if (targetMode === "synapse") {
    camera.targetX = window.synapseFocus.x;
    camera.targetY = window.synapseFocus.y;
    camera.targetZoom = 5.0;
    state.transition = "toSynapse";
  }

  if (targetMode === "overview") {
    camera.targetX = 0;
    camera.targetY = 0;
    camera.targetZoom = 1.2;
    state.transition = "toOverview";
  }

  camera.t = 0;
  safeLog("system", `Transitioning to ${targetMode}…`);
}

// =====================================================
// MODE SWITCHING (ENTRY POINT)
// =====================================================
function setMode(mode) {

  if (mode === "synapse") {
    beginTransition("synapse");
    return;
  }

  if (mode === "overview") {
    beginTransition("overview");
    return;
  }

  // Ion view (no transition yet)
  state.mode = mode;
  camera.targetZoom = 2.5;

  updateOverviewUI();
  if (typeof updateUIPanelContent === "function") {
    updateUIPanelContent(mode);
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

  // ---- Core geometry ----
  initSynapses();
  initAxonPath(neuron);
  initArtery();

  neuron.axon.myelinNodes = generateMyelinNodes(neuron.axon.path);

  initNeuron2();
  initNeuron3();
  initAstrocyte();

  state.mode = "overview";

  // UI wiring preserved
  const pauseBtn = document.getElementById("pauseBtn");
  if (pauseBtn) pauseBtn.onclick = togglePause;

  const myelinToggle = document.getElementById("myelinToggle");
  if (myelinToggle) {
    myelinToggle.checked = window.myelinEnabled;
    myelinToggle.addEventListener("change", () => {
      window.myelinEnabled = myelinToggle.checked;
    });
  }

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
// MAIN LOOP
// =====================================================
function draw() {
  background(15, 17, 21);

  const transitioning = state.transition !== null;

  // ---------------------------------------------------
  // UPDATE PHASE (FREEZE DURING TRANSITION)
  // ---------------------------------------------------
  if (!state.paused && !transitioning) {
    state.time += state.dt;
    updateHemodynamics();
    updateBloodContents();
    updateSupplyWaves();
    updatePressureWaves();
  }

  // ---------------------------------------------------
  // CAMERA TRANSITION
  // ---------------------------------------------------
  if (transitioning) {

    camera.t++;
    const u = constrain(camera.t / camera.duration, 0, 1);
    const e = easeInOut(u);

    camera.x = lerp(camera.startX, camera.targetX, e);
    camera.y = lerp(camera.startY, camera.targetY, e);
    camera.zoom = lerp(camera.startZoom, camera.targetZoom, e);

    if (u >= 1) {
      state.mode =
        state.transition === "toSynapse" ? "synapse" : "overview";
      state.transition = null;

      updateOverviewUI();
      if (typeof updateUIPanelContent === "function") {
        updateUIPanelContent(state.mode);
      }

      safeLog("system", `Entered ${state.mode} view`);
    }
  }

  // ---------------------------------------------------
  // DRAW ARTERY (NOT IN SYNAPSE)
  // ---------------------------------------------------
  if (state.mode !== "synapse") {
    drawArtery();
  }

  // ---------------------------------------------------
  // WORLD SPACE
  // ---------------------------------------------------
  push();
  translate(width / 2, height / 2);
  scale(camera.zoom);
  translate(-camera.x, -camera.y);

  if (!state.paused && !transitioning) {
    updateSynapseHover();
    updateEPSPs();
    updateSoma();
    updateVoltageTrace();

    if (window.myelinEnabled) updateMyelinAPs();
    else updateAxonSpikes();

    updateTerminalDots();
    updateVesicles();
    updateNeuron2EPSPs();
    updateSynapticCoupling();
  }

  if (state.mode === "overview") drawOverview(state);
  if (state.mode === "ion") drawIonView(state);
  if (state.mode === "synapse") drawSynapseView(state);

  pop();

  // ---------------------------------------------------
  // UI OVERLAY
  // ---------------------------------------------------
  drawTimeReadout();
  if (typeof drawEventLog === "function") drawEventLog();
}

// =====================================================
// UI HELPERS
// =====================================================
function drawTimeReadout() {
  fill(220);
  noStroke();
  textSize(14);
  textAlign(RIGHT, TOP);
  text(`t = ${state.time.toFixed(0)} ms`, width - 20, 20);
}

function togglePause() {
  state.paused = !state.paused;
}

function togglePanel(id) {
  const panel = document.getElementById(id);
  if (panel) panel.classList.toggle("open");
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  initArtery();
}

function updateOverviewUI() {
  const visible = state.mode === "overview";
  const myelinUI = document.getElementById("myelinToggleContainer");
  const logUI = document.getElementById("logToggleContainer");

  if (myelinUI) myelinUI.style.display = visible ? "flex" : "none";
  if (logUI) logUI.style.display = visible ? "flex" : "none";
}
