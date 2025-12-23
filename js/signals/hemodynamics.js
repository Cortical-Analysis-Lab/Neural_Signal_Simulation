// =====================================================
// HEMODYNAMICS — Cardiac + Vasomotion Signals
// =====================================================

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
// Combined hemodynamic scaling
// -----------------------------------------------------
function getHemodynamicScale() {
  return (
    1 +
    0.12 * getCardiacPulse() +
    0.08 * getVasomotion()
  );
}
