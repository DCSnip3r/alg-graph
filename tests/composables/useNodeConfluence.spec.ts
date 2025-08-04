

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
let displaySettingsMock: any = { repositionOnConfluence: true, matchIfAUF: true };
vi.mock('../../src/stores/displaySettingsStore', () => ({
  useDisplaySettingsStore: vi.fn(() => displaySettingsMock)
}));
import { useDisplaySettingsStore } from '../../src/stores/displaySettingsStore';
import { useNodeConfluence } from '../../src/composables/useNodeConfluence';
import { useAlg } from '../../src/composables/useAlg';

describe('useNodeConfluence', () => {
  let updateNodePosition: any;
  let findNode: any;
  let nodes: any[];
  let checkAndRepositionNode: any;
  let displaySettings: any;

  beforeEach(() => {
    setActivePinia(createPinia());
    displaySettingsMock.repositionOnConfluence = true;
    displaySettings = useDisplaySettingsStore();

    nodes = [
      { id: 'n-1', data: { alg: "R U R' U'" }, position: { x: 100, y: 200 } },
      { id: 'n-2', data: { alg: "F R U' R' U' R U R' F'" }, position: { x: 300, y: 400 } }
    ];
    updateNodePosition = vi.fn();
    findNode = vi.fn((id) => nodes.find(n => n.id === id));
    const composable = useNodeConfluence({ findNode, updateNodePosition });
    checkAndRepositionNode = composable.checkAndRepositionNode;
  });

  it('repositions node to first confluent match when setting is enabled', async () => {
    const newNode = { id: 'n-3', data: { alg: "F R U' R' U' R U R' F'" }, position: { x: 0, y: 0 } };
    nodes.push(newNode);
    await checkAndRepositionNode('n-3', nodes);
    expect(updateNodePosition).toHaveBeenCalledWith('n-3', { x: 300, y: 400 });
  });

  it('does not reposition if no confluent match', async () => {
    const newNode = { id: 'n-3', data: { alg: "U2 F2" }, position: { x: 0, y: 0 } };
    nodes.push(newNode);
    await checkAndRepositionNode('n-3', nodes);
    expect(updateNodePosition).not.toHaveBeenCalled();
  });

  it('does not reposition if setting is disabled', async () => {
    displaySettings.repositionOnConfluence = false;
    const newNode = { id: 'n-3', data: { alg: "F R U' R' U' R U R' F'" }, position: { x: 0, y: 0 } };
    nodes.push(newNode);
    await checkAndRepositionNode('n-3', nodes);
    expect(updateNodePosition).not.toHaveBeenCalled();
  });
  
  it('should detect AUF confluence between two algorithms', async () => {
    // This test checks the confluence logic using the real implementation
    const algA = "R U R' U R U2' R' U2 R U R' U R U2' R'";
    const algB = "R U2 R' U' R U' R'";
    const { isConfluent } = useAlg();
    const result = await isConfluent(algB, algA);
    expect(result === true || typeof result === "string").toBe(true); // Accepts true or AUF string
  });
});
