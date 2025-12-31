console.log("✅ main.js loaded");

// =====================================================
// GLOBAL SIMULATION STATE
// =====================================================
const state = {
  time: 0,
  dt: 16.67,
  paused: false,
  mode: "overview",          
  transition: null           // null | toSynapse | toOverviewFade | toOverviewZoom
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
  if (typeof logEvent === "function") logEvent(type, message, target);
}

// =====================================================
// CAMERA STATE (WORLD SPACE ONLY)
// =====================================================
const camera = {
  x: 0, y: 0, zoom: 1,

  startX: 0, startY: 0, startZoom: 1,
  targetX: 0, targetY: 0, targetZoom: 1,

  t: 0,
  duration: 120
};

// =====================================================
// 🔒 LOCKED SYNAPSE FOCUS
// =====================================================
window.synapseFocus = {
  x: 272.08,
  y: -0.42,
  releaseProb: 0.9,
  diffusionDelay: 10
};

// =====================================================
// EASING FUNCTION
// =====================================================
function easeInOut(t) {
  return t * t * (3 - 2 * t);
}

// =====================================================
// BEGIN TRANSITION
// =====================================================
function beginTransition(targetMode) {

  camera.startX = camera.x;
  camera.startY = camera.y;
  camera.startZoom = camera.zoom;
  camera.t = 0;

  // ----------------------------
  // OVERVIEW → SYNAPSE
  // ----------------------------
  if (targetMode === "synapse") {
    camera.targetX = synapseFocus.x;
    camera.targetY = synapseFocus.y;
    camera.targetZoom = 5.0;
    camera.duration = 120;
    state.transition = "toSynapse";
    safeLog("system", "Zooming into synapse…");
    return;
  }

  // ----------------------------
  // SYNAPSE → OVERVIEW (FADE ONLY)
  // ----------------------------
  if (targetMode === "overview") {
    camera.targetX = camera.x;       // stay zoomed in
    camera.targetY = camera.y;
    camera.targetZoom = camera.zoom;
    camera.duration = 90;
    state.transition = "toOverviewFade";
    safeLog("system", "Returning to overview…");
  }
}

// =====================================================
// MODE SWITCHING
// =====================================================
function setMode(mode) {
  if (mode === "synapse") return beginTransition("synapse");
  if (mode === "overview") return beginTransition("overview");

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

  console.log(
    "axon path length:",
    neuron?.axon?.path?.length
  );

  canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent(document.body);
  frameRate(60);

  // ---------------------------------------------------
  // GEOMETRY / BIOLOGY INITIALIZATION
  // ---------------------------------------------------
  initSynapses();
  initAxonPath(neuron);
  initArtery();

  const geom = generateMyelinGeometry(neuron.axon.path);
  neuron.axon.nodes = geom.nodes;

  initNeuron2();
  initNeuron3();
  initAstrocyte();

  // ===================================================
  // 🧂 EXTRACELLULAR IONS (MUST COME AFTER GEOMETRY)
  // ===================================================
  initBackgroundIons();
  initSomaIons();
  initAxonIons();

  if (typeof initNodeIons === "function") {
  initNodeIons();
  }


  // ---------------------------------------------------
  // INITIAL MODE
  // ---------------------------------------------------
  state.mode = "overview";

  // ---------------------------------------------------
  // UI CONTROLS
  // ---------------------------------------------------
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

  // ---------------------------------------------------
  // UI SYNC
  // ---------------------------------------------------
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
  // UPDATE PHASE (FROZEN DURING TRANSITION)
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

      // ▶ Enter synapse
      if (state.transition === "toSynapse") {
        state.mode = "synapse";
        state.transition = null;
      }

      // ▶ Fade complete → switch to overview, begin zoom-out
      else if (state.transition === "toOverviewFade") {
        state.mode = "overview";

        camera.startX = camera.x;
        camera.startY = camera.y;
        camera.startZoom = camera.zoom;

        camera.targetX = 0;
        camera.targetY = 0;
        camera.targetZoom = 1.2;
        camera.duration = 240; // half speed
        camera.t = 0;

        state.transition = "toOverviewZoom";
      }

      // ▶ Zoom-out complete
      else if (state.transition === "toOverviewZoom") {
        state.transition = null;
      }

      updateOverviewUI();
      if (typeof updateUIPanelContent === "function") {
        updateUIPanelContent(state.mode);
      }
    }
  }

  // ---------------------------------------------------
  // DRAW ARTERY (NOT IN SYNAPSE)
  // ---------------------------------------------------
  if (state.mode !== "synapse") drawArtery();

  // ---------------------------------------------------
  // WORLD SPACE
  // ---------------------------------------------------
  push();
  translate(width / 2, height / 2);
  scale(camera.zoom);
  translate(-camera.x, -camera.y);

  // ===================================================
  // 🌊 EXTRACELLULAR SPACE (BACKGROUND ENVIRONMENT)
  // ===================================================
 if (state.mode === "overview" || state.mode === "ion") {
  drawBackgroundIons();
  drawSomaIons();
  drawAxonIons();

  if (window.myelinEnabled) {
    drawNodeIons();
  }
}

  if (window.myelinEnabled && typeof drawMyelinNodeDebug === "function") {
  drawMyelinNodeDebug();
}



  // ---------------------------------------------------
// UPDATE BIOLOGICAL DYNAMICS
// ---------------------------------------------------
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


  // ---------------------------------------------------
  // DRAW MODES
  // ---------------------------------------------------
  if (state.mode === "overview") drawOverview(state);
  if (state.mode === "ion")      drawIonView(state);
  if (state.mode === "synapse")  drawSynapseView(state);

  pop();

  // ---------------------------------------------------
  // FADE OVERLAY
  // ---------------------------------------------------
  if (transitioning && state.mode !== "synapse") {
    const u = constrain(camera.t / camera.duration, 0, 1);
    let alpha = 0;

    if (state.transition === "toSynapse") {
      alpha = map(u, 0.3, 1.0, 0, 220, true);
    }
    else if (state.transition === "toOverviewFade") {
      alpha = map(u, 0.0, 1.0, 0, 220);
    }
    else if (state.transition === "toOverviewZoom") {
      alpha = map(u, 0.0, 0.4, 220, 0, true);
    }

    noStroke();
    fill(0, alpha);
    rect(0, 0, width, height);
  }

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
function mousePressed() {
  if (typeof handleNodeMousePressed === "function") {
    const mx = (mouseX - width / 2) / camera.zoom + camera.x;
    const my = (mouseY - height / 2) / camera.zoom + camera.y;
    handleNodeMousePressed(mx, my);
  }
}

function mouseDragged() {
  if (typeof handleNodeMouseDragged === "function") {
    const mx = (mouseX - width / 2) / camera.zoom + camera.x;
    const my = (mouseY - height / 2) / camera.zoom + camera.y;
    handleNodeMouseDragged(mx, my);
  }
}

function mouseReleased() {
  if (typeof handleNodeMouseReleased === "function") {
    handleNodeMouseReleased();
  }
}

function keyPressed() {
  if (typeof handleNodeKeyPress === "function") {
    handleNodeKeyPress(key);
  }
}
