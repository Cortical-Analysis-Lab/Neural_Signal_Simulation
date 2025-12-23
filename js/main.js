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

  updateOverviewUI(); // 👈 ADD THIS LINE
}


// =====================================================
// P5 SETUP
// =====================================================
let canvas;

function setup() {
  canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent(document.body);
  frameRate(60);

  // 1️⃣ Build neuron 1 first
  initSynapses();
  initAxonPath(neuron);

  initArtery();


  // Generate Nodes of Ranvier (geometry only)
neuron.axon.myelinNodes = generateMyelinNodes(neuron.axon.path);



  // 2️⃣ THEN build neuron 2 (depends on axon terminals)
  initNeuron2();
  initNeuron3();


  setMode("overview");

  // Pause button
  const pauseBtn = document.getElementById("pauseBtn");
  if (pauseBtn) pauseBtn.onclick = togglePause;

  // UI panels
  initUIPanels();
  // =====================================================
// MYELIN TOGGLE HOOKUP
// =====================================================
const myelinToggle = document.getElementById("myelinToggle");

if (myelinToggle) {
  myelinToggle.checked = window.myelinEnabled;

  myelinToggle.addEventListener("change", () => {
    window.myelinEnabled = myelinToggle.checked;
    console.log("Myelin enabled:", window.myelinEnabled);
  });
}

// Ensure correct visibility on load
updateOverviewUI();

}

// =====================================================
// MAIN LOOP
// =====================================================
function draw() {
  background(15, 17, 21);
    // 🩸 DRAW ARTERY IN SCREEN SPACE (NO CAMERA)
  drawArtery();


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

    if (!state.paused) {
  
    // =====================================================
    // CORE SIGNAL + STATE UPDATES (AUTHORITATIVE)
    // =====================================================
    updateHemodynamics();
    updateBloodContents();
    applyMetabolicWaves();
    updateSupplyWaves();


    updateSynapseHover();
    updateEPSPs();
    updateSoma();
    updateVoltageTrace();
  
 if (window.myelinEnabled) {
    updateMyelinAPs();
    updateTerminalDots(); // terminals still needed
  } else {
    updateAxonSpikes();
    updateTerminalDots();
  }

  updateVesicles();

  
    updateNeuron2EPSPs();
    updateSynapticCoupling();
  }


  // ---- RENDER ----
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
  const pauseBtn = document.getElementById("pauseBtn");
  if (pauseBtn) {
    pauseBtn.innerText = state.paused ? "Resume" : "Pause";
  }
}

// =====================================================
// COLLAPSIBLE UI PANELS
// =====================================================
function initUIPanels() {

  const instructions = document.getElementById("instructions");
  if (instructions) {
    instructions.classList.add("panel", "left", "open");

    const btn = document.createElement("button");
    btn.className = "panel-toggle";
    btn.innerText = "☰";
    btn.onclick = () => instructions.classList.toggle("open");

    instructions.appendChild(btn);
  }

  const observations = document.getElementById("observations");
  if (observations) {
    observations.classList.add("panel", "bottom", "open");

    const btn = document.createElement("button");
    btn.className = "panel-toggle";
    btn.innerText = "▲";
    btn.onclick = () => observations.classList.toggle("open");

    observations.appendChild(btn);
  }
}

// =====================================================
// RESPONSIVE CANVAS
// =====================================================
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  initArtery(); // 🔑 rebuild static artery geometry
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

