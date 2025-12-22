// =====================================================
// VOLTAGE TRACE (WORLD-SPACE, SOMA-ANCHORED)
// =====================================================
console.log("🧪 voltageTrace loaded");

// -----------------------------------------------------
// Configuration
// -----------------------------------------------------
const VM_TRACE_LENGTH = 240;
const VM_MIN = -80;
const VM_MAX = 45;

// -----------------------------------------------------
// Internal buffer
// -----------------------------------------------------
const vmTrace = [];

// -----------------------------------------------------
// Update trace buffer
// -----------------------------------------------------
function updateVoltageTrace() {
  if (!window.soma) return;

  vmTrace.push(soma.Vm);
  if (vmTrace.length > VM_TRACE_LENGTH) {
    vmTrace.shift();
  }
}

// -----------------------------------------------------
// Draw voltage trace (follows soma)
// -----------------------------------------------------
function drawVoltageTrace() {

  if (!vmTrace.length || !window.neuron || !window.soma) return;

  push();

  // ===================================================
  // Anchor directly below soma center
  // ===================================================
  const somaBottom = neuron.somaRadius;

  const traceWidth  = 160;   // narrower
  const traceHeight = 60;

  const x0 = -traceWidth * 0.1;      // shift RIGHT of soma center
  const y0 = somaBottom + 22;        // directly under soma

  // ---------------------------------------------------
  // Frame (for debugging – keep for now)
  // ---------------------------------------------------
  noFill();
  stroke(255, 40);
  rect(x0, y0, traceWidth, traceHeight, 6);

  // ---------------------------------------------------
  // Threshold line
  // ---------------------------------------------------
  const yThresh = map(
    soma.threshold,
    VM_MIN,
    VM_MAX,
    y0 + traceHeight,
    y0
  );

  stroke(100, 180, 255);
  strokeWeight(1);
  line(x0, yThresh, x0 + traceWidth, yThresh);

  // ---------------------------------------------------
  // Voltage trace
  // ---------------------------------------------------
  noFill();
  stroke(120, 255, 120);
  strokeWeight(2);

  beginShape();
  for (let i = 0; i < vmTrace.length; i++) {
    const x = map(i, 0, VM_TRACE_LENGTH - 1, x0, x0 + traceWidth);
    const y = map(vmTrace[i], VM_MIN, VM_MAX, y0 + traceHeight, y0);
    vertex(x, y);
  }
  endShape();

  // ---------------------------------------------------
  // Label BELOW plot
  // ---------------------------------------------------
  noStroke();
  fill(200);
  textSize(11);
  textAlign(CENTER, TOP);
  text("Membrane potential (Vm)",
       x0 + traceWidth / 2,
       y0 + traceHeight + 6);

  pop();
}
