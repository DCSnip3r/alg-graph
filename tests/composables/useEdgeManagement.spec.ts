import { describe, it, expect, vi } from 'vitest';
import { useEdgeManagement } from '../../src/composables/useEdgeManagement';

describe('useEdgeManagement', () => {
  const mockEdges = { value: [] };
  const mockFindNode = vi.fn();
  const mockUpdateNodeData = vi.fn();

  const { handleEdgeAlgorithmUpdate } = useEdgeManagement({
    edges: mockEdges,
    findNode: mockFindNode,
    updateNodeData: mockUpdateNodeData,
  });

  it('should update edge algorithm and propagate changes to target node', () => {
    mockEdges.value = [{ id: 'e1', source: 'n1', target: 'n2', data: {}, label: '' }];
    mockFindNode.mockImplementation((id) => ({ id, data: { alg: '' } }));

    handleEdgeAlgorithmUpdate({ edgeId: 'e1', newAlgorithm: 'R U R\'' });
    expect(mockEdges.value[0].data.algorithm).toBe('R U R\'');
    expect(mockUpdateNodeData).toHaveBeenCalled();
  });
});
