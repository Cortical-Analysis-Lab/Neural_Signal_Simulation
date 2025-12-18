// =====================================================
// EPSP / IPSP SIGNAL MODEL
// =====================================================
console.log("epsp loaded");

const epsps = [];

function spawnEPSP(synapse) {
  epsps.push({
    synapseId: synapse.id,
    progress: 0,
    amplitude: synapse.radius,
    baseAmplitude: synapse.radius,
    speed: 0.012,
    decay: 0.995,
    type: synapse.type
  });
}

function updateEPSPs() {
  for (let i = epsps.length - 1; i >= 0; i--) {
    const e = epsps[i];
    e.progress += e.speed;
    e.amplitude *= e.decay;

    if (e.progress >= 1) {
      addEPSPToSoma(e.amplitude, e.type);
      epsps.splice(i, 1);
      continue;
    }

    if (e.amplitude < 0.5) epsps.splice(i, 1);
  }
}

function drawEPSPs() {
  epsps.forEach(e => {
    const syn = neuron.synapses[e.synapseId];
    if (!syn || !syn.path) return;

    const path = syn.path;
    const segs = path.length - 1;
    const t = e.progress * segs;
    const i = floor(t);
    const u = t - i;

    const p0 = path[constrain(i, 0, segs - 1)];
    const p1 = path[constrain(i + 1, 0, segs)];

    const x = lerp(p0.x, p1.x, u);
    const y = lerp(p0.y, p1.y, u);

    const w = map(e.baseAmplitude, 6, 30, 3, 12);

    push();
    stroke(e.type === "exc" ? color(80, 255, 120) : color(255, 80, 80));
    strokeWeight(w);
    point(x, y);
    pop();
  });
}
