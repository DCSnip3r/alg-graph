import { ref } from 'vue';
import { KPattern, KPuzzle, KPuzzleDefinition } from 'cubing/kpuzzle';

export function useKPattern() {
	const definition = ref<KPuzzleDefinition>({
		defaultPattern: {
				// Define the properties of KPatternData here
				
		},
		moves: {
				// Define the properties of KTransformationData here

		},
		name: 'Example Puzzle',
		orbits: [
				// Define the properties of KPuzzleOrbitDefinition here

		]
});
    const pattern = ref<KPattern>(new KPattern(new KPuzzle(definition), 'default'));
    const encodedPattern = ref<string>('');

    const applyAlgorithm = (alg: string) => {
        pattern.value.apply(alg);
    };

    const resetPattern = () => {
        pattern.value.reset();
    };

    const encodePattern = () => {
        encodedPattern.value = pattern.value.toString();
    };

    const decodePattern = (encoded: string) => {
        pattern.value = KPattern.fromString(encoded);
    };

    const comparePatterns = (patternToCompare: KPattern) => {
        return pattern.value.equals(patternToCompare);
    };

    return {
        pattern,
        encodedPattern,
        applyAlgorithm,
        resetPattern,
        encodePattern,
        decodePattern,
        comparePatterns
    };
}
