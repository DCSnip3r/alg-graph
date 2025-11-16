import { TwistyPlayer } from 'cubing/twisty';
import type { Object3D } from 'three';

// Configuration constants
let PUZZLE_SCALE_FACTOR = 15; // Scale multiplier for puzzle objects in the force graph
const PUZZLE_LOAD_TIMEOUT_MS = 10000; // Maximum time to wait for puzzle object creation
const PUZZLE_INIT_POLL_INTERVAL_MS = 50; // Polling interval for puzzle initialization check
const PUZZLE_INIT_MAX_WAIT_MS = 2000; // Maximum time for initial polling

// Cache to store pre-created puzzle objects
const puzzleCache = new Map<string, Object3D>();
const loadingPromises = new Map<string, Promise<Object3D | null>>();
const playerInstances = new Map<string, TwistyPlayer>();

/**
 * Creates a Three.js Object3D from a cubing.js TwistyPlayer for use in 3D graphs.
 * 
 * @param alg - The algorithm string to display on the puzzle
 * @param setupAlg - Optional setup algorithm to apply before the main algorithm
 * @returns Promise<Object3D | null> - A Three.js object that can be used in vue-force-graph
 */
async function createTwisty3DNodeAsync(
  alg: string = '',
  setupAlg: string = 'x2'
): Promise<Object3D | null> {
  try {
    // Create a small visible container at the bottom of the screen
    // The TwistyPlayer needs to be in the viewport for WebGL rendering to work
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.bottom = '0';
    container.style.left = '0';
    container.style.width = '50px';
    container.style.height = '50px';
    container.style.opacity = '0.01'; // Nearly invisible but still rendered
    container.style.pointerEvents = 'none';
    container.style.zIndex = '-1';
    document.body.appendChild(container);

    // Create a TwistyPlayer instance with minimal size
    const twistyPlayer = new TwistyPlayer({
      alg: alg || "U U'", // Default to a neutral algorithm if empty
      experimentalSetupAlg: setupAlg,
      experimentalSetupAnchor: 'end',
      visualization: '3D',
      background: 'none',
      controlPanel: 'none',
    });

    // Set a small size for the player
    twistyPlayer.style.width = '50px';
    twistyPlayer.style.height = '50px';

    // Append to DOM to trigger rendering
    container.appendChild(twistyPlayer);

    // Store the player instance for cleanup
    const key = alg || 'empty';
    playerInstances.set(key, twistyPlayer);

    // Poll for puzzle object readiness instead of fixed delay
    const waitForPuzzleObject = async (): Promise<Object3D | null> => {
      const start = Date.now();
      while (Date.now() - start < PUZZLE_INIT_MAX_WAIT_MS) {
        const obj = await twistyPlayer.experimentalCurrentThreeJSPuzzleObject();
        if (obj) return obj;
        await new Promise(res => setTimeout(res, PUZZLE_INIT_POLL_INTERVAL_MS));
      }
      return null;
    };

    // Get the Three.js Object3D from the TwistyPlayer with timeout
    const puzzleObject = await Promise.race([
      waitForPuzzleObject(),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), PUZZLE_LOAD_TIMEOUT_MS))
    ]);

    if (!puzzleObject) {
      console.warn('Failed to get puzzle object for algorithm (timeout or unavailable):', alg);
      // Clean up the container
      document.body.removeChild(container);
      playerInstances.delete(key);
      return null;
    }

    // Scale the puzzle to an appropriate size for the force graph
    puzzleObject.scale.set(PUZZLE_SCALE_FACTOR, PUZZLE_SCALE_FACTOR, PUZZLE_SCALE_FACTOR);

    // Don't remove the container yet - the player needs to stay connected
    // for animation to continue working
    // We'll clean it up when the cache is cleared

    return puzzleObject;
  } catch (error) {
    console.error('Error creating Twisty 3D node:', error);
    // Clean up any created elements
    const key = alg || 'empty';
    const player = playerInstances.get(key);
    if (player?.parentElement?.parentElement) {
      player.parentElement.parentElement.removeChild(player.parentElement);
    }
    playerInstances.delete(key);
    return null;
  }
}

/**
 * Pre-loads puzzle objects for all nodes in the graph.
 * This should be called before rendering to ensure all objects are cached.
 * 
 * @param nodeAlgs - Array of algorithm strings to pre-load
 */
export async function preloadTwisty3DNodes(nodeAlgs: string[]): Promise<void> {
  const promises = nodeAlgs.map(async (alg) => {
    const key = alg || 'empty';
    if (!puzzleCache.has(key) && !loadingPromises.has(key)) {
      const promise = createTwisty3DNodeAsync(alg);
      loadingPromises.set(key, promise);
      
      const obj = await promise;
      if (obj) {
        puzzleCache.set(key, obj);
      }
      loadingPromises.delete(key);
    } else {
      // Return resolved promise for already-cached items
      return Promise.resolve();
    }
  });
  
  await Promise.all(promises);
}

/**
 * Gets a cached Twisty 3D node or returns null if not yet loaded.
 * This is a synchronous function suitable for use with vue-force-graph's nodeThreeObject.
 * 
 * @param alg - The algorithm string
 * @returns Object3D | null - The cached puzzle object or null
 */
export function getTwisty3DNode(alg: string = ''): Object3D | null {
  const key = alg || 'empty';
  return puzzleCache.get(key) || null;
}

/**
 * Sets the scale factor for puzzle objects.
 * This allows adjusting the size of cube nodes in the force graph.
 * 
 * @param scale - The new scale factor (default is 15)
 */
export function setPuzzleScale(scale: number): void {
  PUZZLE_SCALE_FACTOR = scale;
  // Update existing cached objects
  puzzleCache.forEach((obj) => {
    obj.scale.set(PUZZLE_SCALE_FACTOR, PUZZLE_SCALE_FACTOR, PUZZLE_SCALE_FACTOR);
  });
}

/**
 * Gets the current puzzle scale factor.
 */
export function getPuzzleScale(): number {
  return PUZZLE_SCALE_FACTOR;
}

/**
 * Clears the puzzle cache and cleans up DOM elements.
 */
export function clearTwisty3DCache(): void {
  // Clean up player instances
  playerInstances.forEach((player) => {
    if (player.parentElement) {
      const container = player.parentElement;
      if (container.parentElement) {
        container.parentElement.removeChild(container);
      }
    }
  });
  
  puzzleCache.clear();
  loadingPromises.clear();
  playerInstances.clear();
}
