export function useDragAndDrop(
  screenToFlowCoordinate?: Function,
  addNodes?: Function,
  getNextNodeId?: Function
) {
  const onDragStart = (event: DragEvent, dragData: any) => {
    if (event.dataTransfer) {
      event.dataTransfer.setData('application/json', JSON.stringify(dragData));
      event.dataTransfer.effectAllowed = 'copy';
    }
  };

  const onDrop = (event: DragEvent) => {
    if (!screenToFlowCoordinate || !addNodes || !getNextNodeId) {
      console.warn('onDrop requires screenToFlowCoordinate, addNodes, and getNextNodeId to be provided.');
      return;
    }
    const flowPosition = screenToFlowCoordinate({ x: event.clientX, y: event.clientY });
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

  const onDragOver = (event: DragEvent) => {
    event.preventDefault();
  };

  return {
    onDragStart,
    onDrop,
    onDragOver,
  };
}
