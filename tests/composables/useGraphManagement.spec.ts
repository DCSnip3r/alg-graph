import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useGraphManagement } from '../../src/composables/useGraphManagement';

describe('useGraphManagement', () => {
  let mockEmit: any;

  beforeEach(() => {
    setActivePinia(createPinia());
    mockEmit = vi.fn();

  // Mock localStorage (use globalThis for TS/Node compatibility)
  (globalThis as any).localStorage = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    };

  // Mock alert
  ;(globalThis as any).alert = vi.fn();
  });

  it('should emit save-graph-request with a valid name', () => {
    const { handleSaveGraph, graphNameToSave } = useGraphManagement(mockEmit);
    graphNameToSave.value = 'TestGraph'; // Set the graph name directly
    handleSaveGraph();
    expect(mockEmit).toHaveBeenCalledWith('save-graph-request', 'TestGraph');
  });

  it('should show an alert if the graph name is empty', () => {
    const { handleSaveGraph, graphNameToSave } = useGraphManagement(mockEmit);
    graphNameToSave.value = '';
    handleSaveGraph();
    expect((globalThis as any).alert).toHaveBeenCalledWith('Please enter a name for the graph to save.');
  });

  it('should emit load-graph-request with graph data', () => {
  (globalThis as any).localStorage.getItem.mockReturnValue(
      JSON.stringify({ nodes: [], edges: [] })
    );

    const { handleLoadGraph } = useGraphManagement(mockEmit);
  // No need to patch store; presence in localStorage is enough for persistence layer

    handleLoadGraph('TestGraph');
    expect(mockEmit).toHaveBeenCalledWith('load-graph-request', { nodes: [], edges: [] });
  });

  it('should show an alert if loading a graph fails', () => {
  (globalThis as any).localStorage.getItem.mockReturnValue(null);

    const { handleLoadGraph } = useGraphManagement(mockEmit);
    handleLoadGraph('NonExistentGraph');
  expect((globalThis as any).alert).toHaveBeenCalledWith('Failed to load graph: NonExistentGraph');
  });
});
