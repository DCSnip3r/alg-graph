import { Alg } from 'cubing/alg';
import type { Node, Edge } from '@vue-flow/core';

interface TreeGeneratorConfig {
  rootNodeId: string;
  levels: string[][]; // Array of levels, each containing algorithm strings
  addNodes: (nodes: Node[]) => void;
  addEdges: (edges: Edge[]) => void;
  findNode: (id: string) => Node | undefined;
  getNextNodeId: () => string;
  updateNodeData: (id: string, data: any) => void;
  checkAndRepositionNode: (nodeId: string, nodes: Node[], context?: { parentId?: string; rawSegment?: string; sourceHandle?: string }) => Promise<any>;
  nodes: { value: Node[] };
}

interface CardinalDirection {
  dx: number;
  dy: number;
  sourceHandle: string;
  targetHandle: string;
}

// Define cardinal directions with handle mappings
const DIRECTIONS: Record<string, CardinalDirection> = {
  forward: { dx: 500, dy: 0, sourceHandle: 'handle-r', targetHandle: 'handle-l' },
  backward: { dx: -500, dy: 0, sourceHandle: 'handle-l', targetHandle: 'handle-r' },
  up: { dx: 0, dy: -500, sourceHandle: 'handle-t', targetHandle: 'handle-b' },
  down: { dx: 0, dy: 500, sourceHandle: 'handle-b', targetHandle: 'handle-t' },
};

export function useTreeGenerator() {
  
  /**
   * Determines the cardinal direction assignment based on number of children
   * and the child index.
   */
  function getDirectionForChild(childCount: number, childIndex: number): CardinalDirection {
    if (childCount === 1) {
      // Single child goes forward
      return DIRECTIONS.forward;
    } else if (childCount === 2) {
      // Two children: up and down
      return childIndex === 0 ? DIRECTIONS.up : DIRECTIONS.down;
    } else if (childCount === 3) {
      // Three children: up, forward, down
      const dirs = [DIRECTIONS.up, DIRECTIONS.forward, DIRECTIONS.down];
      return dirs[childIndex];
    } else if (childCount === 4) {
      // Four children: up, down, left, right
      const dirs = [DIRECTIONS.up, DIRECTIONS.down, DIRECTIONS.backward, DIRECTIONS.forward];
      return dirs[childIndex];
    } else {
      // More than 4: distribute around in a pattern
      const dirs = [DIRECTIONS.up, DIRECTIONS.forward, DIRECTIONS.down, DIRECTIONS.backward];
      return dirs[childIndex % dirs.length];
    }
  }

  /**
   * Helper to wait for a specified amount of time (for confluence to complete)
   */
  function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Generates a single node and waits for confluence check
   */
  async function generateNode(
    config: TreeGeneratorConfig,
    parentNode: Node,
    algString: string,
    direction: CardinalDirection,
    _levelIndex: number,
    _algIndex: number
  ): Promise<Node | null> {
    const { addNodes, addEdges, findNode, getNextNodeId, updateNodeData, checkAndRepositionNode, nodes } = config;

    // Parse and validate algorithm
    let parsedAlg: Alg;
    try {
      parsedAlg = new Alg(algString.trim());
    } catch (e) {
      console.warn(`Invalid algorithm: ${algString}`, e);
      return null;
    }

    const algStr = parsedAlg.toString();
    
    // Calculate position based on parent and direction
    const newPosition = {
      x: parentNode.position.x + direction.dx,
      y: parentNode.position.y + direction.dy,
    };

    // Generate new node ID
    const newNodeId = getNextNodeId();

    // Create the node
    const newNode = {
      id: newNodeId,
      type: 'twisty',
      position: newPosition,
      data: {
        label: algStr,
        alg: '', // Will be computed when edge is added
        rawAlgorithm: algStr,
        targetHandleId: direction.targetHandle,
        collapsed: false,
      },
      style: {
        borderColor: '#ffffff',
        borderWidth: '8px',
        borderStyle: 'solid',
        borderRadius: '4px',
      },
    };

    // Add the node
    addNodes([newNode]);

    // Wait a tick for the node to be added to the DOM
    await delay(50);

    // Create the edge
    const newEdge = {
      id: `e${parentNode.id}-${newNodeId}-${direction.sourceHandle}`,
      source: parentNode.id,
      target: newNodeId,
      sourceHandle: direction.sourceHandle,
      targetHandle: direction.targetHandle,
      type: 'special',
      label: algStr,
      data: { algorithm: algStr },
      animated: true,
    };

    // Add the edge
    addEdges([newEdge]);

    // Compute the combined algorithm
    const parentAlg = parentNode.data.alg || '';
    const combinedAlg = new Alg(parentAlg).concat(parsedAlg).experimentalSimplify({ cancel: true }).toString();

    // Update node with combined algorithm
    updateNodeData(newNodeId, {
      alg: combinedAlg,
      label: algStr, // Keep the label as the raw algorithm for clarity
    });

    // Wait for node data update to propagate
    await delay(50);

    // Get the updated node
    const updatedNode = findNode(newNodeId);
    if (!updatedNode) {
      console.warn(`Could not find node ${newNodeId} after creation`);
      return null;
    }

    // Check for confluence with existing nodes
    await checkAndRepositionNode(newNodeId, nodes.value, {
      parentId: parentNode.id,
      rawSegment: algStr,
      sourceHandle: direction.sourceHandle,
    });

    // Wait for confluence check to complete and potentially reposition
    await delay(100);

    // Return the updated node
    return findNode(newNodeId) || updatedNode;
  }

  /**
   * Main tree generation function - processes levels iteratively
   */
  async function generateTree(config: TreeGeneratorConfig): Promise<void> {
    const { rootNodeId, levels, findNode } = config;

    // Get the root node
    const rootNode = findNode(rootNodeId);
    if (!rootNode) {
      console.error(`Root node ${rootNodeId} not found`);
      return;
    }

    // Keep track of nodes at each level
    let currentLevelNodes: Node[] = [rootNode];

    // Process each level
    for (let levelIndex = 0; levelIndex < levels.length; levelIndex++) {
      const levelAlgs = levels[levelIndex];
      const nextLevelNodes: Node[] = [];

      console.log(`Processing level ${levelIndex + 1} with ${levelAlgs.length} algorithms`);

      // For each parent node in the current level
      for (const parentNode of currentLevelNodes) {
        // Filter out empty algorithm strings
        const validAlgs = levelAlgs.filter(alg => alg && alg.trim().length > 0);
        
        if (validAlgs.length === 0) {
          console.warn(`No valid algorithms at level ${levelIndex + 1}`);
          continue;
        }

        // Generate child nodes for each algorithm
        for (let algIndex = 0; algIndex < validAlgs.length; algIndex++) {
          const algString = validAlgs[algIndex];
          const direction = getDirectionForChild(validAlgs.length, algIndex);

          console.log(`  Creating node for parent ${parentNode.id}, alg: ${algString}, direction:`, direction);

          const newNode = await generateNode(
            config,
            parentNode,
            algString,
            direction,
            levelIndex,
            algIndex
          );

          if (newNode) {
            nextLevelNodes.push(newNode);
          }

          // Small delay between node creations to avoid overwhelming the system
          await delay(50);
        }
      }

      // Move to the next level
      currentLevelNodes = nextLevelNodes;
      
      if (currentLevelNodes.length === 0) {
        console.warn(`No nodes created at level ${levelIndex + 1}, stopping generation`);
        break;
      }
    }

    console.log('Tree generation complete');
  }

  return {
    generateTree,
  };
}
