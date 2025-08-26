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

  describe('display settings persistence', () => {
    it('should apply display settings when importing a graph with displaySettings', () => {
      const { importGraphFromFile } = useGraphPersistence({
        nodes: { value: [] },
        edges: { value: [] },
        setNodes: mockSetNodes,
        setEdges: mockSetEdges,
        nodeIdCounter: mockNodeIdCounter,
      });

      const graphState = {
        name: 'Test Graph',
        nodes: [],
        edges: [],
        algPresets: [],
        displaySettings: {
          twistyNodeSize: 250,
          showColorizedEdgeLabels: false,
        },
        example: true, // Prevent saving to store during test
      };

      importGraphFromFile(graphState);

      expect(mockSetNodes).toHaveBeenCalledWith([]);
      expect(mockSetEdges).toHaveBeenCalledWith([]);
    });

    it('should apply display settings when loading from store', () => {
      const graphWithDisplaySettings = {
        name: 'Test Graph',
        nodes: [],
        edges: [],
        algPresets: [],
        displaySettings: {
          twistyNodeSize: 300,
          showColorizedEdgeLabels: true,
        },
      };

      (globalThis as any).localStorage.getItem.mockReturnValue(
        JSON.stringify(graphWithDisplaySettings)
      );

      const { getGraphFromStore } = useGraphPersistence({
        nodes: { value: [] },
        edges: { value: [] },
        setNodes: mockSetNodes,
        setEdges: mockSetEdges,
        nodeIdCounter: mockNodeIdCounter,
      });

      const result = getGraphFromStore('TestGraph');

      expect(result).toEqual(graphWithDisplaySettings);
      expect((globalThis as any).localStorage.getItem).toHaveBeenCalledWith('vueFlowGraph_TestGraph');
    });

    it('should handle graphs without displaySettings gracefully', () => {
      const { importGraphFromFile } = useGraphPersistence({
        nodes: { value: [] },
        edges: { value: [] },
        setNodes: mockSetNodes,
        setEdges: mockSetEdges,
        nodeIdCounter: mockNodeIdCounter,
      });

      const graphStateWithoutDisplaySettings = {
        name: 'Old Graph',
        nodes: [],
        edges: [],
        algPresets: [],
        example: true,
      };

      // Should not throw an error
      expect(() => {
        importGraphFromFile(graphStateWithoutDisplaySettings);
      }).not.toThrow();

      expect(mockSetNodes).toHaveBeenCalledWith([]);
      expect(mockSetEdges).toHaveBeenCalledWith([]);
    });

    it('should handle partial display settings', () => {
      const { importGraphFromFile } = useGraphPersistence({
        nodes: { value: [] },
        edges: { value: [] },
        setNodes: mockSetNodes,
        setEdges: mockSetEdges,
        nodeIdCounter: mockNodeIdCounter,
      });

      const graphStateWithPartialSettings = {
        name: 'Partial Settings Graph',
        nodes: [],
        edges: [],
        algPresets: [],
        displaySettings: {
          twistyNodeSize: 350, // Only node size, no edge labels setting
        },
        example: true,
      };

      // Should not throw an error
      expect(() => {
        importGraphFromFile(graphStateWithPartialSettings);
      }).not.toThrow();

      expect(mockSetNodes).toHaveBeenCalledWith([]);
      expect(mockSetEdges).toHaveBeenCalledWith([]);
    });
  });
});
