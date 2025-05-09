import { useSavedGraphsStore } from '../stores/savedGraphsStore';
import { useAlgPresetsStore } from '../stores/algPresetsStore';

export function useGraphPersistence({ nodes, edges, setNodes, setEdges, nodeIdCounter }: any) {
  const savedGraphsStore = useSavedGraphsStore();
  const algPresetsStore = useAlgPresetsStore(); // Add algPresetsStore

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
    algPresetsStore.replaceAllPresets(graphState.algPresets || []); // Load algPresets into the store
    savedGraphsStore.saveGraph(graphState.name, graphState.nodes, graphState.edges); // Save to store
  };

  return { handleSaveGraphRequest, handleLoadGraphRequest, handleLoadGraphFromFile };
}
