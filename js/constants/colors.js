const COLORS = {

  console.log("🎨 colors loaded");

  // Ions
  sodium:    [255, 215, 0],
  potassium: [220, 60, 60],

  // Electrical signals
  epsp:      [80, 150, 255],
  ipsp:      [220, 120, 120],
  ap:        [80, 150, 255],
  vesicle:    [185, 150, 255]    // 🟣 light synaptic purple
    
  // Synaptic structure
  terminalBouton: [120, 220, 140],  // presynaptic
  postSynaptic:   [120, 220, 140],  // matched PSD

  // Neuron anatomy
  dendrite:  [200, 185, 120],
  soma:      [240, 220, 150],
  axon:      [210, 195, 130]
};


function getColor(name, alpha = 255) {
  const c = COLORS[name] || [255, 255, 255];
  return color(c[0], c[1], c[2], alpha);
}
