# Submenu Components

Focused panels nested in `MenuOverlay.vue`.

* `AlgorithmsSubmenu.vue` – Manage algorithm presets & generation utilities.
* `DisplaySettingsSubmenu.vue` – User toggles affecting graph display / confluence interpretation.
* `GraphSavingSubmenu.vue` – Save, load, import/export, example graph loading UI. Bridges to `useGraphManagement` and persistence composables.

Design Notes:
* Each submenu should emit clear, intention-based events (e.g., `save-graph-request`) rather than calling stores directly.
* Maintain minimal internal state (temporary form inputs); offload durable state to stores.
 * Display settings now include:
	 * `showColorizedEdgeLabels` – color background of edge labels.
	 * `repositionOnConfluence` – move node onto existing confluent node position.
	 * `matchIfAUF` – consider AUF (U / U' / U2) variants in confluence detection.
	 * `createConfluenceEdges` – create dashed informational edges linking to confluent nodes.
