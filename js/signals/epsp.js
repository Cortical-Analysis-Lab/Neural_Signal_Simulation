// =====================================================
// EPSP SIGNAL MODEL — PATH-BASED (AUTHORITATIVE)
// =====================================================
console.log("epsp loaded");

// Active EPSPs traveling toward soma
const epsps = [];

// -----------------------------------------------------
// Spawn a new EPSP from a synapse
// -----------------------------------------------------
function spawnEPSP(synapse) {

  if (!synapse.path || synapse.path.length < 2) return;

  epsps.push({
    path: synapse.path,          // FULL path: synapse → soma
    progress: 0,                 // 0 → synapse, 1 → soma
    amplitude: synapse.radius,
    baseAmplitude: synapse.radius,
    speed: 0.012,
    decay: 0.995
  });
}

// -----------------------------------------------------
// Update EPSP propagation + decay
// -----------------------------------------------------
function updateEPSPs() {
  for (let i = epsps.length - 1; i >= 0; i--) {
    const e = epsps[i];

    e.progress += e.speed;
    e.amplitude *= e.decay;

    // Reached soma
    if (e.progress >= 1) {
      addEPSPToSoma(e.amplitude);
      epsps.splice(i, 1);
      continue;
    }

    // Fully decayed
    if (e.amplitude < 0.5) {
      epsps.splice(i, 1);
    }
  }
}

// -----------------------------------------------------
// Draw EPSPs along full dendritic path → soma
// -----------------------------------------------------
function drawEPSPs() {
  epsps.forEach(e => {

    const path = e.path;
    if (!path || path.length < 2) return;

    const segments = path.length - 1;

    // Convert global progress (0–1) to segment index
    const total = e.progress * segments;
    const idx = Math.floor(total);
    const t = total - idx;

    const i0 = constrain(idx, 0, segments - 1);
    const i1 = constrain(idx + 1, 0, segments);

    const p0 = path[i0];
    const p1 = path[i1];

    const x = lerp(p0.x, p1.x, t);
    const y = lerp(p0.y, p1.y, t);

    const w = map(e.baseAmplitude, 6, 30, 3, 12);

    push();
    stroke(80, 150, 255); // EPSP blue
    strokeWeight(w);
    point(x, y);
    pop();
  });
}
