# Composable Test Specs

Dedicated subfolder housing unit tests for each composable. Mirrors filenames in `src/composables` to keep mental mapping trivial.

## Conventions
* File name: `useXyz.spec.ts`.
* Arrange-Act-Assert pattern inside each test.
* Use factory helpers for common test data (consider adding a `testUtils` module if repetition grows).

## Mocking Tips
* Vue Flow callbacks: supply simple jest/vitest spies or inline lambdas storing arguments to arrays for later assertions.
* localStorage: leverage Vitest jsdom environment; clear between tests.
