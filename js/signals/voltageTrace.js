// =====================================================
// VOLTAGE TRACE — LIVE SOMA Vm (BIOLOGICAL STYLE)
// =====================================================
console.log("voltageTrace loaded");

// -----------------------------------------------------
// Configuration
// -----------------------------------------------------
const VM_TRACE_LENGTH = 220;
const VM_MIN = -80;
const VM_MAX = 45;

// -----------------------------------------------------
// Internal buffer
// -----------------------------------------------------
const vmTrace = [];

// -----------------------------------------------------
// Update buffer
// -----------------------------------------------------
function updateVoltageTrace() {
  if (typeof soma === "undefined") return;

vmTrace.push(soma.Vm);
  if (vmTrace.length > VM_TRACE_LENGTH) {
    vmTrace.shift();
  }
}

// -----------------------------------------------------
// Draw trace (world-space, near soma)
// -----------------------------------------------------
function drawVoltageTrace() {

  if (vmTrace.length < 2) return;

  push();

  // ---------------------------------------------------
  // Position
  // ---------------------------------------------------
  const x0 = neuron.somaRadius * 0.6;
  const y0 = neuron.somaRadius + 50;

  const traceWidth  = 200;
  const traceHeight = 85;

  // ---------------------------------------------------
  // Y-axis
  // ---------------------------------------------------
  stroke(180, 120);
  strokeWeight(1);
  line(x0, y0, x0, y0 + traceHeight);

  const ticks = [-70, -55, 0, 40];
  noStroke();
  fill(180);
  textSize(9);
  textAlign(RIGHT, CENTER);

  ticks.forEach(v => {
    const y = map(v, VM_MIN, VM_MAX, y0 + traceHeight, y0);
    text(v, x0 - 4, y);
  });

  // Axis label
  push();
  translate(x0 - 22, y0 + traceHeight / 2);
  rotate(-HALF_PI);
  textAlign(CENTER, CENTER);
  text("mV", 0, 0);
  pop();

  // ---------------------------------------------------
  // Threshold line (WHITE)
  // ---------------------------------------------------
  const yThresh = map(
    soma.threshold,
    VM_MIN,
    VM_MAX,
    y0 + traceHeight,
    y0
  );

  stroke(255);            // ✅ WHITE threshold
  strokeWeight(1);
  line(x0, yThresh, x0 + traceWidth, yThresh);

  noStroke();
  fill(255);
  textSize(9);
  textAlign(LEFT, CENTER);
  text("threshold", x0 + traceWidth + 4, yThresh);

  // ---------------------------------------------------
  // Voltage trace (BLUE)
  // ---------------------------------------------------
  noFill();
  stroke(90, 170, 255);   // ✅ BLUE Vm trace
  strokeWeight(2.5);
  strokeJoin(ROUND);
  strokeCap(ROUND);

  beginShape();
  for (let i = 0; i < vmTrace.length; i++) {

    const v = vmTrace[i];

    const x = map(
      i,
      0,
      VM_TRACE_LENGTH - 1,
      x0,
      x0 + traceWidth
    );

    const y = map(
      v,
      VM_MIN,
      VM_MAX,
      y0 + traceHeight,
      y0
    );

    vertex(x, y);
  }
  endShape();

  // ---------------------------------------------------
  // Plot label
  // ---------------------------------------------------
  noStroke();
  fill(200);
  textSize(11);
  textAlign(LEFT, TOP);
  text("Membrane potential (Vm)", x0, y0 + traceHeight + 6);

  pop();
}
