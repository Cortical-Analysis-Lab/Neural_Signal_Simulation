// =====================================================
// EVENT LOG — "WHAT JUST HAPPENED?"
// =====================================================
console.log("🧾 eventLog.js loaded");

// -----------------------------------------------------
// Event colors (semantic)
// -----------------------------------------------------
const EVENT_COLORS = {
  neural:    "#ffd966", // 🟡 neural
  vascular: "#ff6f6f", // 🔴 vascular
  glial:    "#b58cff", // 🟣 glial
  system:   "#b0b0b0"  // ⚪ system
};

// -----------------------------------------------------
// Internal state
// -----------------------------------------------------
const eventLog = [];

// -----------------------------------------------------
// Public: log an event
// -----------------------------------------------------
function logEvent(type, message, target = null) {
  if (!window.loggingEnabled) return;
  if (state?.paused) return;

  eventLog.push({
    type,
    message,
    target
  });
}

// -----------------------------------------------------
// Public: draw log UI (scrollable)
// -----------------------------------------------------
function drawEventLog() {
  const container = document.getElementById("event-log");
  if (!container || !window.loggingEnabled) return;

  container.innerHTML = eventLog.map(evt => {
    const color = EVENT_COLORS[evt.type] || "#ccc";

    return `
      <div class="event-line"
           style="color:${color}"
           onclick="highlightTarget('${evt.target || ""}')">
        • ${evt.message}
      </div>
    `;
  }).join("");

  // Always keep newest events visible
  container.scrollTop = container.scrollHeight;
}

// -----------------------------------------------------
// Public: highlight helper (called by log clicks)
// -----------------------------------------------------
function highlightTarget(target) {
  if (!target) return;

  console.log("🎯 Highlight target:", target);

  const duration = 600;

  switch (target) {
    case "soma":
      window.highlightSomaUntil = state.time + duration;
      break;
    case "dendrite":
      window.highlightDendriteUntil = state.time + duration;
      break;
    case "axon":
      window.highlightAxonUntil = state.time + duration;
      break;
    case "astrocyte":
      window.highlightAstrocyteUntil = state.time + duration;
      break;
    case "artery":
      window.highlightArteryUntil = state.time + duration;
      break;
  }
}

// -----------------------------------------------------
// Optional: highlight overlay renderer
// -----------------------------------------------------
function drawHighlightOverlay() {
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
// Public API (GLOBAL, SINGLE SOURCE OF TRUTH)
// -----------------------------------------------------
window.logEvent             = logEvent;
window.drawEventLog         = drawEventLog;
window.highlightTarget      = highlightTarget;
window.drawHighlightOverlay = drawHighlightOverlay;
