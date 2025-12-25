console.log("✅ main.js loaded");

// =====================================================
// GLOBAL SIMULATION STATE
// =====================================================
const state = {
  time: 0,
  dt: 16.67,
  paused: false,
  mode: "overview"
};

// -----------------------------------------------------
// Global Toggles
// -----------------------------------------------------
window.myelinEnabled  = false;
window.loggingEnabled = true;

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
    camera.targetZoom = 1.2;
  } else {
    camera.targetZoom = 2.5;
  }

  updateOverviewUI();
  updateUIPanelContent();

  logEvent("system", `Switched to ${mode} view`);
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

  // Pause button
  const pauseBtn = document.getElementById("pauseBtn");
  if (pauseBtn) pauseBtn.onclick = togglePause;

  // Myelin toggle
  const myelinToggle = document.getElementById("myelinToggle");
  if (myelinToggle) {
    myelinToggle.checked = window.myelinEnabled;
    myelinToggle.addEventListener("change", () => {
      window.myelinEnabled = myelinToggle.checked;
      logEvent("system", `Myelin ${window.myelinEnabled ? "enabled" : "disabled"}`);
    });
  }

  // Logging toggle
  const logToggle = document.getElementById("logToggle");
  if (logToggle) {
    logToggle.checked = window.loggingEnabled;
    logToggle.addEventListener("change", () => {
      window.loggingEnabled = logToggle.checked;
      console.log("Logging enabled:", window.loggingEnabled);
    });
  }

  updateOverviewUI();
  updateUIPanelContent();
}

// =====================================================
// MAIN LOOP
// =====================================================
function draw() {
  background(15, 17, 21);

  if (!state.paused) {
    state.time += state.dt;
    updateHemodynamics();
    updateBloodContents();
    updateSupplyWaves();
    updatePressureWaves();
  }

  drawArtery();

  camera.x    += (camera.targetX    - camera.x)    * camera.lerpSpeed;
  camera.y    += (camera.targetY    - camera.y)    * camera.lerpSpeed;
  camera.zoom += (camera.targetZoom - camera.zoom) * camera.lerpSpeed;

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
    case "overview": drawOverview(state); break;
    case "ion":      drawIonView(state); break;
    case "synapse":  drawSynapseView(state); break;
  }

  pop();
  drawTimeReadout();
  updateEventLogUI();
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
  if (pauseBtn) pauseBtn.innerText = state.paused ? "Resume" : "Pause";

  logEvent("system", state.paused ? "Simulation paused" : "Simulation resumed");
}

// =====================================================
// PANEL TOGGLING
// =====================================================
function togglePanel(id) {
  const panel = document.getElementById(id);
  if (panel) panel.classList.toggle("open");
}

// =====================================================
// EVENT LOGGING SYSTEM
// =====================================================
const EVENT_COLORS = {
  neural:   "#ffd966",  // 🟡 yellow — neural activity
  vascular:"#ff6f6f",  // 🔴 red — blood / BBB / flow
  glial:   "#b58cff",  // 🟣 purple — astrocytes / glia
  system:  "#b0b0b0"   // ⚪ gray — UI / mode / state
};


const eventLog = [];
const MAX_EVENTS = 6;

function logEvent(type, message, target = null) {
  if (!window.loggingEnabled) return;
  if (state.paused) return;

  eventLog.push({
    type,
    message,
    time: state.time,
    target
  });

  if (eventLog.length > MAX_EVENTS) eventLog.shift();
}

function updateEventLogUI() {
  const container = document.getElementById("event-log");
  if (!container || !window.loggingEnabled) return;

  container.innerHTML = eventLog.map(evt => {
    const age = Math.max(0, state.time - evt.time);
    const color = EVENT_COLORS[evt.type] || "#ccc";

    return `
      <div class="event-line"
           style="color:${color}"
           onclick="handleLogClick('${evt.target || ""}')">
        • ${evt.message}
        <span style="opacity:0.6">(~${Math.round(age)} ms ago)</span>
      </div>
    `;
  }).join("");
}

function handleLogClick(target) {
  if (!target) return;
  console.log("Log clicked:", target);

  // 🔑 FUTURE: highlight regions here
  // Example:
  // window.highlightSomaUntil = state.time + 500;
}

// =====================================================
// RESPONSIVE CANVAS
// =====================================================
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  initArtery();
}

// =====================================================
// MODE-DEPENDENT UI
// =====================================================
function updateOverviewUI() {
  const myelinUI = document.getElementById("myelinToggleContainer");
  const logUI    = document.getElementById("logToggleContainer");

  const visible = state.mode === "overview";

  if (myelinUI) myelinUI.style.display = visible ? "flex" : "none";
  if (logUI)    logUI.style.display    = visible ? "flex" : "none";
}
