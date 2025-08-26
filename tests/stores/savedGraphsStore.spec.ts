import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useSavedGraphsStore } from '../../src/stores/savedGraphsStore';
import { useDisplaySettingsStore } from '../../src/stores/displaySettingsStore';

describe('useSavedGraphsStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    
    // Mock localStorage
    (globalThis as any).localStorage = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    };
  });

  it('should include display settings when saving a graph', () => {
    const savedGraphsStore = useSavedGraphsStore();
    const displaySettingsStore = useDisplaySettingsStore();
    
    // Set specific display settings
    displaySettingsStore.twistyNodeSize = 300;
    displaySettingsStore.showColorizedEdgeLabels = false;
    
    const nodes = [{ id: 'n-1', type: 'default', position: { x: 0, y: 0 } }];
    const edges = [{ id: 'e-1', source: 'n-1', target: 'n-2' }];
    
    const result = savedGraphsStore.saveGraph('TestGraph', nodes, edges);
    
    expect(result).toBe(true);
    expect((globalThis as any).localStorage.setItem).toHaveBeenCalled();
    
    // Get the call arguments to verify the saved data
    const setItemCalls = (globalThis as any).localStorage.setItem.mock.calls;
    const saveCall = setItemCalls.find((call: any[]) => call[0] === 'vueFlowGraph_TestGraph');
    
    expect(saveCall).toBeDefined();
    
    const savedData = JSON.parse(saveCall[1]);
    expect(savedData.displaySettings).toBeDefined();
    expect(savedData.displaySettings.twistyNodeSize).toBe(300);
    expect(savedData.displaySettings.showColorizedEdgeLabels).toBe(false);
    expect(savedData.name).toBe('TestGraph');
    expect(savedData.nodes).toEqual(nodes);
    expect(savedData.edges).toEqual(edges);
  });

  it('should save current display settings values', () => {
    const savedGraphsStore = useSavedGraphsStore();
    const displaySettingsStore = useDisplaySettingsStore();
    
    // Set different display settings
    displaySettingsStore.twistyNodeSize = 150;
    displaySettingsStore.showColorizedEdgeLabels = true;
    
    savedGraphsStore.saveGraph('TestGraph2', [], []);
    
    const setItemCalls = (globalThis as any).localStorage.setItem.mock.calls;
    const saveCall = setItemCalls.find((call: any[]) => call[0] === 'vueFlowGraph_TestGraph2');
    const savedData = JSON.parse(saveCall[1]);
    
    expect(savedData.displaySettings.twistyNodeSize).toBe(150);
    expect(savedData.displaySettings.showColorizedEdgeLabels).toBe(true);
  });
});