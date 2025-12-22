// =====================================================
// VOLTAGE TRACE (WORLD-SPACE, FOLLOWS NEURON)
// DEBUG / TROUBLESHOOTING ENABLED
// =====================================================
console.log("🧪 voltageTrace loaded");

// -----------------------------------------------------
// Configuration
// -----------------------------------------------------
const VM_TRACE_LENGTH = 240;   // samples (~4 sec @ 60 fps)
const VM_MIN = -75;
const VM_MAX = 45;

// -----------------------------------------------------
// Internal buffer
// -----------------------------------------------------
const vmTrace = [];

// -----------------------------------------------------
// Update trace buffer (called from main.js)
// -----------------------------------------------------
function updateVoltageTrace() {
if (typeof soma === "undefined") return;

  vmTrace.push(soma.VmDisplay);
  if (vmTrace.length > VM_TRACE_LENGTH) {
    vmTrace.shift();
  }

  // 🔍 DEBUG: confirm values changing
  if (frameCount % 60 === 0) {
    console.log("🧪 updateVoltageTrace()", soma.VmDisplay.toFixed(1));
  }
}

// -----------------------------------------------------
// Draw voltage trace (WORLD SPACE — follows soma)
// -----------------------------------------------------
function drawVoltageTrace() {

  // 🔴 DEBUG 1 — prove function is executing
  if (frameCount % 60 === 0) {
    console.log("🧪 drawVoltageTrace()", vmTrace.length);
  }

  // Even with no data, draw a marker
  push();

  // ---------------------------------------------------
  // Anchor directly under NEURON 1 soma (world coords)
  // ---------------------------------------------------
  const x0 = 0;
  const y0 = neuron.somaRadius + 40;

  // ---------------------------------------------------
  // 🔴 DEBUG 2 — GIANT RED BOX (must be visible)
  // ---------------------------------------------------
  stroke(255, 0, 0);
  strokeWeight(3);
  noFill();
  rect(x0 - 180, y0 - 40, 360, 120);

  // ---------------------------------------------------
  // 🔴 DEBUG 3 — CENTER MARKER
  // ---------------------------------------------------
  noStroke();
  fill(255, 0, 0);
  ellipse(x0, y0, 8);

  // ---------------------------------------------------
  // If not enough samples, stop here
  // ---------------------------------------------------
  if (vmTrace.length < 2) {
    pop();
    return;
  }

  // ---------------------------------------------------
  // Threshold line (CYAN, VERY VISIBLE)
  // ---------------------------------------------------
  const yThresh = map(
    soma.threshold,
    VM_MIN,
    VM_MAX,
    y0 + 60,
    y0
  );

  stroke(0, 255, 255);
  strokeWeight(2);
  line(x0 - 180, yThresh, x0 + 180, yThresh);

  // ---------------------------------------------------
  // Voltage trace (BRIGHT GREEN, THICK)
  // ---------------------------------------------------
  noFill();
  stroke(0, 255, 0);
  strokeWeight(3);

  beginShape();
  for (let i = 0; i < vmTrace.length; i++) {

    const x = map(
      i,
      0,
      VM_TRACE_LENGTH - 1,
      x0 - 180,
      x0 + 180
    );

    const y = map(
      vmTrace[i],
      VM_MIN,
      VM_MAX,
      y0 + 60,
      y0
    );

    vertex(x, y);
  }
  endShape();

  // ---------------------------------------------------
  // Current Vm text (white, obvious)
  // ---------------------------------------------------
  noStroke();
  fill(255);
  textSize(12);
  textAlign(LEFT, BOTTOM);
  text(
    `Vm = ${soma.VmDisplay.toFixed(1)} mV`,
    x0 - 175,
    y0 - 45
  );

  pop();
}
