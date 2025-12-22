// =====================================================
// VOLTAGE TRACE (SCREEN-SPACE HUD, LIVE)
// =====================================================
console.log("voltageTrace loaded");

// -----------------------------------------------------
// Configuration
// -----------------------------------------------------
const VM_TRACE_LENGTH = 240; // samples (~4 sec @ 60 fps)
const VM_MIN = -75;
const VM_MAX = 45;

// -----------------------------------------------------
// Internal buffer (live soma VmDisplay)
// -----------------------------------------------------
const vmTrace = [];

// -----------------------------------------------------
// Update trace buffer (called from main.js)
// -----------------------------------------------------
function updateVoltageTrace() {
  if (!window.soma) return;

  vmTrace.push(soma.VmDisplay);
  if (vmTrace.length > VM_TRACE_LENGTH) {
    vmTrace.shift();
  }
}

// -----------------------------------------------------
// Draw voltage trace (SCREEN SPACE, NO CAMERA)
// -----------------------------------------------------
function drawVoltageTrace() {

  if (vmTrace.length < 2) return;

  // ---------------------------------------------------
  // RESET camera transform → screen space
  // ---------------------------------------------------
  push();
  resetMatrix();

  // ---------------------------------------------------
  // Layout (bottom-center of screen)
  // ---------------------------------------------------
  const traceWidth = 360;
  const traceHeight = 90;

  const x0 = width / 2 - traceWidth / 2;
  const y0 = height - traceHeight - 40;

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
