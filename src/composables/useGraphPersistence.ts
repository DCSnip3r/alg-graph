import { useSavedGraphsStore } from '../stores/savedGraphsStore';

export function useGraphPersistence({ nodes, edges, setNodes, setEdges, nodeIdCounter }: any) {
  const savedGraphsStore = useSavedGraphsStore();

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
    savedGraphsStore.saveGraph(graphState.name, graphState.nodes, graphState.edges); // Save to store
  };

  return { handleSaveGraphRequest, handleLoadGraphRequest, handleLoadGraphFromFile };
}
