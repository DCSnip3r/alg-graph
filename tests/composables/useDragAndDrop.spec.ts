import { describe, it, expect, vi } from 'vitest';
import { useDragAndDrop } from '../../src/composables/useDragAndDrop';

describe('useDragAndDrop', () => {
  const mockScreenToFlowCoordinate = vi.fn(() => ({ x: 100, y: 100 }));
  const mockAddNodes = vi.fn();
  const mockGetNextNodeId = vi.fn(() => 'n-1');

  const { onDrop } = useDragAndDrop(mockScreenToFlowCoordinate, mockAddNodes, mockGetNextNodeId);

  it.skip('should add a new node on drop', () => {
    const mockEvent = {
      clientX: 50,
      clientY: 50,
      dataTransfer: {
        getData: vi.fn(() => JSON.stringify({ algorithm: 'R U R\'', name: 'Test', color: '#ff0000' })),
      },
      preventDefault: vi.fn(),
    };

    onDrop(mockEvent as unknown as DragEvent);
    expect(mockAddNodes).toHaveBeenCalledWith([
      expect.objectContaining({ data: { alg: 'R U R\'', label: 'Test' } }),
    ]);
  });
});
