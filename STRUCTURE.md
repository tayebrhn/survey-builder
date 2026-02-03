# Survey Builder - File Structure Overview

## 📊 Component Hierarchy

```
SurveyBuilder (Main)
│
├─── Header (Save Button)
│
├─── Navigation Tabs
│    ├─── Settings Tab
│    ├─── Questions Tab  
│    ├─── Skip Logic Tab
│    └─── JSON Tab
│
└─── Content Area
     │
     ├─── SettingsTab
     │    ├─── Metadata Form (title, description, etc.)
     │    └─── Categories List
     │
     ├─── QuestionsTab
     │    └─── QuestionEditor (for each question)
     │         ├─── Question Config (type, category, required)
     │         └─── RecursiveOptionEditor
     │              └─── RecursiveOptionEditor (nested)
     │
     ├─── SkipLogicTab
     │    └─── Skip Logic Rules (conditionals)
     │
     └─── JsonTab
          └─── JSON Preview
```

## 🔄 Data Flow

```
User Action
    ↓
SurveyBuilder Component
    ↓
useSurvey Hook (State Management)
    ↓
Update Survey State
    ↓
Re-render Child Components
    ↓
UI Updates
```

## 📦 Import Dependencies

### SurveyBuilder.tsx
```typescript
imports:
  - useSurvey (hook)
  - SettingsTab (component)
  - QuestionsTab (component)
  - SkipLogicTab (component)
  - JsonTab (component)
  - Icons from lucide-react
```

### Components
```typescript
SettingsTab.tsx
  imports: types, icons

QuestionsTab.tsx
  imports: QuestionEditor, types, icons

QuestionEditor.tsx
  imports: RecursiveOptionEditor, types, constants, icons

RecursiveOptionEditor.tsx
  imports: types, constants, icons

SkipLogicTab.tsx
  imports: types, icons

JsonTab.tsx
  imports: types
```

### Hook
```typescript
useSurvey.ts
  imports: types, constants
  exports: all state management functions
```

## 🎯 Responsibility Matrix

| File | Responsibility | State | UI |
|------|---------------|-------|-----|
| **SurveyBuilder** | Orchestration, tab management | Local (activeTab) | ✅ Main layout |
| **useSurvey** | Survey state management | ✅ Survey data | ❌ |
| **SettingsTab** | Metadata & categories UI | ❌ | ✅ Settings form |
| **QuestionsTab** | Questions list UI | ❌ | ✅ Questions list |
| **QuestionEditor** | Single question UI | ❌ | ✅ Question form |
| **RecursiveOptionEditor** | Nested options UI | ❌ | ✅ Options tree |
| **SkipLogicTab** | Logic rules UI | ❌ | ✅ Rules form |
| **JsonTab** | JSON preview UI | ❌ | ✅ JSON display |
| **constants** | Initial state & factories | ❌ | ❌ |

## 📝 File Sizes (Comparison)

```
Original:
  SurveyBuilder.tsx: ~840 lines

Refactored:
  SurveyBuilder.tsx:     ~115 lines (-86%)
  useSurvey.ts:          ~110 lines
  SettingsTab.tsx:       ~120 lines
  QuestionsTab.tsx:      ~55 lines
  QuestionEditor.tsx:    ~155 lines
  RecursiveOptionEditor: ~120 lines
  SkipLogicTab.tsx:      ~190 lines
  JsonTab.tsx:           ~15 lines
  constants.ts:          ~45 lines
  index.ts:              ~10 lines
  ────────────────────────────────
  Total:                 ~935 lines (+11% for better organization)
```

The slight increase in total lines is due to:
- Proper file separation
- Import/export statements
- Better documentation
- Improved type safety
