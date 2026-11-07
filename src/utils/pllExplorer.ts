import { Alg } from 'cubing/alg';
import { cube3x3x3 } from 'cubing/puzzles';

export interface Chunk {
  name: string;
  algorithm: string;
}

export interface Arrangement {
  description: string;
  algorithm: string;
}

export interface ArrangementNode {
  parent: number | null;
  depth: number;
  segment: Arrangement;
  algorithm: string;
  pll: string | null;
}

// Familiar representatives; see https://github.com/alonswartz/cube/tree/c6d9eee0e2af1a20a921b1697e686a60d964d79b/src/algs
export const PLL_ALGORITHMS: Record<string, string> = {
  Aa: "x L2 D2 L' U' L D2 L' U L'",
  Ab: "x' L2 D2 L U L' D2 L U' L",
  E: "x' L' U L D' L' U' L D L' U' L D' L' U L D",
  F: "R' U' F' R U R' U' R' F R2 U' R' U' R U R' U R",
  Ja: "x R2 F R F' R U2 r' U r U2",
  Jb: "R U R' F' R U R' U' R' F R2 U' R'",
  Ra: "R U' R' U' R U R D R' U' R D' R' U2 R'",
  Rb: "R2 F R U R U' R' F' R U2 R' U2 R",
  T: "R U R' U' R' F R2 U' R' U' R U R' F'",
  Y: "F R U' R' U' R U R' F' R U R' U' R' F R F'",
  V: "R' U R' U' y R' F' R2 U' R' U R' F R F",
  Na: "R U R' U R U R' F' R U R' U' R' F R2 U' R' U2 R U' R'",
  Nb: "R' U R U' R' F' U' F R U R' F R' F' R U' R",
  Ga: "R2 U R' U R' U' R U' R2 U' D R' U R D'",
  Gb: "R' U' R U D' R2 U R' U R U' R U' R2 D",
  Gc: "R2 U' R U' R U R' U R2 U D' R U' R' D",
  Gd: "R U R' U' D R2 U' R U' R' U R' U R2 D'",
  H: "M2 U M2 U2 M2 U M2",
  Z: "M' U M2 U M2 U M' U2 M2",
  Ua: "M2 U M U2 M' U M2",
  Ub: "M2 U' M U2 M' U' M2",
};

const auf = ['', 'U', 'U2', "U'"];
const MAX_NODES = 200;

export function chunkVariants(chunks: Chunk[], interrupted: boolean): Arrangement[] {
  const variants = chunks.flatMap(({ name, algorithm }) => {
    const alg = new Alg(algorithm);
    let moveCount = 0;
    for (const _move of alg.experimentalLeafMoves()) {
      if (++moveCount > 40) throw new Error('Each chunk is limited to 40 moves.');
    }
    if (!name.trim() || !moveCount) {
      throw new Error('Each chunk needs a name and a non-empty algorithm.');
    }
    return [
      { description: name.trim(), algorithm: alg.toString() },
      { description: `${name.trim()}⁻¹`, algorithm: alg.invert().toString() },
    ];
  });
  if (!variants.length) throw new Error('Add at least one chunk.');
  if (!interrupted) return variants;

  const result = [...variants];
  for (const outer of variants) {
    const moves = [...new Alg(outer.algorithm).experimentalLeafMoves()].map(String);
    for (let split = 1; split < moves.length; split++) {
      for (const inner of variants) {
        result.push({
          description: `${outer.description} [${moves.slice(0, split).join(' ')} | ${inner.description}: ${inner.algorithm} | ${moves.slice(split).join(' ')}]`,
          algorithm: [...moves.slice(0, split), inner.algorithm, ...moves.slice(split)].join(' '),
        });
        if (result.length > MAX_NODES) throw new Error('Too many chunk variants; use fewer or shorter chunks.');
      }
    }
  }
  return result;
}

