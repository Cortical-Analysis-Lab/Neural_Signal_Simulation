// =====================================================
// VOLTAGE TRACE (WORLD-ANCHORED, SCIENTIFIC)
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
// Draw voltage trace (anchored to soma + axon)
// -----------------------------------------------------
function drawVoltageTrace() {

  if (!vmTrace.length || !window.neuron) return;

  push();

  // ===================================================
  // WORLD SPACE (follows neuron)
  // ===================================================

  // Anchor: soma center
  const somaX = 0;
  const somaY = 0;

  // Plot geometry (narrow & right-shifted)
  const traceWidth  = 260;
  const traceHeight = 80;

  const x0 = somaX + neuron.somaRadius * 0.4;
  const y0 = somaY + neuron.somaRadius * 1.15;

  // ---------------------------------------------------
  // Frame (subtle)
  // ---------------------------------------------------
  noFill();
  stroke(255, 40);
  rect(x0, y0, traceWidth, traceHeight, 6);

  // ---------------------------------------------------
  // Y-axis (mV)
  // ---------------------------------------------------
  stroke(255, 80);
  line(x0, y0, x0, y0 + traceHeight);

  fill(200);
  noStroke();
  textSize(10);
  textAlign(RIGHT, CENTER);
  text("mV", x0 - 6, y0 + traceHeight / 2);

  // ---------------------------------------------------
  // Y-axis ticks
  // ---------------------------------------------------
  const ticks = [-70, -50, 0, 40];
  ticks.forEach(v => {
    const y = map(v, VM_MIN, VM_MAX, y0 + traceHeight, y0);
    stroke(255, 60);
    line(x0 - 4, y, x0, y);
  });

  // ---------------------------------------------------
  // Threshold line + label
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

  push();
  translate(x0 - 14, yThresh);
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
  // Trace label (below plot)
  // ---------------------------------------------------
  noStroke();
  fill(200);
  textSize(11);
  textAlign(CENTER, TOP);
  text("Membrane potential (Vm)", x0 + traceWidth / 2, y0 + traceHeight + 6);

  pop();
}
