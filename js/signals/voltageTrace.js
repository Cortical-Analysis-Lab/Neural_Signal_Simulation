// =====================================================
// VOLTAGE TRACE (WORLD-SPACE, SOMA-ANCHORED)
// =====================================================
console.log("🧪 voltageTrace loaded");

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
  if (!window.soma) return;

  vmTrace.push(soma.VmDisplay);

  if (vmTrace.length > VM_TRACE_LENGTH) {
    vmTrace.shift();
  }
}

// -----------------------------------------------------
// Draw trace BELOW NEURON 1 SOMA (WORLD SPACE)
// -----------------------------------------------------
function drawVoltageTrace() {

  if (!vmTrace.length) return;

  // ---------------------------------------------------
  // Anchor point: directly under neuron 1 soma
  // ---------------------------------------------------
  const x0 = 0;
  const y0 = neuron.somaRadius + 60;

  const traceWidth = 220;
  const traceHeight = 60;

  push();

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
  strokeWeight(1);
  line(
    x0 - traceWidth / 2,
    yThresh,
    x0 + traceWidth / 2,
    yThresh
  );

  // ---------------------------------------------------
  // Voltage trace
  // ---------------------------------------------------
  noFill();
  stroke(255);
  strokeWeight(2);

  beginShape();
  for (let i = 0; i < vmTrace.length; i++) {

    const x = map(
      i,
      0,
      VM_TRACE_LENGTH - 1,
      x0 - traceWidth / 2,
      x0 + traceWidth / 2
    );

    const y = map(
      vmTrace[i],
      VM_MIN,
      VM_MAX,
      y0 + traceHeight,
      y0
    );

    vertex(x, y);
  }
  endShape();

  pop();
}
