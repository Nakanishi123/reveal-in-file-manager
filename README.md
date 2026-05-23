# Reveal in File Manager

Reveal in File Manager adds a Linux-friendly **Reveal in File Manager** command to Visual Studio Code. It opens the selected local file or folder in Nautilus or Dolphin.

## Installation

Install the extension in VS Code, then reload the window if prompted.

For local development:

```bash
npm install
npm run compile
```

Press `F5` in VS Code to launch an Extension Development Host.

## Usage

Run **Reveal in File Manager** from:

* Explorer context menu
* Editor context menu
* Editor title context menu
* Command Palette

When a file is selected, the extension asks the file manager to select that file. If selection fails and fallback is enabled, it opens the parent folder. When a folder is selected, the folder is opened directly.

## Extension Settings

This extension contributes the following settings:

* `revealInFileManager.fileManager`: Selects the file manager. Supported values are `auto`, `nautilus`, and `dolphin`. The default is `auto`.
* `revealInFileManager.fallbackToOpenFolder`: Opens the parent folder when file selection fails. The default is `true`.

## Ubuntu Example

With the default `auto` setting and `XDG_CURRENT_DESKTOP` containing `GNOME`, the extension uses Nautilus:

```json
"revealInFileManager.fileManager": "auto"
```

## Kubuntu Example

With the default `auto` setting and `XDG_CURRENT_DESKTOP` containing `KDE`, the extension uses Dolphin:

```json
"revealInFileManager.fileManager": "auto"
```

## Limitations

Initial support is limited to local `file` URIs on Linux. Remote SSH, WSL, Dev Containers, Windows, macOS, and file managers other than Nautilus and Dolphin are outside the initial scope.

## Known Issues

If Nautilus or Dolphin is not installed or cannot be launched from the VS Code environment, the extension shows an error message.
