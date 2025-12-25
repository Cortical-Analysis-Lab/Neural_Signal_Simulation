// =====================================================
// EVENT LOG — METABOLIC SUMMARY
// =====================================================
console.log("🧾 eventLog.js loaded (metabolic summary mode)");

// -----------------------------------------------------
// Semantic colors
// -----------------------------------------------------
const EVENT_COLORS = {
  low:      "#b0b0b0", // baseline / system
  neural:   "#ffd966", // elevated demand
  vascular: "#ff6f6f", // increased supply
  glial:    "#b58cff"  // astrocytic coordination
};

// -----------------------------------------------------
// Internal metabolic state (ACCUMULATED)
// -----------------------------------------------------
const metabolicState = {
  neuralDemand: 0,
  vascularSupply: 0,
  glialActivity: 0,
  lastSummary: ""
};

// -----------------------------------------------------
// Tunable decay (per frame-ish updates)
// -----------------------------------------------------
const DECAY_RATE = 0.985;

// -----------------------------------------------------
// Public: register low-level events (ACCUMULATE ONLY)
// -----------------------------------------------------
function logEvent(type, message, target = null) {

  // Accumulate signals — NOT messages
  switch (type) {
    case "neural":
      metabolicState.neuralDemand += 1;
      break;

    case "vascular":
      metabolicState.vascularSupply += 1;
      break;

    case "glial":
      metabolicState.glialActivity += 1;
      break;
  }
}

// -----------------------------------------------------
// Internal: decay toward baseline
// -----------------------------------------------------
function decayMetabolicState() {
  metabolicState.neuralDemand   *= DECAY_RATE;
  metabolicState.vascularSupply *= DECAY_RATE;
  metabolicState.glialActivity  *= DECAY_RATE;
}

// -----------------------------------------------------
// Internal: generate ONE meaningful sentence
// -----------------------------------------------------
function generateMetabolicSummary() {

  const n = metabolicState.neuralDemand;
  const v = metabolicState.vascularSupply;
  const g = metabolicState.glialActivity;

  // ---- Priority logic (teaching-first) ----
  if (n < 0.3 && v < 0.3 && g < 0.3) {
    return {
      text: "Baseline metabolic activity",
      color: EVENT_COLORS.low
    };
  }

  if (n > 1.5 && v < n * 0.7) {
    return {
      text: "Elevated neural demand detected",
      color: EVENT_COLORS.neural
    };
  }

  if (v > n && v > 1.0) {
    return {
      text: "Neurovascular coupling increasing metabolic supply",
      color: EVENT_COLORS.vascular
    };
  }

  if (g > 0.8) {
    return {
      text: "Astrocytes coordinating metabolic support",
      color: EVENT_COLORS.glial
    };
  }

  return {
    text: "Metabolic activity adapting to neural demand",
    color: EVENT_COLORS.neural
  };
}

// -----------------------------------------------------
// Public: draw SINGLE-LINE log
// -----------------------------------------------------
function drawEventLog() {
  const container = document.getElementById("event-log");
  if (!container) return;

  // Toggle controls visibility ONLY
  if (!window.loggingEnabled) {
    container.classList.add("hidden");
    return;
  } else {
    container.classList.remove("hidden");
  }

  // Update state
  decayMetabolicState();
  const summary = generateMetabolicSummary();

  // Avoid DOM churn if text unchanged
  if (summary.text === metabolicState.lastSummary) return;
  metabolicState.lastSummary = summary.text;

  container.innerHTML = `
    <div class="event-line" style="color:${summary.color}">
      • ${summary.text}
    </div>
  `;
}

// -----------------------------------------------------
// Optional: highlight overlay renderer (unchanged)
// -----------------------------------------------------
function drawHighlightOverlay() {
  if (typeof state === "undefined") return;

  push();
  noFill();
  strokeWeight(3);

  if (window.highlightSomaUntil > state.time) {
    stroke("#ffd966");
    ellipse(0, 0, 110, 110);
  }

  pop();
}

// -----------------------------------------------------
// Public API
// -----------------------------------------------------
window.logEvent              = logEvent;
window.drawEventLog          = drawEventLog;
window.drawHighlightOverlay  = drawHighlightOverlay;
