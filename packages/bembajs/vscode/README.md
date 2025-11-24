# BembaJS VS Code/Cursor Support

This directory contains language support files for BembaJS `.bemba` files in VS Code and Cursor.

## Features

- ✅ **Syntax Highlighting** - Proper color coding for BembaJS keywords and functions
- ✅ **File Association** - `.bemba` files are recognized as BembaJS code
- ✅ **Auto-completion** - Bracket matching and auto-closing pairs
- ✅ **Code Folding** - Support for folding regions
- ✅ **File Icons** - Custom icon for `.bemba` files

## Setup Instructions

### Method 1: Copy Files to VS Code Extensions Directory

1. Copy the `vscode` folder to your VS Code extensions directory:
   - **Windows**: `%USERPROFILE%\.vscode\extensions\bembajs-language-support\`
   - **macOS**: `~/.vscode/extensions/bembajs-language-support/`
   - **Linux**: `~/.vscode/extensions/bembajs-language-support/`

2. Restart VS Code/Cursor

### Method 2: Workspace Settings

Add the following to your workspace `.vscode/settings.json`:

```json
{
  "files.associations": {
    "*.bemba": "bemba"
  }
}
```

### Method 3: User Settings

Add the same configuration to your user settings (`Ctrl/Cmd + ,` → search for "files.associations").

## Files Included

- `bemba.tmLanguage.json` - TextMate grammar for syntax highlighting
- `language-configuration.json` - Language configuration (brackets, comments, etc.)
- `package.json` - VS Code extension manifest
- `icons.json` - File icon configuration
- `bemba-icon.svg` - Custom icon for `.bemba` files
- `settings.json` - Recommended VS Code settings

## Syntax Highlighting

The extension provides syntax highlighting for:

- **Keywords**: `pangaIpepa`, `fyambaIcipanda`, `pangaApi`, etc.
- **Properties**: `umutwe`, `ilyashi`, `ifiputulwa`, `amabatani`, etc.
- **Functions**: `londolola`, `panga`, `fyamba`, `akha`, etc.
- **Strings**: Single quotes, double quotes, and template literals
- **Comments**: Single-line (`//`) and multi-line (`/* */`)
- **Numbers**: Integer and decimal numbers

## Troubleshooting

If syntax highlighting doesn't work:

1. Make sure the file association is set correctly
2. Check that the language is set to "Bemba" in the bottom-right corner
3. Try reloading the window (`Ctrl/Cmd + Shift + P` → "Developer: Reload Window")
4. Verify the files are in the correct extensions directory

## Contributing

To improve the language support:

1. Edit `bemba.tmLanguage.json` for syntax highlighting rules
2. Update `language-configuration.json` for language features
3. Modify `settings.json` for color themes
4. Test changes by reloading VS Code/Cursor
