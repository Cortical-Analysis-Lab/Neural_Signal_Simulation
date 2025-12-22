// =====================================================
// VOLTAGE TRACE (WORLD-SPACE, SOMA-LOCKED)
// =====================================================
console.log("🧪 voltageTrace loaded");

// -----------------------------------------------------
// Configuration
// -----------------------------------------------------
const VM_TRACE_LENGTH = 240;
const VM_MIN = -75;
const VM_MAX = 45;

// -----------------------------------------------------
// Shared buffer (singleton-safe)
// -----------------------------------------------------
window.vmTrace = window.vmTrace || [];
const vmTrace = window.vmTrace;

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
// Draw voltage trace (WORLD SPACE, follows soma)
// -----------------------------------------------------
function drawVoltageTrace() {
  if (!window.soma) return;
  if (vmTrace.length < 2) return;

  push();

  // ---------------------------------------------------
  // Anchor BELOW soma (world space)
  // ---------------------------------------------------
  const traceWidth  = 120;
  const traceHeight = 40;

  const x0 = neuron.somaRadius * -1;
  const y0 = neuron.somaRadius + 18;

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

  pop();
}
