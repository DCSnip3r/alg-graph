

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
let displaySettingsMock: any = { repositionOnConfluence: true, matchIfAUF: true, createConfluenceEdges: true };
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
  let edges: any;
  let addEdges: any;
  let updateNodeData: any;

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
    edges = { value: [] };
    addEdges = vi.fn((e: any[]) => { edges.value.push(...e); });
    updateNodeData = vi.fn((id: string, data: any) => {
      const n = nodes.find(n => n.id === id);
      if (n) n.data = { ...n.data, ...data };
    });
    const composable = useNodeConfluence({ findNode, updateNodePosition, addEdges, edges, updateNodeData });
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
  
  it('creates confluence edge when toggle enabled', async () => {
    // Arrange confluent nodes
    const newNode = { id: 'n-3', data: { alg: "F R U' R' U' R U R' F'", rawAlgorithm: "R U" }, position: { x: 0, y: 0 } };
    nodes.push(newNode);
    await checkAndRepositionNode('n-3', nodes, { parentId: 'n-1', rawSegment: "R U" });
    expect(addEdges).toHaveBeenCalled();
    expect(edges.value.some((e: any) => e.type === 'confluence')).toBe(true);
  });

  it('does not create confluence edge when toggle disabled', async () => {
    displaySettings.createConfluenceEdges = false;
    const newNode = { id: 'n-4', data: { alg: "F R U' R' U' R U R' F'", rawAlgorithm: "R U" }, position: { x: 0, y: 0 } };
    nodes.push(newNode);
    await checkAndRepositionNode('n-4', nodes, { parentId: 'n-1', rawSegment: "R U" });
    expect(edges.value.every((e: any) => e.source !== 'n-1' || e.target !== 'n-2')).toBe(true);
  });

  it('prevents duplicate confluence edges', async () => {
  displaySettings.createConfluenceEdges = true; // re-enable after prior test disabled it
    const newNode = { id: 'n-5', data: { alg: "F R U' R' U' R U R' F'", rawAlgorithm: "R U" }, position: { x: 0, y: 0 } };
    nodes.push(newNode);
    await checkAndRepositionNode('n-5', nodes, { parentId: 'n-1', rawSegment: "R U" });
    await checkAndRepositionNode('n-5', nodes, { parentId: 'n-1', rawSegment: "R U" });
    const confluenceEdges = edges.value.filter((e: any) => e.type === 'confluence');
    expect(confluenceEdges.length).toBe(1);
  });

  it('updates confluenceInbound metadata on existing confluent node', async () => {
    displaySettings.createConfluenceEdges = true;
    const newNode = { id: 'n-6', data: { alg: "F R U' R' U' R U R' F'", rawAlgorithm: "R U" }, position: { x: 0, y: 0 } };
    nodes.push(newNode);
    await checkAndRepositionNode('n-6', nodes, { parentId: 'n-1', rawSegment: "R U" });
    const existing = nodes.find(n => n.id === 'n-2');
    expect(existing?.data.confluenceInbound?.count).toBeGreaterThanOrEqual(1);
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

  it('bypasses confluence checks when rawSegment is U', async () => {
    displaySettings.repositionOnConfluence = true;
    displaySettings.createConfluenceEdges = true;
    displaySettings.matchIfAUF = true;
    
    // Create a node that would normally be confluent with existing node (with AUF)
    const newNode = { id: 'n-3', data: { alg: "U R U R' U R U2' R'", rawAlgorithm: "U" }, position: { x: 0, y: 0 } };
    const existingNode = { id: 'n-existing', data: { alg: "R U R' U R U2' R'" }, position: { x: 300, y: 400 } };
    nodes.push(existingNode);
    nodes.push(newNode);
    
    await checkAndRepositionNode('n-3', nodes, { parentId: 'n-1', rawSegment: 'U', sourceHandle: 'handle-r' });
    
    // Should NOT reposition or create confluence edge
    expect(updateNodePosition).not.toHaveBeenCalled();
    expect(edges.value.some((e: any) => e.type === 'confluence')).toBe(false);
  });

  it('bypasses confluence checks when rawSegment is U\'', async () => {
    displaySettings.repositionOnConfluence = true;
    displaySettings.createConfluenceEdges = true;
    displaySettings.matchIfAUF = true;
    
    const newNode = { id: 'n-4', data: { alg: "U' R U R' U R U2' R'", rawAlgorithm: "U'" }, position: { x: 0, y: 0 } };
    const existingNode = { id: 'n-existing2', data: { alg: "R U R' U R U2' R' U" }, position: { x: 300, y: 400 } };
    nodes.push(existingNode);
    nodes.push(newNode);
    
    await checkAndRepositionNode('n-4', nodes, { parentId: 'n-1', rawSegment: "U'", sourceHandle: 'handle-r' });
    
    // Should NOT reposition or create confluence edge
    expect(updateNodePosition).not.toHaveBeenCalled();
    expect(edges.value.some((e: any) => e.type === 'confluence')).toBe(false);
  });

  it('bypasses confluence checks when rawSegment is U2', async () => {
    displaySettings.repositionOnConfluence = true;
    displaySettings.createConfluenceEdges = true;
    displaySettings.matchIfAUF = true;
    
    const newNode = { id: 'n-5', data: { alg: "U2 R U R' U R U2' R'", rawAlgorithm: "U2" }, position: { x: 0, y: 0 } };
    const existingNode = { id: 'n-existing3', data: { alg: "R U R' U R U2' R' U2" }, position: { x: 300, y: 400 } };
    nodes.push(existingNode);
    nodes.push(newNode);
    
    await checkAndRepositionNode('n-5', nodes, { parentId: 'n-1', rawSegment: 'U2', sourceHandle: 'handle-r' });
    
    // Should NOT reposition or create confluence edge
    expect(updateNodePosition).not.toHaveBeenCalled();
    expect(edges.value.some((e: any) => e.type === 'confluence')).toBe(false);
  });

  it('still performs confluence checks for non-U moves', async () => {
    displaySettings.repositionOnConfluence = true;
    displaySettings.createConfluenceEdges = true;
    displaySettings.matchIfAUF = true;
    
    // This should still trigger confluence detection
    const newNode = { id: 'n-6', data: { alg: "F R U' R' U' R U R' F'", rawAlgorithm: "R U" }, position: { x: 0, y: 0 } };
    nodes.push(newNode);
    
    await checkAndRepositionNode('n-6', nodes, { parentId: 'n-1', rawSegment: 'R U', sourceHandle: 'handle-r' });
    
    // Should reposition and create confluence edge as normal
    expect(updateNodePosition).toHaveBeenCalled();
    expect(edges.value.some((e: any) => e.type === 'confluence')).toBe(true);
  });

  it('bypasses confluence checks with whitespace in U move', async () => {
    displaySettings.repositionOnConfluence = true;
    displaySettings.createConfluenceEdges = true;
    
    const newNode = { id: 'n-7', data: { alg: "U R U R' U R U2' R'", rawAlgorithm: " U " }, position: { x: 0, y: 0 } };
    const existingNode = { id: 'n-existing4', data: { alg: "R U R' U R U2' R'" }, position: { x: 300, y: 400 } };
    nodes.push(existingNode);
    nodes.push(newNode);
    
    await checkAndRepositionNode('n-7', nodes, { parentId: 'n-1', rawSegment: ' U ', sourceHandle: 'handle-r' });
    
    // Should NOT reposition or create confluence edge even with whitespace
    expect(updateNodePosition).not.toHaveBeenCalled();
    expect(edges.value.some((e: any) => e.type === 'confluence')).toBe(false);
  });

  it('does not bypass confluence checks for non-U moves like U R', async () => {
    displaySettings.repositionOnConfluence = true;
    displaySettings.createConfluenceEdges = true;
    
    // U R is not just U, so should not bypass
    const newNode = { id: 'n-8', data: { alg: "U R", rawAlgorithm: "U R" }, position: { x: 0, y: 0 } };
    const existingNode = { id: 'n-existing5', data: { alg: "U R" }, position: { x: 300, y: 400 } };
    nodes.push(existingNode);
    nodes.push(newNode);
    
    await checkAndRepositionNode('n-8', nodes, { parentId: 'n-1', rawSegment: 'U R', sourceHandle: 'handle-r' });
    
    // Should still perform confluence check
    expect(updateNodePosition).toHaveBeenCalled();
  });
});
