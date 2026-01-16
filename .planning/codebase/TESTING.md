# Testing Guide

This document describes the testing patterns and infrastructure in the Rogue Recipe / Julienned codebase.

## Test Framework

### Current State

**No test framework is currently configured for this project.**

The project does not have:
- `jest.config.js` or `jest.config.ts`
- `vitest.config.ts`
- Any `*.test.*` or `*.spec.*` files in the source directories
- Test-related dependencies in `package.json`

### Recommended Setup

For a React Native + Expo + Convex project, the recommended testing stack would be:

#### Unit Testing
- **Jest** - Test runner (Expo compatible)
- **@testing-library/react-native** - Component testing
- **@testing-library/jest-native** - Custom matchers

#### Convex Backend Testing
- **Convex test utilities** - For testing queries/mutations
- **Mock functions** - For isolating action dependencies

#### E2E Testing (Optional)
- **Detox** or **Maestro** - For full mobile E2E tests

## Test File Organization

### Recommended Structure

```
src/
├── components/
│   ├── RecipeCard.tsx
│   └── __tests__/
│       └── RecipeCard.test.tsx
├── hooks/
│   ├── useTheme.tsx
│   └── __tests__/
│       └── useTheme.test.tsx
├── utils/
│   ├── dateUtils.ts
│   └── __tests__/
│       └── dateUtils.test.ts

convex/
├── recipes.ts
├── lib/
│   ├── utils.ts
│   └── toolHandlers.ts
└── __tests__/
    ├── recipes.test.ts
    └── lib/
        ├── utils.test.ts
        └── toolHandlers.test.ts
```

### Naming Convention

- Test files: `[module].test.ts` or `[module].test.tsx`
- Spec files: `[module].spec.ts` (alternative, not used here)
- Test directories: `__tests__/` adjacent to source

## Test Structure

### Recommended Pattern

```typescript
import { renderHook } from '@testing-library/react-native';
import { formatDuration, extractPassiveTime } from '../dateUtils';

describe('dateUtils', () => {
  describe('formatDuration', () => {
    it('formats minutes only', () => {
      expect(formatDuration(45)).toBe('45m');
    });

    it('formats hours and minutes', () => {
      expect(formatDuration(90)).toBe('1h 30m');
    });

    it('formats days and hours', () => {
      expect(formatDuration(1500)).toBe('1d 1h');
    });

    it('returns empty string for zero', () => {
      expect(formatDuration(0)).toBe('');
    });
  });

  describe('extractPassiveTime', () => {
    it('extracts rising time from instructions', () => {
      const instructions = ['Let rise for 2 hours.'];
      expect(extractPassiveTime(instructions)).toBe(120);
    });

    it('detects overnight chilling', () => {
      const instructions = ['Refrigerate overnight.'];
      expect(extractPassiveTime(instructions)).toBe(480);
    });
  });
});
```

## Mocking

### Convex Mocking

For testing Convex functions, mock the context:

```typescript
import { ActionCtx } from '../_generated/server';

const mockCtx: Partial<ActionCtx> = {
  runQuery: jest.fn(),
  runMutation: jest.fn(),
};
```

### API/Fetch Mocking

```typescript
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    text: () => Promise.resolve('<html>...</html>'),
    headers: {
      get: () => 'text/html',
    },
  })
);
```

### React Navigation Mocking

```typescript
const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
};

const mockRoute = {
  params: { recipeId: 'test-id' },
};
```

## Fixtures and Factories

### Recommended Pattern

Create test data factories for complex objects:

```typescript
// __tests__/factories/recipe.ts
export function createMockRecipe(overrides?: Partial<Recipe>): Recipe {
  return {
    _id: 'test-recipe-id',
    title: 'Test Recipe',
    ingredients: [
      { text: '2 cups flour', quantity: 2, unit: 'cups', item: 'flour' },
    ],
    instructions: ['Mix ingredients.', 'Bake at 350F.'],
    servings: 4,
    prepTime: 15,
    cookTime: 30,
    ...overrides,
  };
}

export function createMockIngredient(overrides?: Partial<ParsedIngredient>): ParsedIngredient {
  return {
    text: '1 cup sugar',
    quantity: 1,
    unit: 'cup',
    item: 'sugar',
    category: 'pantry',
    ...overrides,
  };
}
```

### Theme Provider Wrapper

