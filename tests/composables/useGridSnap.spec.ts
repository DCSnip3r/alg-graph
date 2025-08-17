import { describe, it, expect, vi } from 'vitest';
import { useGridSnap } from '../../src/composables/useGridSnap';

describe('useGridSnap', () => {
  it('snaps nodes to nearest grid multiple', () => {
    const initial = [
      { id: 'a', position: { x: 13, y: 74 } },
      { id: 'b', position: { x: 151, y: 224 } },
    ];
    const setNodes = vi.fn((updater) => {
      const result = updater(initial as any);
      (setNodes as any).result = result;
    });
    const { snapAll } = useGridSnap(setNodes as any);
    snapAll(75);
    const result = (setNodes as any).result;
    expect(result[0].position.x).toBe(0); // 13 -> 0
    expect(result[0].position.y).toBe(75); // 74 -> 75
    expect(result[1].position.x).toBe(150); // 151 -> 150
    expect(result[1].position.y).toBe(225); // 224 -> 225
  });
});
