import { describe, it, expect, vi } from 'vitest';
import { useGraphScaling } from '../../src/composables/useGraphScaling';

describe('useGraphScaling', () => {
	it('scales all node positions about origin', () => {
		const initial = [
			{ id: 'a', position: { x: 10, y: 20 } },
			{ id: 'b', position: { x: -30, y: 40 } },
		];
		const setNodes = vi.fn((updater) => {
			const result = updater(initial as any);
			(setNodes as any).result = result;
		});
		const { scaleAll } = useGraphScaling(setNodes as any);
		scaleAll(0.5); // shrink toward origin
		const result = (setNodes as any).result;
		expect(result[0].position.x).toBe(5);
		expect(result[0].position.y).toBe(10);
		expect(result[1].position.x).toBe(-15);
		expect(result[1].position.y).toBe(20);
	});

	it('ignores invalid factors', () => {
		const initial = [ { id: 'a', position: { x: 10, y: 10 } } ];
		const setNodes = vi.fn((updater) => {
			const result = updater(initial as any);
			(setNodes as any).result = result;
		});
		const { scaleAll } = useGraphScaling(setNodes as any);
		scaleAll(0); // invalid
		expect(setNodes).not.toHaveBeenCalled();
	});
});
