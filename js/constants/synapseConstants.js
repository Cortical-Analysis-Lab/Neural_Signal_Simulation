console.log("🧠 synapseConstants loaded");

// =====================================================
// SHARED SYNAPSE CONSTANTS (GLOBAL, SINGLE SOURCE)
// =====================================================

// Geometry (matches neuronShape.js)
window.SYNAPSE_MEMBRANE_X = 0;

window.SYNAPSE_BAR_THICK = 340;
window.SYNAPSE_BAR_HALF  = 140;

window.SYNAPSE_TERMINAL_CENTER_X = SYNAPSE_BAR_THICK / 2;
window.SYNAPSE_TERMINAL_CENTER_Y = 0;
window.SYNAPSE_TERMINAL_RADIUS   = SYNAPSE_BAR_HALF - 10;
window.SYNAPSE_BACK_OFFSET_X     = 70;

// Vesicle visuals
window.SYNAPSE_VESICLE_RADIUS = 10;
window.SYNAPSE_VESICLE_STROKE = 4;

// Vesicle count
window.SYNAPSE_MAX_VESICLES = 10;
