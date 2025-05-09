import { useSavedGraphsStore } from '../stores/savedGraphsStore';
import { useAlgPresetsStore } from '../stores/algPresetsStore';

export function useGraphPersistence({ nodes, edges, setNodes, setEdges, nodeIdCounter }: any) {
  const savedGraphsStore = useSavedGraphsStore();
  const algPresetsStore = useAlgPresetsStore();

  const handleSaveGraphRequest = (graphName: string) => {
    savedGraphsStore.saveGraph(graphName, nodes.value, edges.value);
  };

  const handleLoadGraphRequest = (loadedData: { nodes: any[], edges: any[] }) => {
    setNodes(loadedData.nodes);
    setEdges(loadedData.edges);

    let maxId = 0;
    loadedData.nodes.forEach(node => {
      const idParts = node.id.split('-');
      const idNum = parseInt(idParts[1]);
      if (!isNaN(idNum) && idNum > maxId) maxId = idNum;
    });
    nodeIdCounter.value = maxId + 1;
  };

  const handleLoadGraphFromFile = (graphState: any) => {
    setNodes(graphState.nodes);
    setEdges(graphState.edges);
    algPresetsStore.replaceAllPresets(graphState.algPresets || []);
    savedGraphsStore.saveGraph(graphState.name, graphState.nodes, graphState.edges);
  };

  const loadGraph = (name: string) => {
    const graphJSON = localStorage.getItem(`vueFlowGraph_${name}`);
    if (graphJSON) {
      try {
        const graphState = JSON.parse(graphJSON);
        algPresetsStore.replaceAllPresets(graphState.algPresets || []);
        return graphState;
      } catch (e) {
        console.error("Error parsing saved graph data:", e);
        return null;
      }
    }
    return null;
  };

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
    handleSaveGraphRequest,
    handleLoadGraphRequest,
    handleLoadGraphFromFile,
    loadGraph,
    getGraphForExport,
  };
}
