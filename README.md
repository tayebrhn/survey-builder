# Survey Builder - Refactored Structure

This project has been refactored from a single large file into a modular, maintainable structure.

## 📁 File Structure

```
survey-builder/
├── SurveyBuilder.tsx          # Main component (entry point)
├── index.ts                    # Export barrel file
├── constants.ts                # Constants and initial state
├── components/
│   ├── RecursiveOptionEditor.tsx   # Recursive option editor for nested options
│   ├── QuestionEditor.tsx          # Individual question editor
│   ├── SettingsTab.tsx             # Survey settings and metadata tab
│   ├── QuestionsTab.tsx            # Questions management tab
│   ├── SkipLogicTab.tsx            # Skip logic rules tab
│   └── JsonTab.tsx                 # JSON output preview tab
├── hooks/
│   └── useSurvey.ts           # Custom hook for survey state management
└── types.ts                    # TypeScript type definitions (existing)
```

## 🧩 Components

### Main Component
- **SurveyBuilder.tsx**: The main orchestrator component that manages tabs and renders the appropriate child components

### Tab Components
- **SettingsTab**: Manages survey metadata (title, description, instructions), question categories, and key choices
- **QuestionsTab**: Displays and manages the list of survey questions
- **SkipLogicTab**: Handles conditional logic rules for question flow
- **JsonTab**: Displays the final JSON output for the survey

### Shared Components
- **QuestionEditor**: Renders a single question with all its configuration options
- **RecursiveOptionEditor**: Handles nested option editing for questions with sub-options (radio, checkbox, etc.)

## 🎣 Custom Hooks

### useSurvey
Manages all survey state and provides functions for:
- Updating metadata
- Managing categories
- Managing key choices (global reference keys)
- CRUD operations for questions
- Managing skip logic rules
- Saving/exporting the survey

## 🔧 Utilities

### constants.ts
Contains:
- `generateId()`: Generates unique IDs
- `createEmptyOption()`: Creates a new option object
- `createEmptyQuestion()`: Creates a new question object
- `initialSurveyState`: Default survey state

## 📦 Usage

### Basic Import
```tsx
import SurveyBuilder from './SurveyBuilder';

function App() {
  return <SurveyBuilder />;
}
```

### Using Individual Components
```tsx
import { SettingsTab, useSurvey } from './';

function CustomSurvey() {
  const { 
    survey, 
    updateMetadata, 
    addCategory, 
    updateCategory,
    addKeyChoice,
    updateKeyChoice,
    removeKeyChoice
  } = useSurvey();
  
  return (
    <SettingsTab
      survey={survey}
      onUpdateMetadata={updateMetadata}
      onAddCategory={addCategory}
      onUpdateCategory={updateCategory}
      onAddKeyChoice={addKeyChoice}
      onUpdateKeyChoice={updateKeyChoice}
      onRemoveKeyChoice={removeKeyChoice}
    />
  );
}
```

## 🎯 Benefits of This Structure

1. **Separation of Concerns**: Each component has a single, well-defined responsibility
2. **Reusability**: Components can be used independently or combined in different ways
3. **Maintainability**: Easier to locate and modify specific functionality
4. **Testability**: Each component and hook can be tested in isolation
5. **Scalability**: New features can be added without affecting existing code
6. **Type Safety**: Full TypeScript support with proper type definitions
7. **State Management**: Centralized state logic in a custom hook

## 🔄 Migration Notes

The refactored code maintains 100% feature parity with the original implementation while providing:
- Better code organization
- Improved developer experience
- Easier debugging and maintenance
- Better performance (potential for component-level optimizations)

## 🚀 Next Steps

Consider these potential improvements:
- Add drag-and-drop for question reordering
- Implement undo/redo functionality
- Add form validation
- Create a preview mode for the survey
- Add export to different formats (PDF, CSV, etc.)
- Implement auto-save functionality
- Add keyboard shortcuts
