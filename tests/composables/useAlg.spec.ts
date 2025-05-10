import { describe, it, expect } from 'vitest';
import { useAlg } from '../../src/composables/useAlg';

describe('algMovesToArray', () => {
  const { algMovesToArray } = useAlg();
  it('returns an array of Alg objects for each move', () => {
    const algStr = "R U R' D";
    const moves = algMovesToArray(algStr);
    expect(moves).toHaveLength(4);
    expect(moves[0].toString()).toBe("R");
    expect(moves[1].toString()).toBe("U");
    expect(moves[2].toString()).toBe("R'");
    expect(moves[3].toString()).toBe("D");
  });

  it('handles empty algorithm string', () => {
    const moves = algMovesToArray("");
    expect(moves).toHaveLength(0);
  });

  it('handles single move', () => {
    const moves = algMovesToArray("F2");
    expect(moves).toHaveLength(1);
    expect(moves[0].toString()).toBe("F2");
  });
});

describe('mirrorMoveArray', () => {
  const { algMovesToArray, mirrorMoveArray, mergeAlg } = useAlg();
  it('inverts and swaps moves as specified', () => {
    const swapPair: [string, string] = ["F", "B"];
    const algStr = "F R U' R' U' R U R' F'";
    const moves = algMovesToArray(algStr);
    const result = mirrorMoveArray(moves, swapPair);
    expect(mergeAlg(result).toString()).toBe("B' R' U R U R' U' R B");
  });

  it('does not swap moves not in swapPair', () => {
    const swapPair: [string, string] = ["F", "B"];
    const algStr = "R U L";
    const moves = algMovesToArray(algStr);
    const result = mirrorMoveArray(moves, swapPair);
    expect(mergeAlg(result).toString()).toBe("R' U' L'");
  });

  it('handles empty moves array', () => {
    const swapPair: [string, string] = ["F", "B"];
    const moves: ReturnType<typeof algMovesToArray> = [];
    const result = mirrorMoveArray(moves, swapPair);
    expect(mergeAlg(result).toString()).toBe("");
  });

  it('handles moves with modifiers', () => {
    const swapPair: [string, string] = ["R", "L"];
    const algStr = "R2 L'";
    const moves = algMovesToArray(algStr);
    const result = mirrorMoveArray(moves, swapPair);
    expect(mergeAlg(result).toString()).toBe("L2' R");
  });
});
