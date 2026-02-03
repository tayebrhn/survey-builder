# Key Choice Feature - Addition Summary

## What is Key Choice?

Key Choices are global reference keys that can be used for logic or referencing across the survey. They consist of:
- **Key**: A unique identifier (e.g., `AGREE_STRONGLY`, `OPTION_A`)
- **Description**: A human-readable description of what the key represents

## Files Updated

### 1. useSurvey.ts (Hook)
Added three new functions:
- `addKeyChoice()` - Adds a new empty key choice
- `updateKeyChoice(index, field, value)` - Updates a specific key choice field
- `removeKeyChoice(index)` - Removes a key choice by index

### 2. SettingsTab.tsx (Component)
Added:
- New props: `onAddKeyChoice`, `onUpdateKeyChoice`, `onRemoveKeyChoice`
- New UI section: "Key Choices" with:
  - List of existing key choices (key + description inputs)
  - Add button for new key choices
  - Delete button for each key choice
  - Empty state message when no key choices exist

### 3. SurveyBuilder.tsx (Main Component)
Updated to:
- Destructure the three new key choice handlers from `useSurvey` hook
- Pass these handlers as props to `SettingsTab`

### 4. Documentation
Updated:
- **README.md**: Added key choice management to feature list and usage examples
- **STRUCTURE.md**: Added key choices to component hierarchy and responsibility matrix

## Usage Example

```tsx
import { useSurvey } from './hooks/useSurvey';

function MyComponent() {
  const { 
    survey, 
    addKeyChoice, 
    updateKeyChoice, 
    removeKeyChoice 
  } = useSurvey();

  // Add a new key choice
  const handleAdd = () => {
    addKeyChoice();
  };

  // Update a key choice
  const handleUpdate = (index: number) => {
    updateKeyChoice(index, "key", "NEW_KEY_VALUE");
    updateKeyChoice(index, "description", "New description");
  };

  // Remove a key choice
  const handleRemove = (index: number) => {
    removeKeyChoice(index);
  };

  return (
    <div>
      {survey.key_choice.map((choice, idx) => (
        <div key={idx}>
          <span>{choice.key}</span>
          <span>{choice.description}</span>
          <button onClick={() => handleRemove(idx)}>Remove</button>
        </div>
      ))}
      <button onClick={handleAdd}>Add Key Choice</button>
    </div>
  );
}
```

## UI Screenshot Description

The Key Choices section appears in the Settings tab with:

1. **Header**: "Key Choices" title with subtitle "Global keys for logic or referencing"
2. **Empty State**: Shows "No key choices defined." when list is empty
3. **Key Choice Rows**: Each row contains:
   - Key input (1/3 width, monospace font)
   - Description input (2/3 width, regular font)
   - Delete button (trash icon)
4. **Add Button**: Blue "Add Key Choice" button at the bottom

## Data Structure

```typescript
// In SurveyExport type
interface SurveyExport {
  // ... other fields
  key_choice: Array<{
    key: string;
    description: string;
  }>;
}
```

## Feature Complete ✅

All key_choice functionality from the original file has been successfully refactored and integrated into the modular component structure.
