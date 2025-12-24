// =====================================================
// HEMODYNAMICS — Cardiac + Vasomotion Signals
// =====================================================
// Diagnostic-safe signal generator
// Motion + coupling intentionally disabled
// =====================================================

console.log("💓 hemodynamics loaded");

// -----------------------------------------------------
// PARAMETERS
// -----------------------------------------------------

let heartRate = 72;         // bpm
let vasomotionRate = 0.08; // Hz

let cardiacPhase = 0;
let vasoPhase    = 0;

let lastTime = 0;

// -----------------------------------------------------
// Update (called once per frame)
// -----------------------------------------------------

function updateHemodynamics() {
  const now = millis();
  const dt  = lastTime ? (now - lastTime) / 1000 : 0;
  lastTime  = now;

  cardiacPhase = (cardiacPhase + dt * (heartRate / 60)) % 1;
  vasoPhase    = (vasoPhase + dt * vasomotionRate) % 1;
}

// -----------------------------------------------------
// Cardiac pulse (0 → 1)
// -----------------------------------------------------

function getCardiacPulse() {
  const p = cardiacPhase;

  if (p < 0.15) {
    return p / 0.15; // rapid systole
  } else {
    return Math.exp(-(p - 0.15) * 5); // diastolic decay
  }
}

// -----------------------------------------------------
// Vasomotion (0 → 1)
// -----------------------------------------------------

function getVasomotion() {
  return 0.5 + 0.5 * sin(TWO_PI * vasoPhase);
}

// -----------------------------------------------------
// Combined hemodynamic scaling (READ-ONLY)
// -----------------------------------------------------

function getHemodynamicScale() {
  return (
    1 +
    0.12 * getCardiacPulse() +
    0.08 * getVasomotion()
  );
}

// =====================================================
// REQUIRED MAIN LOOP HOOKS (NO-OP — BY DESIGN)
// =====================================================
// main.js expects these to exist.
// Logic will be added later, safely.
// =====================================================

function updateSupplyWaves() {
  // intentionally empty
}

function updatePressureWaves() {
  // intentionally empty
}

// -----------------------------------------------------
// GLOBAL EXPORTS
// -----------------------------------------------------

window.updateHemodynamics   = updateHemodynamics;
window.getCardiacPulse      = getCardiacPulse;
window.getVasomotion        = getVasomotion;
window.getHemodynamicScale = getHemodynamicScale;

window.updateSupplyWaves    = updateSupplyWaves;
window.updatePressureWaves  = updatePressureWaves;
