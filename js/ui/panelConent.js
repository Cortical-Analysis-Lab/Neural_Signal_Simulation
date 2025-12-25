// =====================================================
// MODE-DEPENDENT PANEL CONTENT
// =====================================================
console.log("📘 panelContent.js loaded");

// -----------------------------------------------------
// Public API
// -----------------------------------------------------
window.updateUIPanelContent = updateUIPanelContent;

// -----------------------------------------------------
// Main dispatcher
// -----------------------------------------------------
function updateUIPanelContent() {
  updateInstructionsPanel();
  updateObservationsPanel();
}

// =====================================================
// INSTRUCTIONS PANEL
// =====================================================
function updateInstructionsPanel() {
  const el = document.getElementById("instructions-content");
  if (!el) return;

  switch (state.mode) {

    // =================================================
    // OVERVIEW MODE
    // =================================================
    case "overview":
      el.innerHTML = `
        <h2>Neuron Simulator</h2>

        <p><strong>Synapse types</strong></p>
        <ul>
          <li><span class="exc">Green</span> = excitatory (EPSP)</li>
          <li><span class="inh">Red</span> = inhibitory (IPSP)</li>
        </ul>

        <hr />

        <p><b>Single synapse controls</b></p>
        <ul>
          <li>Hover over a synapse to reveal controls</li>
          <li>➕ / ➖ adjust synaptic strength</li>
          <li>Click a synapse to release neurotransmitter</li>
        </ul>

        <hr />

        <p><b>Group firing</b></p>
        <ul>
          <li>Hold <b>Control</b> and click synapses to select them</li>
          <li>Selected synapses are highlighted</li>
          <li>Press <b>Space</b> to fire all selected synapses together</li>
        </ul>
      `;
      break;

    // =================================================
    // ION VIEW
    // =================================================
    case "ion":
      el.innerHTML = `
        <h2>Ion View</h2>

        <p>
          This view focuses on the ionic basis of membrane potential changes.
        </p>

        <ul>
          <li>Depolarization reflects Na⁺ influx</li>
          <li>Repolarization reflects K⁺ efflux</li>
          <li>After-hyperpolarization stabilizes firing rate</li>
        </ul>

        <p class="hint">
          Action potentials are all-or-none events once threshold is reached.
        </p>
      `;
      break;

    // =================================================
    // SYNAPSE VIEW
    // =================================================
    case "synapse":
      el.innerHTML = `
        <h2>Synapse View</h2>

        <p>
          This view emphasizes chemical synaptic transmission.
        </p>

        <ul>
          <li>Presynaptic boutons release neurotransmitter</li>
          <li>Vesicles diffuse across the synaptic cleft</li>
          <li>Postsynaptic receptors generate PSPs</li>
        </ul>

        <p class="hint">
          Astrocytic endfeet respond to synaptic activity at tripartite synapses.
        </p>
      `;
      break;
  }
}

// =====================================================
// OBSERVATIONS PANEL
// =====================================================
function updateObservationsPanel() {
  const el = document.getElementById("observations-content");
  if (!el) return;

  switch (state.mode) {

    // =================================================
    // OVERVIEW MODE
    // =================================================
    case "overview":
      el.innerHTML = `
        <ul>
          <li>
            Small postsynaptic potentials (PSPs) may decay before reaching the soma,
            especially when synapses are weak or distant.
          </li>

          <li>
            Large or cooperative excitatory PSPs can summate and drive the membrane
            potential toward action potential threshold.
          </li>

          <li>
            Inhibitory PSPs counteract depolarization and can suppress firing.
          </li>

          <li>
            Astrocytes detect neurotransmitter release and respond locally at synapses.
          </li>

          <li>
            Neural firing increases metabolic demand, engaging neurovascular coupling.
          </li>

          <li>
            Blood flow and oxygen delivery are pulsatile and heartbeat-linked.
          </li>

          <li>
            Oxygen and glucose accumulate in the perivascular space before delivery.
          </li>

          <li>
            Transport across the blood–brain barrier is selective and activity-dependent.
          </li>
        </ul>
      `;
      break;

    // =================================================
    // ION VIEW
    // =================================================
    case "ion":
      el.innerHTML = `
        <ul>
          <li>
            Membrane potential reflects the balance of ionic conductances.
          </li>

          <li>
            Threshold crossing initiates rapid Na⁺-driven depolarization.
          </li>

          <li>
            Repolarization and after-hyperpolarization limit firing frequency.
          </li>

          <li>
            Refractory periods prevent immediate reactivation.
          </li>
        </ul>
      `;
      break;

    // =================================================
    // SYNAPSE VIEW
    // =================================================
    case "synapse":
      el.innerHTML = `
        <ul>
          <li>
            Synaptic transmission includes probabilistic vesicle release.
          </li>

          <li>
            Neurotransmitter diffusion introduces temporal delay.
          </li>

          <li>
            PSP amplitude depends on bouton size and synaptic strength.
          </li>

          <li>
            Astrocytic processes target active synaptic clefts.
          </li>
        </ul>
      `;
      break;
  }
}
