import { ref } from 'vue';
import { useVueFlow } from '@vue-flow/core'; // Import useVueFlow
import type { Node, Edge, XYPosition } from '@vue-flow/core';
import { Alg } from 'cubing/alg';

export function useNodeManagement({ addNodes, addEdges, updateNodeData, setNodes }: any) {
  const { screenToFlowCoordinate } = useVueFlow(); // Destructure screenToFlowCoordinate
  const nodeIdCounter = ref(1);

  const getNextNodeId = (): string => {
    const id = nodeIdCounter.value;
    nodeIdCounter.value++;
    return `n-${id}`; 
  };

  const resetNodes = (): Node | null => {
    nodeIdCounter.value = 1; 
    const rootId = getNextNodeId(); 

    setNodes([]);
    const initialRootNode: Node = { 
      id: rootId,
      type: 'twisty',
      position: { x: 0, y: 0 },
      data: { label: 'Solved', alg: '', targetHandleId: 'handle-b', rawAlgorithm: '' },
      style: { borderColor: '#ffffff', borderWidth: '8px', borderStyle: 'solid', borderRadius: '4px' },
    };
    addNodes([initialRootNode]);
    return initialRootNode; 
  };

  const generateAlgTree = (baseAlgString: string, mirrorAlgString: string) => {
    const rootNode = resetNodes();
    if (!rootNode) return;

    const createBranch = (parentNode: Node, edgeAlg: string, offset: XYPosition) => {
      let currentParent = parentNode;
      for (let i = 0; i < 3; i++) {
        const newNodeId = getNextNodeId();
        const newNode: Node = {
          id: newNodeId,
          type: 'twisty',
          position: { x: currentParent.position.x + offset.x, y: currentParent.position.y + offset.y },
          data: { label: edgeAlg, alg: edgeAlg, rawAlgorithm: edgeAlg, targetHandleId: 'handle-b' },
          style: { borderColor: '#ffffff', borderWidth: '8px', borderStyle: 'solid', borderRadius: '4px' },
        };
        addNodes([newNode]);

        // Add an edge connecting the parent node to the new node
        const newEdge: Edge = {
          id: `e${currentParent.id}-${newNodeId}`,
          source: currentParent.id,
          target: newNodeId,
          type: 'special',
          label: edgeAlg,
          data: { algorithm: edgeAlg },
          animated: true,
        };
        addEdges([newEdge]); // Ensure addEdges is called correctly
        currentParent = newNode;
      }
    };

    createBranch(rootNode, baseAlgString, { x: 300, y: 0 });
    createBranch(rootNode, new Alg(baseAlgString).invert().toString(), { x: -300, y: 0 });
    createBranch(rootNode, mirrorAlgString, { x: 0, y: -300 });
  };

  const handleSetTargetHandle = ({ nodeId, newTargetHandleId }: { nodeId: string, newTargetHandleId: string }) => {
    updateNodeData(nodeId, { targetHandleId: newTargetHandleId });
  };

  const onDrop = (event: DragEvent) => {
    const flowPosition = screenToFlowCoordinate({ x: event.clientX, y: event.clientY }); // Use destructured function
    const dragData = event.dataTransfer?.getData('application/json');
    if (dragData) {
      const { algorithm, name, color } = JSON.parse(dragData);
      const newNodeId = getNextNodeId();
      addNodes([{
        id: newNodeId,
        type: 'twisty',
        position: flowPosition,
        data: { label: name, alg: algorithm, rawAlgorithm: algorithm, targetHandleId: 'handle-b' },
        style: { borderColor: color, borderWidth: '8px', borderStyle: 'solid', borderRadius: '4px' },
      }]);
    }
  };

  return { nodeIdCounter, getNextNodeId, resetNodes, generateAlgTree, handleSetTargetHandle, onDrop };
}
