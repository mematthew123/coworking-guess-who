# Portable Text Editor Reference Guide

This document provides a comprehensive reference for the Portable Text Editor repository. It's designed to help Claude understand the codebase structure, architecture, and APIs when working with this editor in other projects.

## Repository Overview

The Portable Text Editor is a highly customizable rich text editor for structured content, built on top of Slate.js and designed specifically for working with Portable Text - a JSON-based rich text specification used by Sanity.io.

### Key Features
- **State Machine Architecture**: Uses XState for predictable state management
- **Behavior-Driven**: Modular, composable behaviors for handling editor events
- **Real-time Collaboration Ready**: Patch-based architecture supports collaborative editing
- **Fully Typed**: Comprehensive TypeScript support
- **Extensible**: Plugin system and customizable rendering
- **Cross-Platform**: Keyboard shortcuts adapt to user's platform

## Repository Structure

```
editor/
├── packages/                    # Core packages (monorepo)
│   ├── editor/                 # Main editor package
│   ├── toolbar/                # Pre-built toolbar components
│   ├── keyboard-shortcuts/     # Platform-aware keyboard handling
│   ├── patches/                # Patch-based state management
│   ├── block-tools/            # HTML/Portable Text conversion
│   └── racejar/                # BDD testing framework
├── apps/                       # Applications
│   ├── docs/                   # Documentation site
│   └── playground/             # Development playground
├── examples/                   # Example implementations
│   ├── basic/                  # Basic editor example
│   └── legacy/                 # Legacy API example
└── [config files]              # Build, lint, test configuration
```

## Core Packages

### @portabletext/editor (v1.58.0)
The main editor implementation with React components and state management.

**Key Exports:**
- `EditorProvider` - Main context provider
- `PortableTextEditable` - Editable component
- `defineSchema` - Schema definition helper
- `useEditor` - Hook to access editor instance
- `PortableTextEditor` - Static API methods (legacy)
- Selectors, behaviors, plugins, and utilities

### @portabletext/toolbar (v1.0.7)
Pre-built React hooks for creating editor toolbars.

**Key Hooks:**
- `useAnnotationButton` / `useAnnotationPopover`
- `useBlockObjectButton` / `useBlockObjectPopover`
- `useDecoratorButton`
- `useHistoryButtons`
- `useListButton`
- `useStyleSelector`

### @portabletext/keyboard-shortcuts (v1.1.0)
Platform-aware keyboard shortcut management.

**Features:**
- Automatic platform detection (Mac vs Windows/Linux)
- Common shortcuts pre-defined
- Zero runtime dependencies

### @portabletext/patches (v1.1.5)
Patch-based document change management.

**Key Functions:**
- `applyPatch` - Apply patches to documents
- Patch creation and manipulation utilities

### @portabletext/block-tools (v1.1.38)
Utilities for HTML/Portable Text conversion.

**Key Functions:**
- `htmlToBlocks` - Convert HTML to Portable Text
- `normalizeBlock` - Normalize block structure
- Support for Google Docs, Word, Notion preprocessing

## Architecture

### State Machine Architecture
The editor uses XState actors for state management:

1. **EditorActor** - Central state machine managing edit modes and events
2. **MutationActor** - Handles document mutations and patch generation
3. **SyncActor** - Synchronizes with external value changes
4. **RelayActor** - Event bus for communication between actors

### Behavior System
Behaviors are modular units that respond to editor events:

```typescript
const behavior = defineBehavior({
  on: 'insert.text',              // Event trigger
  guard: ({event}) => boolean,    // Optional condition
  actions: [() => operations]     // Operations to perform
})
```

### Event Types
- **Synthetic Events**: Programmatic operations (`insert.text`, `delete`, etc.)
- **Native Events**: Browser events (`clipboard.copy`, `keyboard.keydown`, etc.)
- **Custom Events**: Application-specific behaviors

## Core Components

### EditorProvider
Sets up the editor context with configuration:

```tsx
<EditorProvider initialConfig={{
  schemaDefinition: schema,  // or schema: sanitySchema
  readOnly: false,
  initialValue: [],
  keyGenerator: () => nanoid()
}}>
```

### PortableTextEditable
The editable component with customizable rendering:

```tsx
<PortableTextEditable
  renderBlock={renderBlock}
  renderChild={renderChild}
  renderAnnotation={renderAnnotation}
  renderDecorator={renderDecorator}
  renderStyle={renderStyle}
  renderListItem={renderListItem}
  rangeDecorations={rangeDecorations}
  hotkeys={hotkeyOptions}
/>
```

## Schema Definition

Define the content structure:

```typescript
const schema = defineSchema({
  decorators: [
    {name: 'strong', title: 'Bold'},
    {name: 'em', title: 'Italic'}
  ],
  annotations: [
    {name: 'link', fields: [{name: 'href', type: 'string'}]}
  ],
  styles: [
    {name: 'normal', title: 'Normal'},
    {name: 'h1', title: 'Heading 1'},
    {name: 'h2', title: 'Heading 2'}
  ],
  lists: [
    {name: 'bullet', title: 'Bullet'},
    {name: 'number', title: 'Numbered'}
  ],
  inlineObjects: [
    {name: 'emoji', fields: [{name: 'code', type: 'string'}]}
  ],
  blockObjects: [
    {name: 'image', fields: [{name: 'src', type: 'string'}]}
  ]
})
```

## Key APIs

### Editor Instance API
Access via `useEditor()` hook:

