// =====================================================
// EXTRACELLULAR IONS — Na⁺ / K⁺ (ECS + AXON)
// Teaching-first, artery-excluded ECS (AUTHORITATIVE)
// =====================================================
console.log("🧂 extracellularIons loaded");

// -----------------------------------------------------
// GLOBAL STORAGE
// -----------------------------------------------------
window.ecsIons = {
  Na: [], K: [],
  NaFlux: [], KFlux: [],
  AxonNaStatic: [], AxonKStatic: [],
  AxonNaInward: []   // transient Na⁺ influx copies
};

// -----------------------------------------------------
// COUNTS
// -----------------------------------------------------
const ECS_ION_COUNTS = { Na: 260, K: 160 };
const AXON_STATIC_NA_COUNT = 8;
const AXON_STATIC_K_COUNT  = 4;

// -----------------------------------------------------
// HALO GEOMETRY
// -----------------------------------------------------
const AXON_HALO_RADIUS    = 16;
const AXON_HALO_THICKNESS = 4;

// -----------------------------------------------------
// AP → HALO COUPLING
// -----------------------------------------------------
const HALO_AP_RADIUS = 28;

// Motion strengths (BIOLOGICALLY CORRECT)
const HALO_NA_PERTURB = 0.06;   // Na⁺ barely moves (channels open)
const HALO_K_PUSH     = 1.9;    // K⁺ strongly expelled

// Relaxation
const HALO_NA_RELAX = 0.95;
const HALO_K_RELAX  = 0.78;

// Na⁺ influx copies (fast, brief)
const AXON_NA_IN_SPEED = 4.2;
const AXON_NA_IN_LIFE  = 16;

// -----------------------------------------------------
// VISUALS
// -----------------------------------------------------
const ION_TEXT_SIZE = { Na: 10, K: 11 };

const ION_COLOR = {
  Na: [245, 215, 90],
  K:  [255, 140, 190]
};

// -----------------------------------------------------
// SOMA PARAMETERS (UNCHANGED)
// -----------------------------------------------------
const NA_FLUX_SPEED     = 0.9;
const NA_FLUX_LIFETIME  = 80;
const NA_SPAWN_RADIUS   = 140;

const K_FLUX_SPEED      = 2.2;
const K_FLUX_LIFETIME   = 160;
const K_SPAWN_RADIUS    = 28;
const ION_VEL_DECAY     = 0.965;

// =====================================================
// INITIALIZATION
// =====================================================
function initExtracellularIons() {

  Object.values(ecsIons).forEach(arr => arr.length = 0);

  // ------------------
  // ECS baseline
  // ------------------
  const b = {
    xmin: -width * 0.9,
    xmax:  width * 0.9,
    ymin: -height * 0.9,
    ymax:  height * 0.9
  };

  function spawnECSIon(type) {
    ecsIons[type].push({
      x: random(b.xmin, b.xmax),
      y: random(b.ymin, b.ymax),
      phase: random(TWO_PI)
    });
  }

  for (let i = 0; i < ECS_ION_COUNTS.Na; i++) spawnECSIon("Na");
  for (let i = 0; i < ECS_ION_COUNTS.K;  i++) spawnECSIon("K");

  // ------------------
  // AXON STATIC HALO
  // ------------------
  if (neuron?.axon?.path) {

    function spawnHalo(type, count) {
      const path = neuron.axon.path;

      for (let i = 0; i < count; i++) {

        const t   = i / count;
        const idx = floor(t * (path.length - 2));

        const p1 = path[idx];
        const p2 = path[idx + 1];

        const tx = p2.x - p1.x;
        const ty = p2.y - p1.y;
        const len = Math.hypot(tx, ty) || 1;

        const nx = -ty / len;
        const ny =  tx / len;
        const side = i % 2 === 0 ? 1 : -1;

        const r = random(
          AXON_HALO_RADIUS,
          AXON_HALO_RADIUS + AXON_HALO_THICKNESS
        );

        const x0 = p1.x + nx * r * side;
        const y0 = p1.y + ny * r * side;

        ecsIons[type].push({
          x: x0, y: y0,
          x0, y0,
          vx: 0, vy: 0,
          lastAPPhase: -Infinity
        });
      }
    }

    spawnHalo("AxonNaStatic", AXON_STATIC_NA_COUNT);
    spawnHalo("AxonKStatic",  AXON_STATIC_K_COUNT);
  }
}

