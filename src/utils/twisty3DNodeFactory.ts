import { TwistyPlayer } from 'cubing/twisty';
import type { Object3D } from 'three';

/**
 * Creates a Three.js Object3D from a cubing.js TwistyPlayer for use in 3D graphs.
 * 
 * @param alg - The algorithm string to display on the puzzle
 * @param setupAlg - Optional setup algorithm to apply before the main algorithm
 * @returns Promise<Object3D> - A Three.js object that can be used in vue-force-graph
 */
export async function createTwisty3DNode(
  alg: string = '',
  setupAlg: string = 'x2'
): Promise<Object3D | null> {
  try {
    // Create a TwistyPlayer instance
    const twistyPlayer = new TwistyPlayer({
      alg: alg || "U U'", // Default to a neutral algorithm if empty
      experimentalSetupAlg: setupAlg,
      experimentalSetupAnchor: 'end',
      visualization: '3D',
      background: 'none',
      controlPanel: 'none',
    });

    // Get the Three.js Object3D from the TwistyPlayer
    const puzzleObject = await twistyPlayer.experimentalCurrentThreeJSPuzzleObject();

    if (!puzzleObject) {
      console.warn('Failed to get puzzle object for algorithm:', alg);
      return null;
    }

    // Scale the puzzle to an appropriate size for the force graph
    puzzleObject.scale.set(10, 10, 10); // Adjust scale as needed

    return puzzleObject;
  } catch (error) {
    console.error('Error creating Twisty 3D node:', error);
    return null;
  }
}
