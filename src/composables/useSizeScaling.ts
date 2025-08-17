import { computed } from 'vue';
import { useDisplaySettingsStore } from '../stores/displaySettingsStore';

/**
 * Composable for scaling UI elements relative to the configurable twisty node size.
 * Baseline is the original hard-coded 350px cube viewer dimension.
 */
export function useSizeScaling(baseline = 350) {
	const displaySettingsStore = useDisplaySettingsStore();
	const rawSize = computed(() => displaySettingsStore.twistyNodeSize);
	const scale = computed(() => rawSize.value / baseline);

	const clamp = (v: number, min?: number, max?: number) => {
		if (min !== undefined) v = Math.max(min, v);
		if (max !== undefined) v = Math.min(max, v);
		return v;
	};

	const scaled = (value: number, options?: { min?: number; max?: number }) => {
		return clamp(value * scale.value, options?.min, options?.max);
	};

	const scaledPx = (value: number, options?: { min?: number; max?: number }) => {
		return scaled(value, options) + 'px';
	};

	const scaledEm = (value: number, options?: { min?: number; max?: number }) => {
		return clamp(value * scale.value, options?.min, options?.max).toFixed(3) + 'em';
	};

	/** Generate style object for a square icon/button that should scale. */
	const scaledSquareButton = (baseSize: number, baseFont: number, opts?: { minSize?: number; maxSize?: number; minFont?: number; maxFont?: number }) => {
		const sizeNum = scaled(baseSize, { min: opts?.minSize, max: opts?.maxSize });
		const fontNum = scaled(baseFont, { min: opts?.minFont, max: opts?.maxFont });
		return {
			width: sizeNum + 'px',
			height: sizeNum + 'px',
			fontSize: fontNum + 'px',
			lineHeight: 1,
		} as const;
	};

	return { scale, rawSize, scaled, scaledPx, scaledEm, scaledSquareButton };
}

export type UseSizeScalingReturn = ReturnType<typeof useSizeScaling>;
