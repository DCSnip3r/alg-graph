import { describe, it, expect, vi } from 'vitest';
import { beforeEach } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useEdgeManagement } from '../../src/composables/useEdgeManagement';

describe('useEdgeManagement', () => {
  let mockEdges: { value: any[] };
  let mockFindNode: any;
  let mockUpdateNodeData: any;
  let mockNodes: { value: any[] };
  let mockUpdateNodePosition: any;
  let handleEdgeAlgorithmUpdate: any;

  beforeEach(() => {
    setActivePinia(createPinia());
    mockEdges = { value: [] };
    mockFindNode = vi.fn();
    mockUpdateNodeData = vi.fn();
    mockNodes = { value: [] };
    mockUpdateNodePosition = vi.fn();
    const composable = useEdgeManagement({
      edges: mockEdges,
      nodes: mockNodes,
      findNode: mockFindNode,
      updateNodeData: mockUpdateNodeData,
      updateNodePosition: mockUpdateNodePosition,
    });
    handleEdgeAlgorithmUpdate = composable.handleEdgeAlgorithmUpdate;
  });

  it('should update edge algorithm and propagate changes to target node', () => {
    mockEdges.value = [{ id: 'e1', source: 'n1', target: 'n2', data: {}, label: '' }];
    mockFindNode.mockImplementation((id: any) => ({ id, data: { alg: '' } }));

    handleEdgeAlgorithmUpdate({ edgeId: 'e1', newAlgorithm: 'R U R\'' });
    expect(mockEdges.value[0].data.algorithm).toBe('R U R\'');
    expect(mockUpdateNodeData).toHaveBeenCalled();
  });
});