```typescript
const editor = useEditor()

// Send events
editor.send({ type: 'decorator.toggle', decorator: 'strong' })

// Get snapshot
const snapshot = editor.getSnapshot()

// Subscribe to changes
editor.subscribe(snapshot => {
  console.log('Editor state:', snapshot.value)
})
```

### Static PortableTextEditor API (Legacy)
For backward compatibility:

```typescript
// Selection
PortableTextEditor.getSelection(editor)
PortableTextEditor.select(editor, selection)

// Content manipulation
PortableTextEditor.insertBlock(editor, type, value)
PortableTextEditor.delete(editor, selection)

// Formatting
PortableTextEditor.toggleMark(editor, 'strong')
PortableTextEditor.toggleBlockStyle(editor, 'h1')

// State queries
PortableTextEditor.isMarkActive(editor, 'strong')
PortableTextEditor.hasBlockStyle(editor, 'h1')
```

### Selectors
Query editor state:

```typescript
import * as selectors from '@portabletext/editor'

// Selection selectors
selectors.getSelection(snapshot)
selectors.isSelectionCollapsed(snapshot)
selectors.getSelectedBlocks(snapshot)

// Active state selectors
selectors.getActiveStyle(snapshot)
selectors.getActiveAnnotations(snapshot)
selectors.isActiveDecorator(snapshot, 'strong')

// Position selectors
selectors.isAtTheStartOfBlock(snapshot)
selectors.isAtTheEndOfBlock(snapshot)
```

## Type System

### Core Types

```typescript
// Selection representation
type EditorSelection = {
  anchor: EditorSelectionPoint
  focus: EditorSelectionPoint
  backward?: boolean
} | null

// Selection point
type EditorSelectionPoint = {
  path: Path
  offset: number
}

// Path types
type BlockPath = [{_key: string}]
type ChildPath = [{_key: string}, 'children', {_key: string}]
type AnnotationPath = [{_key: string}, 'markDefs', {_key: string}]

// Change events
type EditorChange = 
  | MutationChange
  | SelectionChange
  | FocusChange
  | ValueChange
  | PatchChange
```

### Content Types

```typescript
// Block structure
type PortableTextBlock = {
  _type: string
  _key: string
  children: PortableTextChild[]
  markDefs?: PortableTextAnnotation[]
  style?: string
  listItem?: string
}

// Text span
type PortableTextSpan = {
  _type: 'span'
  _key: string
  text: string
  marks?: string[]
}
```

## Common Patterns

### Creating a Basic Editor

```tsx
import {
  EditorProvider,
  PortableTextEditable,
  defineSchema
} from '@portabletext/editor'

const schema = defineSchema({
  styles: [{name: 'normal'}],
  decorators: [{name: 'strong'}, {name: 'em'}]
})

function MyEditor() {
  return (
    <EditorProvider initialConfig={{ schemaDefinition: schema }}>
      <PortableTextEditable />
    </EditorProvider>
  )
}
```

### Custom Toolbar

```tsx
import { useEditor } from '@portabletext/editor'
import { useDecoratorButton } from '@portabletext/toolbar'

function Toolbar() {
  const editor = useEditor()
  const strongButton = useDecoratorButton({ name: 'strong' })
  
  return (
    <button
      onClick={strongButton.onClick}
      disabled={strongButton.disabled}
      data-active={strongButton.active}
    >
      Bold
    </button>
  )
}
```

### Custom Behavior

```tsx
import { defineBehavior } from '@portabletext/editor'

const autoCapitalize = defineBehavior({
  on: 'insert.text',
  guard: ({event, context}) => {
    // Only at start of sentences
    return event.text === ' ' && context.isAfterPeriod
  },
  actions: [
    () => [{
      type: 'text.capitalize',
      // Custom operation
    }]
  ]
})
```

## Build and Development

### Scripts
- `pnpm dev` - Start development servers
- `pnpm build` - Build all packages
- `pnpm test` - Run tests
- `pnpm check:types` - Type checking
- `pnpm check:lint` - Linting with Biome

### Testing
- Unit tests with Vitest
- E2E tests with Playwright
- BDD tests with Gherkin (via racejar)

### Key Dependencies
- **React**: UI framework
- **Slate.js**: Core editing engine
- **XState**: State management
- **Immer**: Immutable updates
- **Lodash**: Utilities

## Migration Notes

### From Legacy API
The editor supports both modern (hooks-based) and legacy (static methods) APIs. The legacy `PortableTextEditor` static methods are maintained for backward compatibility but the hooks-based approach is recommended for new projects.

### From Sanity Schema
The editor accepts both custom schema definitions (`schemaDefinition`) and Sanity schemas (`schema`). When using Sanity schemas, the editor automatically extracts the relevant portable text configuration.

## Troubleshooting

### Common Issues

1. **Selection not updating**: Ensure you're using controlled selection properly
2. **Behaviors not firing**: Check event names and guard conditions
3. **Rendering issues**: Verify custom render functions return valid React elements
4. **Type errors**: Import types from main package export

### Debug Mode
Enable debug logging:
```typescript
import { setDebugMode } from '@portabletext/editor'
setDebugMode(true)
```

## Resources

- [Official Documentation](https://github.com/portabletext/editor)
- [Portable Text Specification](https://github.com/portabletext/portabletext)
- [Sanity.io Documentation](https://www.sanity.io/docs/block-content)

---

This reference guide provides a comprehensive overview of the Portable Text Editor for use in other projects. The editor is actively maintained and follows semantic versioning.