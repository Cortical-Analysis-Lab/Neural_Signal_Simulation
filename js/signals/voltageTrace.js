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

  // 🔥 HARD VISUAL TEST (NO CONDITIONS)
  push();
  resetMatrix();

  // Giant red rectangle
  noStroke();
  fill(255, 0, 0);
  rect(50, height - 150, width - 100, 100);

  // Big text
  fill(255);
  textSize(32);
  textAlign(CENTER, CENTER);
  text("VOLTAGE TRACE HERE", width / 2, height - 100);

  pop();
}
