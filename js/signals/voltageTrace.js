// =====================================================
// VOLTAGE TRACE (WORLD-SPACE, NEURON-ANCHORED)
// =====================================================
console.log("voltageTrace loaded");

// -----------------------------------------------------
// Configuration
// -----------------------------------------------------
const VM_TRACE_LENGTH = 240;   // samples (~4 sec @ 60 fps)
const VM_MIN = -75;
const VM_MAX = 45;

// -----------------------------------------------------
// Internal buffer (live soma VmDisplay)
// -----------------------------------------------------
const vmTrace = [];

// -----------------------------------------------------
// Update trace buffer (called every frame)
// -----------------------------------------------------
function updateVoltageTrace() {
  if (!window.soma) return;

  vmTrace.push(soma.VmDisplay);

  if (vmTrace.length > VM_TRACE_LENGTH) {
    vmTrace.shift();
  }
}

// -----------------------------------------------------
// Draw voltage trace (WORLD SPACE, follows neuron)
// -----------------------------------------------------
function drawVoltageTrace() {

  if (vmTrace.length < 2) return;

  // ---------------------------------------------
  // Anchor to neuron 1 soma (same frame as soma)
  // ---------------------------------------------
  const somaX = 0;
  const somaY = 0;

  // Trace layout (relative to soma)
  const traceWidth  = 120;
  const traceHeight = 35;
  const yOffset     = neuron.somaRadius + 22;

  const x0 = somaX - traceWidth / 2;
  const y0 = somaY + yOffset;

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
  strokeWeight(1.6);

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
