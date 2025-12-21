// js/constants/colors.js
console.log("🎨 colors loaded");

// =====================================================
// CENTRAL COLOR PALETTE
// =====================================================
const COLORS = {

  // --------------------
  // Ions
  // --------------------
  sodium:    [255, 215,   0],
  potassium: [220,  60,  60],

  // --------------------
  // Electrical signals
  // --------------------
  epsp:   [ 60, 220, 120],   // blue
  ipsp:   [220, 120, 120],   // red
  ap:     [ 60, 220, 120],   // green
  vesicle:[185, 150, 255],   // 🟣 light synaptic purple

  // --------------------
  // Synaptic structure
  // --------------------
  terminalBouton: [120, 220, 140],  // presynaptic
  postSynaptic:   [120, 220, 140],  // matched PSD

  // --------------------
  // Neuron anatomy
  // --------------------
  dendrite: [200, 185, 120],
  soma:     [240, 220, 150],
  axon:     [210, 195, 130]
};

// =====================================================
// COLOR ACCESS HELPER
// =====================================================
function getColor(name, alpha = 255) {
  const c = COLORS[name] || [255, 255, 255];
  return color(c[0], c[1], c[2], alpha);
}
