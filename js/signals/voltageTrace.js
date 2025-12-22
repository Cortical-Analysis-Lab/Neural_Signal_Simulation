// =====================================================
// VOLTAGE TRACE — HARD DEBUG VERSION (DO NOT STYLE YET)
// =====================================================
console.log("🧪 voltageTrace.js LOADED");

// -----------------------------------------------------
// Configuration
// -----------------------------------------------------
const VM_TRACE_LENGTH = 240;
const VM_MIN = -75;
const VM_MAX = 45;

// -----------------------------------------------------
// Internal buffer
// -----------------------------------------------------
const vmTrace = [];

// -----------------------------------------------------
// Update trace buffer
// -----------------------------------------------------
function updateVoltageTrace() {

  // 🔎 PROVE update is called
  console.log("🧪 updateVoltageTrace()", soma?.VmDisplay);

  if (!window.soma) return;

  vmTrace.push(soma.VmDisplay);

  if (vmTrace.length > VM_TRACE_LENGTH) {
    vmTrace.shift();
  }
}

// -----------------------------------------------------
// Draw voltage trace
// -----------------------------------------------------
function drawVoltageTrace() {

  // 🔎 PROVE draw is called
  console.log("🧪 drawVoltageTrace()", vmTrace.length);

  // =====================================================
  // 1️⃣ SCREEN-SPACE PROOF (IMPOSSIBLE TO MISS)
  // =====================================================
  push();
  resetMatrix();
  noStroke();
  fill(255, 0, 0);
  ellipse(width / 2, height / 2, 20, 20); // 🔴 RED DOT CENTER SCREEN
  pop();

  // =====================================================
  // 2️⃣ WORLD-SPACE PROOF (ANCHOR TO SOMA)
  // =====================================================
  if (!window.neuron) return;

  push();
  stroke(0, 255, 0);
  strokeWeight(6);
  point(0, 0); // 🟢 GREEN DOT AT SOMA
  pop();

  // =====================================================
  // 3️⃣ DRAW ACTUAL TRACE (OVERSIZED, HIGH-CONTRAST)
  // =====================================================
  if (vmTrace.length < 2) return;

  const traceWidth  = 300;
  const traceHeight = 120;

  const x0 = -traceWidth / 2;
  const y0 = neuron.somaRadius + 80;

  // Background block (temporary)
  noStroke();
  fill(0, 0, 255, 80);
  rect(x0, y0, traceWidth, traceHeight);

  // Threshold line
  const yThresh = map(
    soma.threshold,
    VM_MIN,
    VM_MAX,
    y0 + traceHeight,
    y0
  );

  stroke(255, 255, 0);
  strokeWeight(3);
  line(x0, yThresh, x0 + traceWidth, yThresh);

  // Trace
  noFill();
  stroke(255);
  strokeWeight(4);

  beginShape();
  for (let i = 0; i < vmTrace.length; i++) {
    const x = map(i, 0, VM_TRACE_LENGTH - 1, x0, x0 + traceWidth);
    const y = map(vmTrace[i], VM_MIN, VM_MAX, y0 + traceHeight, y0);
    vertex(x, y);
  }
  endShape();
}
