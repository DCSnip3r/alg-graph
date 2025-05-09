import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useSavedGraphsStore } from '../../src/stores/savedGraphsStore';
import { useGraphManagement } from '../../src/composables/useGraphManagement';

describe('useGraphManagement', () => {
  let mockEmit: any;

  beforeEach(() => {
    setActivePinia(createPinia());
    mockEmit = vi.fn();

    // Mock localStorage
    global.localStorage = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    };

    // Mock alert
    global.alert = vi.fn();
  });

  it('should emit save-graph-request with a valid name', () => {
    const { handleSaveGraph, graphNameToSave } = useGraphManagement(mockEmit);
    graphNameToSave.value = 'TestGraph'; // Set the graph name directly
    handleSaveGraph();
    expect(mockEmit).toHaveBeenCalledWith('save-graph-request', 'TestGraph');
  });

  it('should show an alert if the graph name is empty', () => {
    const { handleSaveGraph } = useGraphManagement(mockEmit);
    handleSaveGraph('');
    expect(global.alert).toHaveBeenCalledWith('Please enter a name for the graph to save.');
  });

  it('should emit load-graph-request with graph data', () => {
    global.localStorage.getItem.mockReturnValue(
      JSON.stringify({ nodes: [], edges: [] })
    );

    const { handleLoadGraph } = useGraphManagement(mockEmit);
    const savedGraphsStore = useSavedGraphsStore();
    savedGraphsStore.$patch({
      graphs: { TestGraph: { nodes: [], edges: [] } },
    });

    handleLoadGraph('TestGraph');
    expect(mockEmit).toHaveBeenCalledWith('load-graph-request', { nodes: [], edges: [] });
  });

  it('should show an alert if loading a graph fails', () => {
    global.localStorage.getItem.mockReturnValue(null);

    const { handleLoadGraph } = useGraphManagement(mockEmit);
    handleLoadGraph('NonExistentGraph');
    expect(global.alert).toHaveBeenCalledWith('Failed to load graph: NonExistentGraph');
  });
});
