

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
    const { isConfluent } = useAlg();
    // This test checks the confluence logic using the real implementation
    const algA = "R U R' U R U2' R' U2 R U R' U R U2' R'";
    const algB = "R U2 R' U' R U' R'";
    const result = await isConfluent(algA, algB);
    expect(result === true || typeof result === "string").toBe(true); // Accepts true or AUF string

    const algC = "R U R' U R U2' R' U' R U R' U R U2' R'"
    const algD = "R U2 R' U' R U' R' U R U2 R' U' R U' R'";
    const result2 = await isConfluent(algC, algD);
    expect(result2 === true || typeof result2 === "string").toBe(true); // Accepts true or AUF string

    // Check U's at beginning and end
    const algE = "U R U2 R' U' R U' R'";
    const algE2 = "U2 R U2 R' U' R U' R'";
    const algE3 = "U' R U2 R' U' R U' R'";
    const algE4 = "R U2 R' U' R U' R' U";
    const algE5 = "R U2 R' U' R U' R' U2"; 
    const algE6 = "R U2 R' U' R U' R' U'"; 
    const algF = "R U2 R' U' R U' R'";
    const result3 = await isConfluent(algE, algF);
    const result3b = await isConfluent(algE2, algF);
    const result3c = await isConfluent(algE3, algF);
    const result3d = await isConfluent(algE4, algF);
    const result3e = await isConfluent(algE5, algF);
    const result3f = await isConfluent(algE6, algF);
    expect(result3 === true || typeof result3 === "string").toBe(true); // Accepts true or AUF string
    expect(result3b === true || typeof result3b === "string").toBe(true); // Accepts true or AUF string
    expect(result3c === true || typeof result3c === "string").toBe(true);
    expect(result3d === true || typeof result3d === "string").toBe(true);
    expect(result3e === true || typeof result3e === "string").toBe(true);
    expect(result3f === true || typeof result3f === "string").toBe(true);

    // Check Sandwiching Us
    const algG = "U2 R U2 R' U' R U' R' U";
    const algH = "R U2 R' U' R U' R'";
    const result4 = await isConfluent(algG, algH);
    const result4a = await isConfluent(algH, algG);
    expect(result4 === true || typeof result4 === "string").toBe(true); // Accepts true or AUF string
    expect(result4a === true || typeof result4 === "string").toBe(true); // Accepts true or AUF string

    const algI = "R U2 R' U' R U' R'";
    const algJ = "R U R' U R U2 R'";
    const result5 = await isConfluent(algI, algJ);
    expect(result5 === true || typeof result5 === "string").toBe(false); // Accepts true or AUF string
  });
});
