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
   * Checks if an algorithm string is the special U_branch pattern
   */
  function isUBranchPattern(algString: string): boolean {
    return algString.trim().toLowerCase() === 'u_branch';
  }

  /**
   * Parses an algorithm string and extracts the algorithm and terminal flag
   * Terminal algorithms end with a semicolon (;) and won't receive children in subsequent levels
   */
  function parseAlgorithm(algString: string): { alg: string; isTerminal: boolean } {
    const trimmed = algString.trim();
    if (trimmed.endsWith(';')) {
      return {
        alg: trimmed.slice(0, -1).trim(), // Remove the semicolon
        isTerminal: true,
      };
    }
    return {
      alg: trimmed,
      isTerminal: false,
    };
  }

  /**
   * Generates a single node and waits for confluence check
   * Returns the node if it was created successfully, or null if it was deleted or failed
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

    // Parse algorithm and check if it's terminal
    const { alg: cleanAlg, isTerminal } = parseAlgorithm(algString);

    // Parse and validate algorithm
    let parsedAlg: Alg;
    try {
      parsedAlg = new Alg(cleanAlg);
    } catch (e) {
      console.warn(`Invalid algorithm: ${cleanAlg}`, e);
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
        isTerminal, // Mark if this node is terminal
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
      label: combinedAlg, // Use the full accumulated algorithm path
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
    const confluenceResult = await checkAndRepositionNode(newNodeId, nodes.value, {
      parentId: parentNode.id,
      rawSegment: algStr,
      sourceHandle: direction.sourceHandle,
    });

    // Wait for confluence check to complete and potentially reposition
    await delay(100);

    // If node was deleted due to confluence, return null
    if (confluenceResult && confluenceResult.nodeDeleted) {
      console.log(`Node ${newNodeId} was deleted due to confluence with ${confluenceResult.confluentWithId}`);
      return null;
    }

    // Return the updated node (or null if it was deleted)
    return findNode(newNodeId) || null;
  }

  /**
   * Generates the U_branch cluster pattern: U and U' from parent, both connecting to U2
   * Returns the U2 node that can be used for further branching
   */
  async function generateUBranchCluster(
    config: TreeGeneratorConfig,
    parentNode: Node
  ): Promise<Node[]> {
    const { addNodes, addEdges, findNode, getNextNodeId, updateNodeData, checkAndRepositionNode, nodes } = config;
    const resultNodes: Node[] = [];

    // Generate U node (going up)
    const uNodeId = getNextNodeId();
    const uPosition = {
      x: parentNode.position.x + DIRECTIONS.up.dx,
      y: parentNode.position.y + DIRECTIONS.up.dy,
    };

    const uNode = {
      id: uNodeId,
      type: 'twisty',
      position: uPosition,
      data: {
        label: 'U',
        alg: '',
        rawAlgorithm: 'U',
        targetHandleId: DIRECTIONS.up.targetHandle,
        collapsed: false,
        isTerminal: false,
      },
      style: {
        borderColor: '#ffffff',
        borderWidth: '8px',
        borderStyle: 'solid',
        borderRadius: '4px',
      },
    };

    addNodes([uNode]);
    await delay(50);

    // Create edge from parent to U
    const uEdge = {
      id: `e${parentNode.id}-${uNodeId}-${DIRECTIONS.up.sourceHandle}`,
      source: parentNode.id,
      target: uNodeId,
      sourceHandle: DIRECTIONS.up.sourceHandle,
      targetHandle: DIRECTIONS.up.targetHandle,
      type: 'special',
      label: 'U',
      data: { algorithm: 'U' },
      animated: true,
    };

    addEdges([uEdge]);

    // Compute U's accumulated algorithm
    const parentAlg = parentNode.data.alg || '';
    const uCombinedAlg = new Alg(parentAlg).concat(new Alg('U')).experimentalSimplify({ cancel: true }).toString();
    updateNodeData(uNodeId, { alg: uCombinedAlg, label: uCombinedAlg });
    await delay(50);

    // Check confluence for U node
    const updatedUNode = findNode(uNodeId);
    if (updatedUNode) {
      await checkAndRepositionNode(uNodeId, nodes.value, {
        parentId: parentNode.id,
        rawSegment: 'U',
        sourceHandle: DIRECTIONS.up.sourceHandle,
      });
      await delay(100);
    }

    // Generate U' node (going down)
    const uPrimeNodeId = getNextNodeId();
    const uPrimePosition = {
      x: parentNode.position.x + DIRECTIONS.down.dx,
      y: parentNode.position.y + DIRECTIONS.down.dy,
    };

    const uPrimeNode = {
      id: uPrimeNodeId,
      type: 'twisty',
      position: uPrimePosition,
      data: {
        label: "U'",
        alg: '',
        rawAlgorithm: "U'",
        targetHandleId: DIRECTIONS.down.targetHandle,
        collapsed: false,
        isTerminal: false,
      },
      style: {
        borderColor: '#ffffff',
        borderWidth: '8px',
        borderStyle: 'solid',
        borderRadius: '4px',
      },
    };

    addNodes([uPrimeNode]);
    await delay(50);

    // Create edge from parent to U'
    const uPrimeEdge = {
      id: `e${parentNode.id}-${uPrimeNodeId}-${DIRECTIONS.down.sourceHandle}`,
      source: parentNode.id,
      target: uPrimeNodeId,
      sourceHandle: DIRECTIONS.down.sourceHandle,
      targetHandle: DIRECTIONS.down.targetHandle,
      type: 'special',
      label: "U'",
      data: { algorithm: "U'" },
      animated: true,
    };

    addEdges([uPrimeEdge]);

    // Compute U' accumulated algorithm
    const uPrimeCombinedAlg = new Alg(parentAlg).concat(new Alg("U'")).experimentalSimplify({ cancel: true }).toString();
    updateNodeData(uPrimeNodeId, { alg: uPrimeCombinedAlg, label: uPrimeCombinedAlg });
    await delay(50);

    // Check confluence for U' node
    const updatedUPrimeNode = findNode(uPrimeNodeId);
    if (updatedUPrimeNode) {
      await checkAndRepositionNode(uPrimeNodeId, nodes.value, {
        parentId: parentNode.id,
        rawSegment: "U'",
        sourceHandle: DIRECTIONS.down.sourceHandle,
      });
      await delay(100);
    }

    // Generate U2 node (positioned forward/right from parent, between U and U')
    const u2NodeId = getNextNodeId();
    const u2Position = {
      x: parentNode.position.x + DIRECTIONS.forward.dx,
      y: parentNode.position.y + DIRECTIONS.forward.dy,
    };

    const u2Node = {
      id: u2NodeId,
      type: 'twisty',
      position: u2Position,
      data: {
        label: 'U2',
        alg: '',
        rawAlgorithm: 'U2',
        targetHandleId: DIRECTIONS.forward.targetHandle,
        collapsed: false,
        isTerminal: false,
      },
      style: {
        borderColor: '#ffffff',
        borderWidth: '8px',
        borderStyle: 'solid',
        borderRadius: '4px',
      },
    };

    addNodes([u2Node]);
    await delay(50);

    // Get current U and U' nodes (might have been repositioned or deleted)
    const currentUNode = findNode(uNodeId);
    const currentUPrimeNode = findNode(uPrimeNodeId);

    // Create edge from U to U2 (if U still exists)
    if (currentUNode) {
      const uToU2Edge = {
        id: `e${uNodeId}-${u2NodeId}-${DIRECTIONS.forward.sourceHandle}`,
        source: uNodeId,
        target: u2NodeId,
        sourceHandle: DIRECTIONS.forward.sourceHandle,
        targetHandle: DIRECTIONS.forward.targetHandle,
        type: 'special',
        label: 'U',
        data: { algorithm: 'U' },
        animated: true,
      };

      addEdges([uToU2Edge]);

      // Compute U2's accumulated algorithm from U path
      const uAlg = currentUNode.data.alg || '';
      const u2CombinedAlg = new Alg(uAlg).concat(new Alg('U')).experimentalSimplify({ cancel: true }).toString();
      updateNodeData(u2NodeId, { alg: u2CombinedAlg, label: u2CombinedAlg });
      await delay(50);

      // Check confluence for U2 node
      await checkAndRepositionNode(u2NodeId, nodes.value, {
        parentId: uNodeId,
        rawSegment: 'U',
        sourceHandle: DIRECTIONS.forward.sourceHandle,
      });
      await delay(100);
    }

    // Create edge from U' to U2 (if U' still exists and U2 exists)
    const currentU2Node = findNode(u2NodeId);
    if (currentUPrimeNode && currentU2Node) {
      const uPrimeToU2Edge = {
        id: `e${uPrimeNodeId}-${u2NodeId}-${DIRECTIONS.forward.sourceHandle}`,
        source: uPrimeNodeId,
        target: u2NodeId,
        sourceHandle: DIRECTIONS.forward.sourceHandle,
        targetHandle: DIRECTIONS.forward.targetHandle,
        type: 'special',
        label: "U'",
        data: { algorithm: "U'" },
        animated: true,
      };

      addEdges([uPrimeToU2Edge]);
      await delay(50);

      // Check confluence again for this second path to U2
      await checkAndRepositionNode(u2NodeId, nodes.value, {
        parentId: uPrimeNodeId,
        rawSegment: "U'",
        sourceHandle: DIRECTIONS.forward.sourceHandle,
      });
      await delay(100);
    }

    // Return all nodes (U, U', U2) that survived confluence for potential further branching
    const finalUNode = findNode(uNodeId);
    const finalUPrimeNode = findNode(uPrimeNodeId);
    const finalU2Node = findNode(u2NodeId);
    
    if (finalUNode && !finalUNode.data.isTerminal) {
      resultNodes.push(finalUNode);
    }
    if (finalUPrimeNode && !finalUPrimeNode.data.isTerminal) {
      resultNodes.push(finalUPrimeNode);
    }
    if (finalU2Node && !finalU2Node.data.isTerminal) {
      resultNodes.push(finalU2Node);
    }

    return resultNodes;
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
          
          // Check if this is the special U_branch pattern
          if (isUBranchPattern(algString)) {
            console.log(`  Generating U_branch cluster for parent ${parentNode.id}`);
            const clusterNodes = await generateUBranchCluster(config, parentNode);
            nextLevelNodes.push(...clusterNodes);
            await delay(50);
            continue; // Skip to next algorithm
          }

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

          // Only add non-terminal nodes to the next level for further expansion
          if (newNode && !newNode.data.isTerminal) {
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
