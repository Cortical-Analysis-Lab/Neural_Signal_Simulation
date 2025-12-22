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
  epsp:    [ 60, 220, 120],
  ipsp:    [220, 120, 120],
  ap:      [ 60, 220, 120],
  vesicle: [185, 150, 255],

  // --------------------
  // Synaptic structure
  // --------------------
  terminalBouton: [120, 220, 140],
  postSynaptic:   [120, 220, 140],

  // --------------------
  // Neuron anatomy
  // --------------------
  dendrite: [200, 185, 120],
  soma:     [240, 220, 150],
  axon:     [210, 195, 130],

  // --------------------
  // MYELIN SYSTEM (NEW)
  // --------------------
  myelin:        [240, 240, 225], // main sheath (bright, creamy)
  myelinShadow: [210, 210, 195], // subtle depth / underside
  nodeAxon:     [255, 215, 150]  // exposed axon at nodes
};

// =====================================================
// COLOR ACCESS HELPER
// =====================================================
function getColor(name, alpha = 255) {
  const c = COLORS[name] || [255, 255, 255];
  return color(c[0], c[1], c[2], alpha);
}
