console.log("🎨 colors loaded");

// =====================================================
// CENTRAL COLOR PALETTE (DATA ONLY)
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
  // Myelin system
  // --------------------
  myelin:        [240, 240, 225],
  myelinShadow: [210, 210, 195],
  nodeAxon:     [255, 215, 150],

  // =====================================================
  // VASCULATURE
  // =====================================================
  arteryWall:      [165,  70,  60],
  arteryHighlight: [220, 120, 100],

  // --------------------
  // BLOOD CONTENTS
  // --------------------
  rbcOxy:   [190,  40,  40],
  rbcDeoxy: [ 60, 100, 200],
  oxygen:   [255, 255, 255],
  water:    [160, 210, 255],
  glucose:  [120, 220, 120],

  // =====================================================
  // BLOOD–BRAIN BARRIER
  // =====================================================
  endothelium: [245, 190, 130], // light orange
  astrocyte:   [200, 170, 230]  // light purple
};

// =====================================================
// COLOR ACCESS HELPER (GLOBAL)
// =====================================================
function getColor(name, alpha = 255) {
  const c = COLORS[name];

  if (!c) {
    console.warn(`⚠️ Color "${name}" not found`);
    return color(255, 255, 255, alpha);
  }

  return color(c[0], c[1], c[2], alpha);
}

// -----------------------------------------------------
// GLOBAL EXPORTS
// -----------------------------------------------------
window.COLORS  = COLORS;
window.getColor = getColor;
