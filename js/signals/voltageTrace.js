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

  if (!vmTrace.length || !window.neuron) return;

  push();

  // ===================================================
  // WORLD-SPACE POSITION (RELATIVE TO SOMA)
  // ===================================================
  const x0 = neuron.somaRadius * 0.4;
  const y0 = neuron.somaRadius * 1.2;

  const traceWidth  = 240;
  const traceHeight = 70;

  // ---------------------------------------------------
  // Frame
  // ---------------------------------------------------
  noFill();
  stroke(255, 40);
  rect(x0, y0, traceWidth, traceHeight, 6);

  // ---------------------------------------------------
  // Y-axis
  // ---------------------------------------------------
  stroke(255, 80);
  line(x0, y0, x0, y0 + traceHeight);

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

  stroke(255, 120);
  line(x0, yThresh, x0 + traceWidth, yThresh);

  // Threshold label (vertical)
  push();
  translate(x0 - 12, yThresh);
  rotate(-HALF_PI);
  noStroke();
  fill(255, 160);
  textSize(10);
  textAlign(CENTER, CENTER);
  text("Threshold", 0, 0);
  pop();

  // ---------------------------------------------------
  // Voltage trace
  // ---------------------------------------------------
  noFill();
  stroke(120, 255, 120);
  strokeWeight(2);

  beginShape();
  vmTrace.forEach((v, i) => {
    const x = map(i, 0, VM_TRACE_LENGTH - 1, x0, x0 + traceWidth);
    const y = map(v, VM_MIN, VM_MAX, y0 + traceHeight, y0);
    vertex(x, y);
  });
  endShape();

  // ---------------------------------------------------
  // Label below plot
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
