import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useTreeGenerator } from '../../src/composables/useTreeGenerator';

describe('useTreeGenerator', () => {
  let config: any;
  let nodes: any[];
  let edges: any[];
  let nodeIdCounter: number;

  beforeEach(() => {
    nodes = [];
    edges = [];
    nodeIdCounter = 1;

    config = {
      rootNodeId: 'n-0',
      levels: [],
      addNodes: vi.fn((newNodes: any[]) => {
        nodes.push(...newNodes);
      }),
      addEdges: vi.fn((newEdges: any[]) => {
        edges.push(...newEdges);
      }),
      findNode: vi.fn((id: string) => nodes.find(n => n.id === id)),
      getNextNodeId: vi.fn(() => `n-${nodeIdCounter++}`),
      updateNodeData: vi.fn((id: string, data: any) => {
        const node = nodes.find(n => n.id === id);
        if (node) {
          node.data = { ...node.data, ...data };
        }
      }),
      checkAndRepositionNode: vi.fn(async () => null), // No confluence by default
      nodes: { value: nodes },
    };

    // Add root node
    nodes.push({
      id: 'n-0',
      type: 'twisty',
      position: { x: 0, y: 0 },
      data: {
        label: '',
        alg: '',
        rawAlgorithm: '',
        targetHandleId: 'handle-b',
        collapsed: false,
      },
    });
  });

  describe('Terminal algorithms', () => {
    it('should mark nodes with semicolon as terminal', async () => {
      const { generateTree } = useTreeGenerator();
      config.levels = [[`R U R';`]]; // Terminal algorithm

      await generateTree(config);

      // Should have created one node
      expect(nodes.length).toBe(2); // Root + 1 new node
      const terminalNode = nodes.find(n => n.id === 'n-1');
      expect(terminalNode).toBeDefined();
      expect(terminalNode?.data.isTerminal).toBe(true);
    });

    it('should not add children to terminal nodes', async () => {
      const { generateTree } = useTreeGenerator();
      config.levels = [
        [`R U R';`, `R U R'`], // One terminal, one non-terminal
        ['U'], // Second level
      ];

      await generateTree(config);

      // Root (n-0) + 2 from level 1 (n-1 terminal, n-2 non-terminal) + 1 from level 2 (n-3, child of n-2)
      expect(nodes.length).toBe(4);

      const terminalNode = nodes.find(n => n.id === 'n-1');
      expect(terminalNode?.data.isTerminal).toBe(true);

      const nonTerminalNode = nodes.find(n => n.id === 'n-2');
      expect(nonTerminalNode?.data.isTerminal).toBe(false);

      // Check edges - n-2 should have a child but n-1 should not
      const terminalNodeChildren = edges.filter(e => e.source === 'n-1');
      const nonTerminalNodeChildren = edges.filter(e => e.source === 'n-2');

      expect(terminalNodeChildren.length).toBe(0); // Terminal node has no children
      expect(nonTerminalNodeChildren.length).toBe(1); // Non-terminal node has one child
    });

    it('should parse algorithm without semicolon correctly', async () => {
      const { generateTree } = useTreeGenerator();
      config.levels = [[`R U R'`]]; // Non-terminal

      await generateTree(config);

      expect(nodes.length).toBe(2);
      const node = nodes.find(n => n.id === 'n-1');
      expect(node?.data.isTerminal).toBe(false);
    });
  });

  describe('Delete duplicate on confluence', () => {
    it('should not add deleted nodes to next level when confluence detected', async () => {
      const { generateTree } = useTreeGenerator();
      
      // First node is deleted, second is not
      let callCount = 0;
      config.checkAndRepositionNode = vi.fn(async (nodeId: string) => {
        callCount++;
        if (callCount === 1) {
          // First call - simulate node deletion by returning nodeDeleted flag
          // The actual deletion happens in useNodeConfluence, not in the test
          return { confluentWithId: 'n-0', aufVariant: 'exact', nodeDeleted: true };
        }
        // Second call - keep the node
        return null;
      });

      config.levels = [
        [`R U R'`, `U R U' R'`], // Two algorithms
        ['U2'], // Second level
      ];

      await generateTree(config);

      // Root + 2 from level 1 (both created initially) + 1 from level 2 (only second node gets children)
      // The first node is marked as deleted but still exists in the test (mocking limitation)
      // The important part is that it doesn't get children in level 2
      
      // Check that only the non-deleted node got children
      const level2Edges = edges.filter(e => e.label === 'U2');
      expect(level2Edges.length).toBe(1); // Only one child because first node was marked as deleted
      expect(level2Edges[0].source).toBe('n-2'); // Child of the second node
    });
  });
});
