import { useSavedGraphsStore } from '../stores/savedGraphsStore';
import { useAlgPresetsStore } from '../stores/algPresetsStore';
import { useDisplaySettingsStore } from '../stores/displaySettingsStore';

// Only handles pure data logic, no UI events or file dialogs
export function useGraphPersistence({ nodes, edges, setNodes, setEdges, nodeIdCounter }: any) {
  const savedGraphsStore = useSavedGraphsStore();
  const algPresetsStore = useAlgPresetsStore();
  const displaySettingsStore = useDisplaySettingsStore();

  // Save current graph state to store
  const saveGraphToStore = (graphName: string) => {
    return savedGraphsStore.saveGraph(graphName, nodes.value, edges.value);
  };

  // Load graph state from store and update local state
  const applyGraphState = (graphData: { nodes: any[], edges: any[] }) => {
    setNodes(graphData.nodes);
    setEdges(graphData.edges);

    let maxId = 0;
    graphData.nodes.forEach(node => {
      const idParts = node.id.split('-');
      const idNum = parseInt(idParts[1]);
      if (!isNaN(idNum) && idNum > maxId) maxId = idNum;
    });
    nodeIdCounter.value = maxId + 1;
  };

  // Helper function to apply display settings from saved graph
  const applyDisplaySettings = (graphState: any) => {
    if (graphState.displaySettings) {
      // Iterate over each setting in the saved display settings
      Object.entries(graphState.displaySettings).forEach(([key, value]) => {
        // Only apply if the setting exists in the store and the value is defined
        if (key in displaySettingsStore && value !== undefined) {
          (displaySettingsStore as any)[key] = value;
        }
      });
    }
  };

  // Import a graph from a file (parsed object)
  const importGraphFromFile = (graphState: any) => {
    setNodes(graphState.nodes);
    setEdges(graphState.edges);
    algPresetsStore.replaceAllPresets(graphState.algPresets || []);
    applyDisplaySettings(graphState);
    if (graphState.example){return}
    savedGraphsStore.saveGraph(graphState.name, graphState.nodes, graphState.edges);
  };

  // Get a graph state object from store by name
  const getGraphFromStore = (name: string) => {
    const graphJSON = localStorage.getItem(`vueFlowGraph_${name}`);
    if (graphJSON) {
      try {
        const graphState = JSON.parse(graphJSON);
        algPresetsStore.replaceAllPresets(graphState.algPresets || []);
        applyDisplaySettings(graphState);
        return graphState;
      } catch (e) {
        console.error("Error parsing saved graph data:", e);
        return null;
      }
    }
    return null;
  };

  // Get a graph state for export (download)
  const getGraphForExport = (name: string) => {
    const graphJSON = localStorage.getItem(`vueFlowGraph_${name}`);
    if (graphJSON) {
      try {
        return JSON.parse(graphJSON);
      } catch (e) {
        console.error("Error parsing saved graph data for export:", e);
        return null;
      }
    }
    return null;
  };

  return {
    saveGraphToStore,
    applyGraphState,
    importGraphFromFile,
    getGraphFromStore,
    getGraphForExport,
  };
}
