# Change Log

All notable changes to the "bembajs-language-support" extension will be documented in this file.

## [1.3.2] - 2025-11-24

### Fixed
- **Icon Display** - Fixed rectangle icons issue by simplifying icon theme to only define .bemba file icons, allowing VS Code to use default icons for other file types

## [1.3.1] - 2025-11-24

### Fixed
- **VS Code Compatibility** - Fixed compatibility issue with VS Code 1.99.3 by updating engine requirements to ^1.80.0
- **Icons** - Added comprehensive icon support for .bemba files and common file types (.js, .ts, .json, .html, .css, etc.)

## [1.3.0] - 2025-01-28

### Added
- **Control Flow Syntax** - Full support for conditionals, loops, and error handling
- **Conditional Statements** - `ngati`, `kapena` keywords with syntax highlighting
- **Loop Statements** - `kwa`, `pamene` keywords for iteration
- **Error Handling** - `linga`, `kwata`, `paumalilo` keywords for try/catch/finally
- **Async/Await Support** - `lombako`, `leka` keywords for asynchronous operations
- **Chakra UI Snippets** - Code snippets for Chakra UI component wrappers
- **Control Flow Snippets** - Snippets for conditionals, loops, and error handling

### Enhanced
- **Syntax Highlighting** - New keywords properly highlighted and categorized
- **Code Snippets** - Added snippets for all new syntax features
- **Language Support** - Complete control flow language features

### Features
- 🎨 Enhanced syntax highlighting with control flow keywords
- 🔀 Conditional statement snippets (`ngati`, `kapena`)
- 🔄 Loop statement snippets (`kwa`, `pamene`)
- 🛡️ Error handling snippets (`linga`, `kwata`, `paumalilo`)
- ⚡ Async/await snippets (`lombako`, `leka`)
- 🎨 Chakra UI component snippets
- 📝 Comprehensive code examples

---

## [1.2.0] - 2025-01-27

### Added
- **React Integration Support** - Full React ecosystem compatibility
- **Import/Export Keywords** - `ingisa`, `fumya`, `ukufuma`, `chisangwa`, `nga`
- **Enhanced Syntax Highlighting** - New keyword categories for React features
- **React Component Snippets** - Complete React component templates
- **UI Library Snippets** - Shadcn/ui and Material-UI component wrappers
- **NPM Package Snippets** - Import statements for npm packages
- **Mixed Component Support** - React and BembaJS component integration

### Enhanced
- **Syntax Categories** - Better organization of keywords
- **Code Snippets** - More comprehensive snippet library
- **IntelliSense** - Improved auto-completion for React features
- **Documentation** - Updated descriptions and examples

### Features
- 🎨 Enhanced syntax highlighting with React keywords
- 🎯 React component snippets and templates
- 📝 Import/export statement snippets
- 🚀 UI library integration snippets
- 🌍 Full React ecosystem support
- 🔧 Mixed React/BembaJS component support
- 📦 NPM package import snippets

---

## [1.0.0] - 2025-01-27

### Added
- Initial release of BembaJS Language Support extension
- Syntax highlighting for .bemba files
- File icons for BembaJS projects
- Code snippets for common patterns
- Commands for creating projects and starting dev servers
- Language configuration for BembaJS
- Auto-completion and IntelliSense support

### Features
- 🎨 Full syntax highlighting
- 🎯 Custom file icons
- 📝 Code snippets
- 🚀 Quick commands
- 🌍 Bemba language support
- 🔧 Auto-configuration

---

## [Unreleased]

### Planned
- Enhanced IntelliSense with React component props
- Go-to-definition support for components
- Error detection and diagnostics
- Code formatting and linting
- Debugging support
- TypeScript integration
- Component prop validation
