import { describe, expect, it } from 'vitest';
import { Alg } from 'cubing/alg';
import { cube3x3x3 } from 'cubing/puzzles';
import { arrangementCount, chunkVariants, createPLLClassifier, generateArrangements, PLL_ALGORITHMS } from '../../src/utils/pllExplorer';

describe('PLL explorer', () => {
  it('identifies all reference PLLs, AUFs, and cube rotations', async () => {
    const classify = await createPLLClassifier();
    for (const [name, alg] of Object.entries(PLL_ALGORITHMS)) {
      expect(classify(alg), name).toBe(name);
      expect(classify(`x y ${alg} y' x'`), name).toBe(name);
      expect(classify(`${alg} x y`), name).toBe(name);
    }
    expect(classify('')).toBe('Solved');
    expect(classify(`U ${PLL_ALGORITHMS.T} U'`)).toBe('T');
    expect(classify("R U R' U R U2 R'")).toBeNull();
  });

  it('recognizes T and Y in either chunk order', async () => {
    const classify = await createPLLClassifier();
    const a = "F R U' R' U' R U R' F'";
    const b = "R U R' U' R' F R F'";
    expect(classify(`${a} ${b}`)).toBe('Y');
    expect(classify(`${b} ${a}`)).toBe('T');
    const graph = generateArrangements(chunkVariants([{ name: 'A', algorithm: a }, { name: 'B', algorithm: b }], false), 2, classify);
    expect(graph.find(node => node.parent === 1 && node.segment.description === 'B')?.pll).toBe('Y');
    expect(graph.find(node => node.parent === 3 && node.segment.description === 'A')?.pll).toBe('T');
  });

  it('uses references that are genuine last-layer permutations', async () => {
    const puzzle = await cube3x3x3.kpuzzle();
    const solved = puzzle.defaultPattern();
    const rotations = [''];
    const seen = new Set([solved.patternData.CENTERS.pieces.join(',')]);
    for (let i = 0; i < rotations.length; i++) for (const move of ['x', 'y', 'z']) {
      const alg = `${rotations[i]} ${move}`;
      const centers = solved.applyAlg(alg).patternData.CENTERS.pieces.join(',');
      if (!seen.has(centers)) { seen.add(centers); rotations.push(alg); }
    }
    expect(rotations).toHaveLength(24);
    for (const [name, alg] of Object.entries(PLL_ALGORITHMS)) {
      const state = solved.applyAlg(alg);
      const correction = rotations.find(r => state.applyAlg(r).patternData.CENTERS.pieces.join(',') === '0,1,2,3,4,5')!;
      const pattern = state.applyAlg(correction).patternData;
      expect(pattern.EDGES.pieces.slice(4), name).toEqual([4, 5, 6, 7, 8, 9, 10, 11]);
      expect(pattern.CORNERS.pieces.slice(4), name).toEqual([4, 5, 6, 7]);
      expect(pattern.EDGES.orientation.every(v => v === 0), name).toBe(true);
      expect(pattern.CORNERS.orientation.every(v => v === 0), name).toBe(true);
    }
  });

  it('preserves interrupted chunks and their inverse sequences', () => {
    const variants = chunkVariants([{ name: 'Sune', algorithm: "R U R' U R U2 R'" }, { name: 'U', algorithm: 'U' }], true);
    const interrupted = variants.find(v => v.description === "Sune [R U R' | U: U | U R U2 R']");
    expect(interrupted?.algorithm).toBe("R U R' U U R U2 R'");
    expect(variants.find(v => v.description === 'Sune⁻¹')?.algorithm).toBe(new Alg("R U R' U R U2 R'").invert().toString());
    expect(arrangementCount(4, 2)).toBe(20);
    expect(() => arrangementCount(20, 2)).toThrow();
    expect(() => chunkVariants([{ name: '', algorithm: 'R' }], false)).toThrow();
    expect(() => chunkVariants([{ name: 'long', algorithm: '(R U)21' }], false)).toThrow();
  });

  it('builds separate paths for repeated and inverse chunks and retains interruptions', async () => {
    const classify = await createPLLClassifier();
    const variants = chunkVariants([{ name: 'A', algorithm: 'R U' }], true);
    const tree = generateArrangements(variants, 2, classify);
    expect(tree).toHaveLength(1 + variants.length + variants.length ** 2);
    expect(tree[1].parent).toBe(0);
    expect(tree[1 + variants.length].parent).toBe(1);
    expect(tree[1 + variants.length].algorithm).toBe('R U R U');
    expect(tree.find(node => node.segment.description.includes('[R | A: R U | U]'))).toBeDefined();
    expect(() => generateArrangements(variants, 4, classify)).toThrow();
  });
});
