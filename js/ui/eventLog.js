// =====================================================
// EVENT LOG — "WHAT JUST HAPPENED?"
// =====================================================
console.log("🧾 eventLog.js loaded");

// -----------------------------------------------------
// Configuration
// -----------------------------------------------------
const MAX_EVENTS = 6;

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
    target,
    time: state.time
  });

  if (eventLog.length > MAX_EVENTS) {
    eventLog.shift();
  }
}

// -----------------------------------------------------
// Public: draw log UI
// -----------------------------------------------------
function drawEventLog(now = 0) {
  const container = document.getElementById("event-log");
  if (!container || !window.loggingEnabled) return;

  container.innerHTML = eventLog.map(evt => {
    const age = Math.max(0, now - evt.time);
    const color = EVENT_COLORS[evt.type] || "#ccc";

    return `
      <div class="event-line"
           style="color:${color}"
           onclick="highlightTarget('${evt.target || ""}')">
        • ${evt.message}
        <span style="opacity:0.55">
          (~${Math.round(age)} ms ago)
        </span>
      </div>
    `;
  }).join("");
}

// -----------------------------------------------------
// Public: highlight helper (called by log clicks)
// -----------------------------------------------------
function highlightTarget(target) {
  if (!target) return;

  console.log("🎯 Highlight target:", target);

  // Simple time-based flags (consumed by drawHighlightOverlay)
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
// Public: overlay renderer (optional, safe)
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
// Public API
// -----------------------------------------------------
window.logEvent            = logEvent;
window.drawEventLog        = drawEventLog;
window.highlightTarget     = highlightTarget;
window.drawHighlightOverlay = drawHighlightOverlay;
