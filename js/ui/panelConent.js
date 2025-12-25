// =====================================================
// UI PANEL CONTENT CONTROLLER
// =====================================================
// • Mode-dependent Instructions + Observations
// • Pure UI logic (no simulation coupling)
// • Called by main.js → updateUIPanelContent()
// =====================================================

console.log("📋 panelContent loaded");

// -----------------------------------------------------
// PANEL CONTENT DEFINITIONS
// -----------------------------------------------------

const PANEL_CONTENT = {

  overview: {
    instructions: `
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
        <li>Press <b>Space</b> to fire selected synapses together</li>
      </ul>
    `,

    observations: `
      <ul>
        <li>Postsynaptic potentials may decay before reaching the soma.</li>
        <li>Excitatory and inhibitory inputs compete dynamically.</li>
        <li>Astrocytes respond to synaptic activity.</li>
        <li>Neural firing increases metabolic demand.</li>
        <li>Blood flow and oxygen delivery are activity-dependent.</li>
      </ul>
    `
  },

  ion: {
    instructions: `
      <h2>Ion View</h2>

      <p>This mode focuses on <b>membrane potential</b> and ionic dynamics.</p>

      <ul>
        <li>Observe depolarization and repolarization phases</li>
        <li>Threshold crossing triggers an action potential</li>
        <li>After-hyperpolarization follows firing</li>
      </ul>

      <hr />

      <p><b>Teaching note</b></p>
      <p>
        This view abstracts ion channels but preserves
        their functional roles (Na⁺ influx, K⁺ efflux).
      </p>
    `,

    observations: `
      <ul>
        <li>EPSPs sum to move the membrane toward threshold.</li>
        <li>IPSPs counteract depolarization.</li>
        <li>Action potentials are all-or-none events.</li>
        <li>Refractory periods limit firing frequency.</li>
      </ul>
    `
  },

  synapse: {
    instructions: `
      <h2>Synapse View</h2>

      <p>This mode emphasizes <b>chemical synaptic transmission</b>.</p>

      <ul>
        <li>Action potentials trigger vesicle release</li>
        <li>Neurotransmitter diffuses across the cleft</li>
        <li>Postsynaptic receptors generate PSPs</li>
      </ul>

      <hr />

      <p><b>Astrocytes</b></p>
      <ul>
        <li>Sense synaptic activity</li>
        <li>Respond to neurotransmitter spillover</li>
      </ul>
    `,

    observations: `
      <ul>
        <li>Release is probabilistic, not guaranteed.</li>
        <li>Vesicle bursts are brief and localized.</li>
        <li>Astrocytes integrate activity across synapses.</li>
        <li>Synapses are the primary sites of plasticity.</li>
      </ul>
    `
  }

};

// -----------------------------------------------------
// PUBLIC UPDATE FUNCTION
// -----------------------------------------------------

function updateUIPanelContent() {
  if (!window.state) return;

  const mode = state.mode || "overview";
  const content = PANEL_CONTENT[mode] || PANEL_CONTENT.overview;

  const instructionsEl  = document.getElementById("instructions-content");
  const observationsEl = document.getElementById("observations-content");

  if (instructionsEl) {
    instructionsEl.innerHTML = content.instructions;
  }

  if (observationsEl) {
    observationsEl.innerHTML = content.observations;
  }
}

// -----------------------------------------------------
// EXPORT (GLOBAL)
// -----------------------------------------------------

window.updateUIPanelContent = updateUIPanelContent;
