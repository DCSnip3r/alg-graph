# Shared Components

Reusable low-level UI pieces.

Current files:
* `CollapsibleHeader.vue` – Generic collapsible section header. Works with `useCollapsible` composable for state.

Guidelines:
* Keep generic—no domain coupling (no cube-specific code).
* If domain knowledge creeps in, relocate logic to a higher-level component or composable.