```typescript
// __tests__/utils/testWrapper.tsx
import { ThemeProvider } from '../../hooks/useTheme';

export function TestWrapper({ children }: { children: React.ReactNode }) {
  return <ThemeProvider>{children}</ThemeProvider>;
}

// Usage
render(<RecipeCard {...props} />, { wrapper: TestWrapper });
```

## Coverage

### Recommended Configuration

```javascript
// jest.config.js (recommended setup)
module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    'convex/**/*.ts',
    '!**/node_modules/**',
    '!**/_generated/**',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@components/(.*)$': '<rootDir>/src/components/$1',
    '^@hooks/(.*)$': '<rootDir>/src/hooks/$1',
    '^@styles/(.*)$': '<rootDir>/src/styles/$1',
  },
};
```

## Test Types

### Unit Tests (Priority)

Focus on pure functions and isolated logic:

- `src/utils/dateUtils.ts` - Time formatting and parsing
- `src/utils/textUtils.ts` - Text manipulation
- `convex/lib/utils.ts` - URL normalization, hashing
- `convex/lib/toolHandlers.ts` - Ingredient parsing, classification

### Integration Tests

Test component interactions:

- Screen components with mocked navigation
- Hooks with mocked Convex client
- Theme provider integration

### Component Tests

Test UI behavior:

- RecipeCard - Press handling, rendering states
- ServingsAdjuster - Increment/decrement logic
- IngredientItem - Toggle state

### E2E Tests (Future)

Full user flows:

- Extract a recipe from URL
- Navigate recipe list
- Use cooking mode
- Add to shopping list

## Common Patterns

### Testing Hooks

```typescript
import { renderHook, act } from '@testing-library/react-native';
import { useTheme, ThemeProvider } from '../useTheme';

describe('useTheme', () => {
  const wrapper = ({ children }) => (
    <ThemeProvider>{children}</ThemeProvider>
  );

  it('provides light theme by default', () => {
    const { result } = renderHook(() => useTheme(), { wrapper });
    expect(result.current.isDark).toBe(false);
  });

  it('toggles theme', () => {
    const { result } = renderHook(() => useTheme(), { wrapper });

    act(() => {
      result.current.toggleTheme();
    });

    expect(result.current.isDark).toBe(true);
  });
});
```

### Testing Convex Functions (Conceptual)

```typescript
import { handleParseIngredient, handleClassifyIngredient } from '../toolHandlers';

describe('toolHandlers', () => {
  describe('handleParseIngredient', () => {
    it('parses quantity, unit, and item', () => {
      const result = handleParseIngredient('2 cups flour');

      expect(result).toEqual({
        text: '2 cups flour',
        quantity: 2,
        unit: 'cups',
        item: 'flour',
        category: 'pantry',
      });
    });

    it('handles fractions', () => {
      const result = handleParseIngredient('1/2 cup sugar');

      expect(result.quantity).toBe(0.5);
    });

    it('extracts preparation instructions', () => {
      const result = handleParseIngredient('2 cups flour, sifted');

      expect(result.preparation).toBe('sifted');
    });
  });

  describe('handleClassifyIngredient', () => {
    it('classifies produce', () => {
      expect(handleClassifyIngredient('tomatoes')).toBe('produce');
    });

    it('classifies spices over produce', () => {
      expect(handleClassifyIngredient('garlic powder')).toBe('spices');
    });

    it('classifies dairy', () => {
      expect(handleClassifyIngredient('mozzarella cheese')).toBe('dairy');
    });
  });
});
```

### Async Testing Pattern

```typescript
describe('handleFetchPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns HTML on success', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: () => Promise.resolve('<html>content</html>'),
      headers: { get: () => 'text/html' },
    });

    const result = await handleFetchPage('https://example.com/recipe');

    expect(result.success).toBe(true);
    expect(result.html).toBe('<html>content</html>');
  });

  it('handles HTTP errors', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found',
    });

    const result = await handleFetchPage('https://example.com/missing');

    expect(result.success).toBe(false);
    expect(result.error).toContain('404');
  });
});
```

## Setting Up Testing

To add testing to this project:

1. Install dependencies:
   ```bash
   npm install --save-dev jest jest-expo @testing-library/react-native @testing-library/jest-native
   ```

2. Create `jest.config.js` with the recommended configuration above

3. Add test scripts to `package.json`:
   ```json
   {
     "scripts": {
       "test": "jest",
       "test:watch": "jest --watch",
       "test:coverage": "jest --coverage"
     }
   }
   ```

4. Create setup file for Jest Native matchers

5. Start with utility functions (highest ROI, no mocking needed)
