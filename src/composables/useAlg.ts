import { Alg } from 'cubing/alg';

export function useAlg() {

  const algMovesToArray = (algorithm: string | Alg): Alg[] => {
    const alg = typeof algorithm === "string" ? new Alg(algorithm) : algorithm;
    const moves: Alg[] = [];
    for (const move of alg.experimentalLeafMoves()) {
      moves.push(new Alg(move.toString()));
    }
    return moves;
  }

  /**
 * Merges an array of Alg objects into a single Alg.
 */
  const mergeAlg = (moves: Alg[]): Alg => {
    return new Alg(moves.map(m => m.toString()).join(" "));
  }

/**
 * Applies mirroring to each move in the array according to a specified swap pair.
 * @param moves Array of Alg objects (single moves)
 * @param swapPair A [face1, face2] pair to swap, e.g. ["F","B"]
 * @returns Alg
 */
  const mirrorMoveArray = (moves: Alg[], swapPair: [string, string]): Alg[] => {
  const [a, b] = swapPair;
  // Process each move: invert and swap if needed
  const processedMoves = moves.map(move => {
    const inverted = move.invert();
    const moveStr = inverted.toString();
    const match = moveStr.match(/^([A-Za-z]+)/);
    if (match) {
      const face = match[1];
      if (face === a) {
        return new Alg(b + moveStr.slice(face.length));
      } else if (face === b) {
        return new Alg(a + moveStr.slice(face.length));
      }
    }
    return inverted;
  });
  return processedMoves
  }

  /**
 * Mirrors an algorithm by inverting each move and swapping faces according to swapPair.
 * @param algOrString Algorithm as string or Alg
 * @param swapPair A [face1, face2] pair to swap, e.g. ["F","B"]
 * @returns Alg
 */
const mirrorAlg = (algOrString: string | Alg, swapPair: [string, string]): Alg => {
  const moves = algMovesToArray(algOrString);
  const mirrorMoves = mirrorMoveArray(moves, swapPair);
  return mergeAlg(mirrorMoves);
}

  /**
   * Inverts an algorithm (string or Alg) and returns a new Alg.
   */
  const invertAlg = (algOrString: string | Alg): Alg => {
    const alg = typeof algOrString === "string" ? new Alg(algOrString) : algOrString;
    return alg.invert();
  };

  return {
    Alg,
    algMovesToArray,
    mergeAlg,
    mirrorMoveArray,
    mirrorAlg,
    invertAlg
  }
}