// =====================================================
// DRAWING
// =====================================================
function drawExtracellularIons() {
  push();
  textAlign(CENTER, CENTER);
  noStroke();

  // ------------------
  // ECS baseline
  // ------------------
  fill(...ION_COLOR.Na, 120);
  textSize(ION_TEXT_SIZE.Na);
  ecsIons.Na.forEach(p => text("Na⁺", p.x, p.y));

  fill(...ION_COLOR.K, 130);
  textSize(ION_TEXT_SIZE.K);
  ecsIons.K.forEach(p => text("K⁺", p.x, p.y));

  // ------------------
  // AP position
  // ------------------
  const apPhase = window.currentAxonAPPhase;
  const apPos =
    (apPhase != null && neuron?.axon?.path)
      ? neuron.axon.path[
          floor(apPhase * (neuron.axon.path.length - 1))
        ]
      : null;

  // ------------------
  // Na⁺ HALO (INWARD — CORRECT)
  // ------------------
  fill(...ION_COLOR.Na, 150);
  ecsIons.AxonNaStatic.forEach(p => {

    if (apPos) {
      const dx = p.x0 - apPos.x;
      const dy = p.y0 - apPos.y;
      const d  = Math.hypot(dx, dy);

      if (d < HALO_AP_RADIUS && abs(apPhase - p.lastAPPhase) > 0.05) {

        // inward direction = toward rest position
        const ix = p.x0 - p.x;
        const iy = p.y0 - p.y;
        const im = Math.hypot(ix, iy) || 1;

        p.vx += (ix / im) * HALO_NA_PERTURB;
        p.vy += (iy / im) * HALO_NA_PERTURB;

        // fast Na⁺ influx copy
        ecsIons.AxonNaInward.push({
          x: p.x,
          y: p.y,
          vx: (ix / im) * AXON_NA_IN_SPEED,
          vy: (iy / im) * AXON_NA_IN_SPEED,
          life: AXON_NA_IN_LIFE
        });

        p.lastAPPhase = apPhase;
      }
    }

    // strong tether
    p.vx += (p.x0 - p.x) * 0.05;
    p.vy += (p.y0 - p.y) * 0.05;

    p.vx *= HALO_NA_RELAX;
    p.vy *= HALO_NA_RELAX;

    p.x += p.vx;
    p.y += p.vy;

    text("Na⁺", p.x, p.y);
  });

  // ------------------
  // Na⁺ inward copies
  // ------------------
  ecsIons.AxonNaInward = ecsIons.AxonNaInward.filter(p => {
    p.life--;
    p.x += p.vx;
    p.y += p.vy;
    text("Na⁺", p.x, p.y);
    return p.life > 0;
  });

  // ------------------
  // K⁺ HALO (OUTWARD — CORRECT)
  // ------------------
  fill(...ION_COLOR.K, 150);
  ecsIons.AxonKStatic.forEach(p => {

    if (apPos) {
      const ox = p.x - p.x0;
      const oy = p.y - p.y0;
      const om = Math.hypot(ox, oy) || 1;

      p.vx += (ox / om) * HALO_K_PUSH;
      p.vy += (oy / om) * HALO_K_PUSH;
    }

    // weak tether → plume persists
    p.vx += (p.x0 - p.x) * 0.006;
    p.vy += (p.y0 - p.y) * 0.006;

    p.vx *= HALO_K_RELAX;
    p.vy *= HALO_K_RELAX;

    p.x += p.vx;
    p.y += p.vy;

    text("K⁺", p.x, p.y);
  });

  pop();
}
