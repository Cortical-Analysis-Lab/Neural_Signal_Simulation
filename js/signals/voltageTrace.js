// =====================================================
// VOLTAGE TRACE (WORLD-SPACE, NEURON-ANCHORED)
// =====================================================
console.log("voltageTrace loaded");

// -----------------------------------------------------
// Configuration
// -----------------------------------------------------
const VM_TRACE_LENGTH = 240;   // ~4 sec @ 60 fps
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

  // ---------------------------------------------
  // Anchor directly under neuron 1 soma
  // Soma is at (0,0) in world space
  // ---------------------------------------------
  const traceWidth  = 120;
  const traceHeight = 32;

  const x0 = -traceWidth / 2;
  const y0 = neuron.somaRadius + 26;

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

  stroke(255, 120);
  strokeWeight(0.8);
  line(x0, yThresh, x0 + traceWidth, yThresh);

  // ---------------------------------------------
  // Voltage trace
  // ---------------------------------------------
  noFill();
  stroke(255);
  strokeWeight(1.5);

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
}
