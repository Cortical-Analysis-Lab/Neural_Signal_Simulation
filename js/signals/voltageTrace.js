// =====================================================
// VOLTAGE TRACE (WORLD-SPACE, NEURON-ANCHORED)
// =====================================================
console.log("voltageTrace loaded");

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
// Draw voltage trace (WORLD SPACE)
// -----------------------------------------------------
function drawVoltageTrace() {

  if (vmTrace.length < 2) return;
  if (!window.neuron) return;

  push();

  // ---------------------------------------------
  // Layout (larger + farther from soma)
  // ---------------------------------------------
  const traceWidth  = 220;
  const traceHeight = 60;

  const x0 = -traceWidth / 2;
  const y0 = neuron.somaRadius + 45;

  // ---------------------------------------------
  // Threshold line
  // ---------------------------------------------
  const yThresh = map(
    soma.threshold,
    VM_MIN,
    VM_MAX,
    y0 + traceHeight,
    y0
  );

  stroke(255, 160);
  strokeWeight(1.2);
  line(x0, yThresh, x0 + traceWidth, yThresh);

  // ---------------------------------------------
  // Voltage trace
  // ---------------------------------------------
  noFill();
  stroke(255);
  strokeWeight(2.2);

  beginShape();
  for (let i = 0; i < vmTrace.length; i++) {

    const x = map(
      i,
      0,
      VM_TRACE_LENGTH - 1,
      x0,
      x0 + traceWidth
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
