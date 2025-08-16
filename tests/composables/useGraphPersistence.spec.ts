import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useGraphPersistence } from '../../src/composables/useGraphPersistence';

describe('useGraphPersistence', () => {
  let mockSetNodes: any;
  let mockSetEdges: any;
  let mockNodeIdCounter: any;

  beforeEach(() => {
    setActivePinia(createPinia());
    mockSetNodes = vi.fn();
    mockSetEdges = vi.fn();
    mockNodeIdCounter = { value: 1 };

  // Mock localStorage using globalThis for TS compatibility
  (globalThis as any).localStorage = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    };
  });

  it('should save a graph', () => {
    const { saveGraphToStore } = useGraphPersistence({
      nodes: { value: [] },
      edges: { value: [] },
      setNodes: mockSetNodes,
      setEdges: mockSetEdges,
      nodeIdCounter: mockNodeIdCounter,
    });

    saveGraphToStore('TestGraph');
  expect((globalThis as any).localStorage.setItem).toHaveBeenCalled();
  });

  it('should load a graph and update nodeIdCounter', () => {
  (globalThis as any).localStorage.getItem.mockReturnValue(
      JSON.stringify({ nodes: [{ id: 'n-1' }, { id: 'n-2' }], edges: [] })
    );

    const { applyGraphState } = useGraphPersistence({
      nodes: { value: [] },
      edges: { value: [] },
      setNodes: mockSetNodes,
      setEdges: mockSetEdges,
      nodeIdCounter: mockNodeIdCounter,
    });

    applyGraphState({
      nodes: [{ id: 'n-1' }, { id: 'n-2' }],
      edges: [],
    });

    expect(mockSetNodes).toHaveBeenCalledWith([{ id: 'n-1' }, { id: 'n-2' }]);
    expect(mockSetEdges).toHaveBeenCalledWith([]);
    expect(mockNodeIdCounter.value).toBe(3);
  });
});
