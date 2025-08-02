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

  /**
   * Expands all double moves (e.g. "R2" -> "R R", "R2'" -> "R' R'")
   * in the given algorithm string or Alg.
   * Returns a new Alg.
   */
  const expandDoubleMoves = (algOrString: string | Alg): Alg => {
    const moves = algMovesToArray(algOrString);
    const expandedMoves: Alg[] = [];
    for (const move of moves) {
      const moveStr = move.toString();
      // Match e.g. "R2", "R2'", "Rw2", "Rw2'"
      const match = moveStr.match(/^([A-Za-z]+w?)(2)('?)/);
      if (match) {
        const face = match[1];
        const amount = match[2];
        const prime = match[3];
        // Expand "X2" -> "X X", "X2'" -> "X' X'"
        const singleMove = new Alg(face + (prime || ""));
        expandedMoves.push(singleMove, singleMove);
      } else {
        expandedMoves.push(move);
      }
    }
    return mergeAlg(expandedMoves);
  };

  /**
   * Returns the face part of a move string or Alg (e.g. "R2'" -> "R", "Rw2" -> "Rw").
   */
  const getMoveFace = (move: string | Alg): string | null => {
    const moveStr = typeof move === "string" ? move : move.toString();
    const match = moveStr.match(/^([A-Za-z]+w?)/);
    return match ? match[1] : null;
  };

  /**
   * Returns true if the move string or Alg is a double turn (e.g. "R2" or "R2'").
   */
  const isDoubleTurn = (move: string | Alg): boolean => {
    const moveStr = typeof move === "string" ? move : move.toString();
    return /^[A-Za-z]+w?2'?$/i.test(moveStr);
  };

  const isSameFace = (move1: string | Alg, move2: string | Alg): boolean => {
    const face1 = getMoveFace(move1);
    const face2 = getMoveFace(move2);
    return face1 && face2 && face1 === face2;
  }

  function detectHiddenDoubleTurn(moves: Alg[], j: number, i: number) {
    return isDoubleTurn(moves[j - 1].toString()) &&
      getMoveFace(moves[i].toString()) === getMoveFace(moves[j].toString());
  }

  /**
   * Detects setup moves and their undoing at the start and end of an algorithm.
   * For example, in [X Y X'], detects X if the start and end are inverses.
   * Returns the setup moves as an array of Alg objects, or [] if none found.
   */
  const detectSetupMoves = (algOrString: string | Alg): Alg[] => {
    const moves = algMovesToArray(algOrString);

    let i = 0;
    let j = moves.length - 1;
    const setup: Alg[] = [];

    while (i < j) {
      if (detectInverses(moves, i, j)) {
        setup.push(moves[i]);
        i++;
        j--;
      } else {
        if (detectHiddenDoubleTurn(moves, j, i)
          ){
            setup.push(moves[i]);
          }
        break;
      }
    }
    return setup;
  };

  return {
    Alg,
    algMovesToArray,
    mergeAlg,
    mirrorMoveArray,
    mirrorAlg,
    invertAlg,
    expandDoubleMoves,
    detectSetupMoves,
    getMoveFace,
    isDoubleTurn,
  }



  function detectInverses(moves: Alg[], i: number, j: number) {
    return moves[i].toString() === moves[j].invert().toString() || (isDoubleTurn(moves[i]) && isDoubleTurn(moves[j]) && isSameFace(moves[i], moves[j]));
  }
}



