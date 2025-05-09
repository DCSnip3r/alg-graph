import { describe, it, expect, vi } from 'vitest';
import { useNodeManagement } from '../../src/composables/useNodeManagement';

describe('useNodeManagement', () => {
  const mockAddNodes = vi.fn();
  const mockAddEdges = vi.fn();
  const mockUpdateNodeData = vi.fn();
  const mockSetNodes = vi.fn();

  const { getNextNodeId, resetNodes, generateAlgTree } = useNodeManagement({
    addNodes: mockAddNodes,
    addEdges: mockAddEdges,
    updateNodeData: mockUpdateNodeData,
    setNodes: mockSetNodes,
  });

  it('should generate unique node IDs', () => {
    const id1 = getNextNodeId();
    const id2 = getNextNodeId();
    expect(id1).not.toBe(id2);
  });

  it('should reset nodes and create a root node', () => {
    const rootNode = resetNodes();
    expect(rootNode).toBeTruthy();
    expect(mockSetNodes).toHaveBeenCalledWith([]);
    expect(mockAddNodes).toHaveBeenCalledWith([expect.objectContaining({ id: rootNode?.id })]);
  });

  it('should generate an algorithm tree', () => {
    resetNodes();
    generateAlgTree('R U R\'', 'R\' U\' R');
    expect(mockAddNodes).toHaveBeenCalled();
    expect(mockAddEdges).toHaveBeenCalled();
  });
});
