// =====================================================
// EVENT LOG — "WHAT JUST HAPPENED?"
// =====================================================
console.log("🧾 eventLog.js loaded");

// -----------------------------------------------------
// Configuration
// -----------------------------------------------------
const MAX_EVENTS = 12; // scrollable, visually shows ~3–4

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
// Public: log an event (DOES NOT CARE if UI hidden)
// -----------------------------------------------------
function logEvent(type, message, target = null) {
  eventLog.push({
    type,
    message,
    target
  });

  if (eventLog.length > MAX_EVENTS) {
    eventLog.shift();
  }
}

// -----------------------------------------------------
// Public: draw log UI (visibility controlled here)
// -----------------------------------------------------
function drawEventLog() {
  const container = document.getElementById("event-log");
  if (!container) return;

  // 🔑 Toggle controls VISIBILITY, not logging
  if (!window.loggingEnabled) {
    container.classList.add("hidden");
    return;
  } else {
    container.classList.remove("hidden");
  }

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

  // Always scroll to newest
  container.scrollTop = container.scrollHeight;
}

// -----------------------------------------------------
// Public: highlight helper (log click → visual cue)
// -----------------------------------------------------
function highlightTarget(target) {
  if (!target || typeof state === "undefined") return;

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
// Optional: highlight overlay renderer (SAFE)
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
// Public API (GLOBAL, SINGLE SOURCE OF TRUTH)
// -----------------------------------------------------
window.logEvent              = logEvent;
window.drawEventLog          = drawEventLog;
window.highlightTarget       = highlightTarget;
window.drawHighlightOverlay  = drawHighlightOverlay;
