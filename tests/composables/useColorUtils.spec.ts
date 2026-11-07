import { beforeEach, describe, expect, it } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useAlgPresetsStore } from '../../src/stores/algPresetsStore';
import { useColorUtils } from '../../src/composables/useColorUtils';

describe('algorithm label highlighting', () => {
  beforeEach(() => setActivePinia(createPinia()));

  it('handles commutator notation literally and escapes label content', () => {
    useAlgPresetsStore().replaceAllPresets([{ id: '1', name: 'commutator', algorithm: '[R, U]', color: '#123456' }]);
    const html = useColorUtils().colorizeLabel('[R, U] <img src=x>');
    expect(html).toContain('<span class="highlight"');
    expect(html).toContain('[R, U]');
    expect(html).toContain('&lt;img src=x&gt;');
    expect(html).not.toContain('<img');
  });
});