export function arrangementCount(branches: number, depth: number): number {
  if (!Number.isInteger(depth) || depth < 1 || depth > 4) throw new Error('Depth must be between 1 and 4.');
  let total = 0;
  for (let i = 1; i <= depth; i++) total += branches ** i;
  if (total > MAX_NODES) throw new Error(`This exploration exceeds ${MAX_NODES} nodes; reduce chunks, interruptions, or depth.`);
  return total;
}

export function generateArrangements(
  variants: Arrangement[],
  depth: number,
  classify: (algorithm: string) => string | null,
): ArrangementNode[] {
  if (!variants.length) throw new Error('Add at least one chunk.');
  arrangementCount(variants.length, depth);
  const result: ArrangementNode[] = [{
    parent: null, depth: 0, segment: { description: 'Solved', algorithm: '' }, algorithm: '', pll: 'Solved',
  }];
  let level = [0];
  for (let d = 1; d <= depth; d++) {
    const next: number[] = [];
    for (const parent of level) for (const segment of variants) {
      const algorithm = new Alg(result[parent].algorithm).concat(new Alg(segment.algorithm))
        .experimentalSimplify({ cancel: true }).toString();
      next.push(result.length);
      result.push({ parent, depth: d, segment, algorithm, pll: classify(algorithm) });
    }
    level = next;
  }
  return result;
}

type CubePattern = ReturnType<Awaited<ReturnType<typeof cube3x3x3.kpuzzle>>['defaultPattern']>;

function key(pattern: CubePattern): string {
  return JSON.stringify(pattern.patternData);
}

let classifierPromise: Promise<(algorithm: string) => string | null> | undefined;

export function createPLLClassifier(): Promise<(algorithm: string) => string | null> {
  if (!classifierPromise) classifierPromise = buildClassifier().catch(error => {
    classifierPromise = undefined;
    throw error;
  });
  return classifierPromise;
}

async function buildClassifier(): Promise<(algorithm: string) => string | null> {
  const puzzle = await cube3x3x3.kpuzzle();
  const solved = puzzle.defaultPattern();
  const centerKey = (pattern: CubePattern) => pattern.patternData.CENTERS.pieces.join(',');
  const rotations: Alg[] = [new Alg()];
  const centers = new Set([centerKey(solved)]);
  for (let i = 0; i < rotations.length; i++) {
    for (const move of ['x', 'y', 'z']) {
      const next = rotations[i].concat(new Alg(move));
      const center = centerKey(solved.applyAlg(next));
      if (!centers.has(center)) {
        centers.add(center);
        rotations.push(next);
      }
    }
  }
  const normalize = (pattern: CubePattern): CubePattern => {
    const rotation = rotations.find(r => centerKey(pattern.applyAlg(r)) === centerKey(solved));
    if (!rotation) throw new Error('Cannot normalize cube orientation.');
    return pattern.applyAlg(rotation);
  };
  const cases = new Map<string, string>();
  for (const [name, algorithm] of Object.entries({ Solved: '', ...PLL_ALGORITHMS })) {
    const normalized = normalize(solved.applyAlg(algorithm));
    // Applying a reference to the solved cube followed by this rotation produces
    // the same transformation as its center-normalized algorithm.
    const correction = rotations.find(r => centerKey(solved.applyAlg(algorithm).applyAlg(r)) === centerKey(solved))!;
    const reference = new Alg(algorithm).concat(correction);
    if (!normalized.isIdentical(solved.applyAlg(reference))) throw new Error(`Invalid reference: ${name}`);
    for (const rotation of rotations) {
      for (const before of auf) for (const after of auf) {
        const alg = new Alg(rotation.toString()).concat(new Alg(before)).concat(reference)
          .concat(new Alg(after)).concat(rotation.invert());
        const signature = key(solved.applyAlg(alg));
        const previous = cases.get(signature);
        if (previous && previous !== name) throw new Error(`PLL references overlap: ${previous} and ${name}`);
        cases.set(signature, name);
      }
    }
  }
  return (algorithm: string) => cases.get(key(normalize(solved.applyAlg(algorithm)))) ?? null;
}
