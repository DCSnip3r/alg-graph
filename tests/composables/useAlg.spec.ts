import { describe, it, expect, beforeEach } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
beforeEach(() => {
  setActivePinia(createPinia());
});
import { useAlg } from '../../src/composables/useAlg';
import { Alg } from 'cubing/alg';

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

describe('expandDoubleMoves', () => {
  const { expandDoubleMoves } = useAlg();

  it('expands X2 to X X', () => {
    expect(expandDoubleMoves("R2").toString()).toBe("R R");
    expect(expandDoubleMoves("U2").toString()).toBe("U U");
    expect(expandDoubleMoves("R2 U2").toString()).toBe("R R U U");
  });

  it('expands X2\' to X\' X\'', () => {
    expect(expandDoubleMoves("R2'").toString()).toBe("R' R'");
    expect(expandDoubleMoves("L2'").toString()).toBe("L' L'");
    expect(expandDoubleMoves("R2' U2'").toString()).toBe("R' R' U' U'");
  });

  it('leaves single moves and non-double moves unchanged', () => {
    expect(expandDoubleMoves("R").toString()).toBe("R");
    expect(expandDoubleMoves("R'").toString()).toBe("R'");
    expect(expandDoubleMoves("Rw").toString()).toBe("Rw");
  });

  it('handles mix of double and single moves', () => {
    expect(expandDoubleMoves("R2 U R2'").toString()).toBe("R R U R' R'");
  });

  it('handles wide moves with 2 and 2\'', () => {
    expect(expandDoubleMoves("Rw2").toString()).toBe("Rw Rw");
    expect(expandDoubleMoves("Rw2'").toString()).toBe("Rw' Rw'");
  });

  it('handles empty string', () => {
    expect(expandDoubleMoves("").toString()).toBe("");
  });
});

describe('detectSetupMoves', () => {
  const { detectSetupMoves } = useAlg();

  it('detects single setup move at start and end', () => {
    expect(detectSetupMoves("R U R' U2 F D F' U2 R U R'").map(m => m.toString())).toEqual(["R"]);
    expect(detectSetupMoves("U' D R' U2 F D F' U2 R U").map(m => m.toString())).toEqual(["U'"]);
    expect(detectSetupMoves("L U R' U2 F D F' U2 R' U L").map(m => m.toString())).toEqual([]);
    expect(detectSetupMoves("R U R' U2 X Y X'").map(m => m.toString())).toEqual([]);
  });

  it('detects setup moves at both ends', () => {
    expect(detectSetupMoves("R U R' U2 F D F' U2 R U R' U2 R U'").map(m => m.toString())).toEqual([]);
  });

  it('detects multiple setup moves', () => {
    expect(detectSetupMoves("R U L D F D' L' U' R'").map(m => m.toString())).toEqual(["R", "U", "L", "D"]);
  });

  it('returns empty array if no setup moves', () => {
    expect(detectSetupMoves("R U F D")).toHaveLength(0);
  });

  it('handles double moves and their inverses', () => {
    expect(detectSetupMoves("R2 U2 F D F' U2' R2'").map(m => m.toString())).toEqual(["R2", "U2","F"]);
    expect(detectSetupMoves("R2' U2' F' D F U2 R2").map(m => m.toString())).toEqual(["R2'", "U2'", "F'"]);
  });

  it('handles empty string', () => {
    expect(detectSetupMoves("")).toHaveLength(0);
  });

  it('handles incorrectly notated double moves', () => {
    expect(detectSetupMoves("R2 U2 F D F' U2 R2").map(m => m.toString())).toEqual(["R2", "U2","F"]);
  });

  it('finds setup moves buried in mis-turned X2 algs', () => {
    expect(detectSetupMoves("R U R' D R2 U2 R'").map(m => m.toString())).toEqual(["R", "U"]);
    expect(detectSetupMoves("R U R' D R2 U2' R'").map(m => m.toString())).toEqual(["R", "U"]);
  });
});

describe('getMoveFace', () => {
  const { getMoveFace } = useAlg();

  it('extracts face from single moves (string)', () => {
    expect(getMoveFace("R")).toBe("R");
    expect(getMoveFace("U'")).toBe("U");
    expect(getMoveFace("L2")).toBe("L");
    expect(getMoveFace("Rw")).toBe("Rw");
    expect(getMoveFace("Rw2'")).toBe("Rw");
    expect(getMoveFace("x")).toBe("x");
    expect(getMoveFace("M2")).toBe("M");
  });

  it('extracts face from Alg objects', () => {
    expect(getMoveFace(new Alg("R"))).toBe("R");
    expect(getMoveFace(new Alg("U'"))).toBe("U");
    expect(getMoveFace(new Alg("L2"))).toBe("L");
    expect(getMoveFace(new Alg("Rw2'"))).toBe("Rw");
  });

  it('returns null for invalid move', () => {
    expect(getMoveFace("")).toBeNull();
    expect(getMoveFace("2")).toBeNull();
    expect(getMoveFace("'")).toBeNull();
    expect(getMoveFace(" ")).toBeNull();
    expect(getMoveFace(new Alg(""))).toBeNull();
  });
});

describe('isDoubleTurn', () => {
  const { isDoubleTurn } = useAlg();

  it('detects double turns (string)', () => {
    expect(isDoubleTurn("R2")).toBe(true);
    expect(isDoubleTurn("R2'")).toBe(true);
    expect(isDoubleTurn("Rw2")).toBe(true);
    expect(isDoubleTurn("Rw2'")).toBe(true);
    expect(isDoubleTurn("M2")).toBe(true);
    expect(isDoubleTurn("M2'")).toBe(true);
  });

  it('detects double turns (Alg)', () => {
    expect(isDoubleTurn(new Alg("R2"))).toBe(true);
    expect(isDoubleTurn(new Alg("R2'"))).toBe(true);
    expect(isDoubleTurn(new Alg("Rw2"))).toBe(true);
    expect(isDoubleTurn(new Alg("Rw2'"))).toBe(true);
  });

  it('returns false for non-double moves', () => {
    expect(isDoubleTurn("R")).toBe(false);
    expect(isDoubleTurn("R'")).toBe(false);
    expect(isDoubleTurn("Rw")).toBe(false);
    expect(isDoubleTurn("U")).toBe(false);
    expect(isDoubleTurn("")).toBe(false);
    expect(isDoubleTurn("2")).toBe(false);
    expect(isDoubleTurn("'")).toBe(false);
    expect(isDoubleTurn(new Alg("R"))).toBe(false);
    expect(isDoubleTurn(new Alg("U"))).toBe(false);
  });
});
