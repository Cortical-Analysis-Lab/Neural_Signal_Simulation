// =====================================================
// VOLTAGE TRACE (DISPLAY-ONLY, STANDALONE MODULE)
// =====================================================
console.log("voltageTrace loaded");

// -----------------------------------------------------
// Trace configuration
// -----------------------------------------------------
const VM_TRACE_LENGTH = 240;   // samples (~4 sec @ 60 fps)
const VM_MIN = -75;
const VM_MAX = 45;

// -----------------------------------------------------
// Internal trace buffer (display only)
// -----------------------------------------------------
const vmTrace = [];

// -----------------------------------------------------
// Update trace buffer (call once per frame)
// -----------------------------------------------------
function updateVoltageTrace() {
  if (!window.soma || typeof soma.VmDisplay !== "number") return;

  vmTrace.push(soma.VmDisplay);

  if (vmTrace.length > VM_TRACE_LENGTH) {
    vmTrace.shift();
  }
}

// -----------------------------------------------------
// Draw voltage trace below neuron 1
// -----------------------------------------------------
function drawVoltageTrace() {

  if (!window.neuron || !window.soma || vmTrace.length < 2) return;

  // ---------------------------------------------------
  // Anchor trace to soma position (world space)
  // ---------------------------------------------------
  const somaX = 0;
  const somaY = 0;

  const traceWidth  = 360;
  const traceHeight = 90;

  const x0 = somaX - traceWidth / 2;
  const y0 = somaY + neuron.somaRadius + 40; // 🔑 MUCH CLOSER

  const VM_MIN = -75;
  const VM_MAX = 45;

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
  line(x0, yThresh, x0 + traceWidth, yThresh);

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

