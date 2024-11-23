import { Alg } from 'cubing/alg';

export function useAlg(algorithm: string) {
  const alg = new Alg(algorithm);
  return alg;
}