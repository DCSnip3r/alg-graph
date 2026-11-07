import { describe, expect, it } from 'vitest';
import { Alg } from 'cubing/alg';
import { arrangementCount, chunkVariants, createPLLClassifier, PLL_ALGORITHMS } from '../../src/utils/pllExplorer';

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
  });

  it('preserves interrupted chunks and their inverse sequences', () => {
    const variants = chunkVariants([{ name: 'Sune', algorithm: "R U R' U R U2 R'" }, { name: 'U', algorithm: 'U' }], true);
    const interrupted = variants.find(v => v.description === 'Sune [after move 3: U]');
    expect(interrupted?.algorithm).toBe("R U R' U U R U2 R'");
    expect(variants.find(v => v.description === 'Sune⁻¹')?.algorithm).toBe(new Alg("R U R' U R U2 R'").invert().toString());
    expect(arrangementCount(4, 2)).toBe(20);
    expect(() => arrangementCount(20, 2)).toThrow();
    expect(() => chunkVariants([{ name: '', algorithm: 'R' }], false)).toThrow();
  });
});
