// =====================================================
// VOLTAGE TRACE — LIVE SOMA Vm (WORLD-SPACE, CLEAN)
// =====================================================
console.log("voltageTrace loaded");

// -----------------------------------------------------
// Configuration
// -----------------------------------------------------
const VM_TRACE_LENGTH = 240;   // ~4 seconds at 60 fps
const VM_MIN = -80;
const VM_MAX = 45;

// -----------------------------------------------------
// Internal buffer
// -----------------------------------------------------
const vmTrace = [];

// -----------------------------------------------------
// Update trace buffer (called every frame)
// -----------------------------------------------------
function updateVoltageTrace() {
  if (typeof soma === "undefined") return;

  vmTrace.push(soma.VmDisplay);

  if (vmTrace.length > VM_TRACE_LENGTH) {
    vmTrace.shift();
  }
}

// -----------------------------------------------------
// Draw voltage trace (anchored under neuron 1 soma)
// -----------------------------------------------------
function drawVoltageTrace() {

  if (vmTrace.length < 2) return;

  push();

  // ---------------------------------------------------
  // Anchor trace to neuron 1 soma (WORLD SPACE)
  // ---------------------------------------------------
  const x0 = 0 - 180;
  const y0 = neuron.somaRadius + 55;

  const traceWidth  = 360;
  const traceHeight = 90;

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

  stroke(80, 200, 255, 160); // cyan
  strokeWeight(1);
  line(x0, yThresh, x0 + traceWidth, yThresh);

  // ---------------------------------------------------
  // Voltage trace
  // ---------------------------------------------------
  noFill();
  stroke(100, 255, 100); // green
  strokeWeight(2);
  strokeJoin(ROUND);
  strokeCap(ROUND);

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

  // ---------------------------------------------------
  // Label
  // ---------------------------------------------------
  noStroke();
  fill(200);
  textSize(12);
  textAlign(LEFT, BOTTOM);
  text("Membrane potential (Vm)", x0, y0 - 6);

  pop();
}
