import { KPuzzle, KPattern, KPuzzleDefinition } from 'cubing/kpuzzle';
import { ref } from 'vue';

export function useAlgComparison() {
    const areAlgorithmsEqual = ref<boolean | null>(null);

    const compareAlgorithms = (alg1: string, alg2: string) => {
        // Create KPuzzle instances with the provided algorithms
        const puzzleDefinition: KPuzzleDefinition = {
            name: 'example',
            orbits: [],
            defaultPattern: {},
            moves: {}
        };

        const patternData1 = {}; // Replace with actual pattern data if available
        const patternData2 = {}; // Replace with actual pattern data if available

        const puzzle1 = new KPuzzle(puzzleDefinition);
        const puzzle2 = new KPuzzle(puzzleDefinition);

        const pattern1 = new KPattern(puzzle1, patternData1);
        const pattern2 = new KPattern(puzzle2, patternData2);

        // Initialize the start state
        puzzle1.applyPattern(pattern1);

        // Apply the first algorithm
        puzzle1.applyPattern(startState);
        puzzle2.applyPattern(pattern2);

        // Apply the second algorithm
        puzzle2.applyPattern(startState);
        const resultState2 = startState.clone();

        // Compare the resulting states
        areAlgorithmsEqual.value = resultState1.equals(resultState2);
    };

    return {
        areAlgorithmsEqual,
        compareAlgorithms
    };
}
