# Reveal in File Manager 拡張機能 仕様書

## 1. 概要

本拡張機能は、Linux版Visual Studio Codeにおいて、選択中のファイルまたはフォルダを設定されたファイルマネージャーで開く機能を提供する。

Windows版Visual Studio Codeに存在する `Reveal in File Explorer` 相当の操作を、Ubuntu / Kubuntu上でも利用できるようにすることを目的とする。

拡張機能は `yo code` によって生成されるVisual Studio Code Extensionテンプレートをベースに実装する。

---

## 2. 想定名称

### 2.1 拡張機能名

```text
Reveal in File Manager
```

### 2.2 拡張機能ID

```text
reveal-in-file-manager
```

### 2.3 コマンドID

```text
revealInFileManager.reveal
```

---

## 3. 対象環境

### 3.1 対象OS

主対象はLinuxとする。

主に以下の環境を想定する。

```text
Ubuntu
Kubuntu
Debian系Linux
```

### 3.2 対象エディタ

```text
Visual Studio Code
```

### 3.3 対象ファイル

ローカルファイルシステム上のファイルおよびフォルダを対象とする。

対象URIスキームは以下のみとする。

```text
file
```

### 3.4 対象外

初期バージョンでは以下を対象外とする。

```text
Remote SSH
WSL
Dev Container
Windows
macOS
Nautilus / Dolphin 以外のファイルマネージャー
```

---

## 4. 作成方法

本拡張機能はVS Code公式の拡張機能ジェネレーターを用いて作成する。

```bash
npm install -g yo generator-code
yo code
```

選択するテンプレートは以下とする。

```text
New Extension (TypeScript)
```

使用言語は以下とする。

```text
TypeScript
```

---

## 5. 機能要件

### 5.1 ファイルをファイルマネージャーで表示する

VS Code上で選択したファイルを、設定で指定されたファイルマネージャーで開く。

例：

```text
VS Code Explorer上で main.ts を右クリック
→ Reveal in File Manager を実行
→ Nautilus / Dolphin などで main.ts の親フォルダを開く
```

ファイルマネージャーが対象ファイルの選択表示に対応している場合は、対象ファイルを選択状態で表示する。

対応していない場合、または選択表示に失敗した場合は、対象ファイルの親フォルダを開く。

### 5.2 フォルダをファイルマネージャーで開く

VS Code上で選択した項目がフォルダの場合、そのフォルダを直接ファイルマネージャーで開く。

例：

```text
VS Code Explorer上で src フォルダを右クリック
→ Reveal in File Manager を実行
→ src フォルダをファイルマネージャーで開く
```

### 5.3 エディタ上のファイルを開く

VS Codeのエディタで開いているファイルに対しても、コマンドパレットまたは右クリックメニューから同機能を実行できる。

対象ファイルの決定優先順位は以下とする。

1. コマンド引数として渡されたURI
2. アクティブエディタのドキュメントURI

### 5.4 コマンドパレットから実行する

コマンドパレットに以下のコマンドを登録する。

```text
Reveal in File Manager
```

実行時に対象ファイルが特定できない場合は警告を表示する。

### 5.5 右クリックメニューに表示する

以下の場所にコマンドを表示する。

```text
Explorer context menu
Editor context menu
Editor title context menu
```

表示名は常に以下で統一する。

```text
Reveal in File Manager
```

---

## 6. 対応ファイルマネージャー

初期対応は以下の2つのみとする。

```text
nautilus
dolphin
```

---

## 7. 設定要件

### 7.1 ファイルマネージャーの選択

ユーザーは設定から使用するファイルマネージャーを選択できる。

設定キー：

```json
"revealInFileManager.fileManager"
```

設定値：

```json
"auto"
"nautilus"
"dolphin"
```

デフォルト値：

```json
"auto"
```

各設定値の意味は以下とする。

| 値         | 意味                             |
| ---------- | -------------------------------- |
| `auto`     | デスクトップ環境から自動判定する |
| `nautilus` | Nautilusを使う                   |
| `dolphin`  | Dolphinを使う                    |

### 7.2 フォールバック設定

選択表示に失敗した場合、親フォルダを開くかどうかを設定できる。

設定キー：

```json
"revealInFileManager.fallbackToOpenFolder"
```

デフォルト値：

```json
true
```

---

## 8. 自動判定仕様

`revealInFileManager.fileManager` が `auto` の場合、環境変数 `XDG_CURRENT_DESKTOP` を確認する。

判定ルールは以下とする。

| 条件                                    | 使用するファイルマネージャー |
| --------------------------------------- | ---------------------------- |
| `XDG_CURRENT_DESKTOP` に `KDE` を含む   | `dolphin`                    |
| `XDG_CURRENT_DESKTOP` に `GNOME` を含む | `nautilus`                   |
| それ以外                                | `nautilus`                   |

Kubuntuでは通常 `KDE` が含まれる想定なので、`auto` の場合は `dolphin` を使用する。

Ubuntu GNOMEでは通常 `GNOME` が含まれる想定なので、`auto` の場合は `nautilus` を使用する。

---

## 9. コマンド仕様

### 9.1 コマンドID

```text
revealInFileManager.reveal
```

### 9.2 コマンド表示名

```text
Reveal in File Manager
```

### 9.3 入力

VS Codeから渡される可能性のある引数は以下とする。

```ts
uri?: vscode.Uri
```

### 9.4 処理フロー

```text
1. コマンドを実行する
2. 引数URIがあればそれを対象にする
3. 引数URIがなければアクティブエディタのURIを対象にする
4. URIが存在しなければ警告を表示して終了
5. URIスキームが file でなければ警告を表示して終了
6. パスが存在するか確認する
7. ファイルかフォルダか判定する
8. 設定からファイルマネージャーを決定する
9. ファイルマネージャーに応じてコマンドと引数を組み立てる
10. child_process.execFile で起動する
11. ファイル選択表示に失敗した場合、設定に応じて親フォルダを開く
12. それも失敗した場合、エラーメッセージを表示する
```

---

## 10. ファイルマネージャー別の挙動

### 10.1 Nautilus

ファイルの場合：

```bash
nautilus --select /path/to/file
```

フォルダの場合：

```bash
nautilus /path/to/folder
```

### 10.2 Dolphin

ファイルの場合：

```bash
dolphin --select /path/to/file
```

フォルダの場合：

```bash
dolphin /path/to/folder
```

---

## 11. フォールバック仕様

ファイルを選択表示できなかった場合、`revealInFileManager.fallbackToOpenFolder` が `true` なら親フォルダを開く。

例：

```bash
dolphin --select /path/to/file
```

が失敗した場合：

```bash
dolphin /path/to
```

を実行する。

`fallbackToOpenFolder` が `false` の場合は、親フォルダを開かずエラーを表示する。

---

## 12. エラー処理

### 12.1 対象ファイルがない

表示メッセージ：

```text
No file is selected.
```

### 12.2 ローカルファイルではない

表示メッセージ：

```text
Only local files can be revealed.
```

### 12.3 パスが存在しない

表示メッセージ：

```text
Path does not exist: <path>
```

### 12.4 ファイルマネージャー起動失敗

表示メッセージ：

```text
Failed to reveal file: <error message>
```

---

## 13. セキュリティ要件

コマンド実行には `exec` ではなく `execFile` を使用する。

理由は以下。

```text
シェル展開を避け、パスに空白や特殊文字が含まれる場合でも安全に扱うため。
```

本仕様では任意のカスタムコマンド実行機能は提供しない。

---

## 14. package.json 仕様

### 14.1 activationEvents

```json
"activationEvents": [
  "onCommand:revealInFileManager.reveal"
]
```

### 14.2 contributes.commands

```json
"contributes": {
  "commands": [
    {
      "command": "revealInFileManager.reveal",
      "title": "Reveal in File Manager"
    }
  ]
}
```

### 14.3 contributes.menus

```json
"menus": {
  "explorer/context": [
    {
      "command": "revealInFileManager.reveal",
      "when": "resourceScheme == file",
      "group": "navigation@90"
    }
  ],
  "editor/context": [
    {
      "command": "revealInFileManager.reveal",
      "when": "resourceScheme == file",
      "group": "navigation@90"
    }
  ],
  "editor/title/context": [
    {
      "command": "revealInFileManager.reveal",
      "when": "resourceScheme == file",
      "group": "navigation@90"
    }
  ]
}
```

### 14.4 contributes.configuration

```json
"configuration": {
  "title": "Reveal in File Manager",
  "properties": {
    "revealInFileManager.fileManager": {
      "type": "string",
      "default": "auto",
      "enum": [
        "auto",
        "nautilus",
        "dolphin"
      ],
      "description": "File manager used to reveal files and folders."
    },
    "revealInFileManager.fallbackToOpenFolder": {
      "type": "boolean",
      "default": true,
      "description": "Open the parent folder when revealing the selected file fails."
    }
  }
}
```

---

## 15. 実装ファイル構成

`yo code` 生成後の主な構成は以下。

```text
reveal-in-file-manager/
├── package.json
├── tsconfig.json
├── src/
│   └── extension.ts
├── out/
├── README.md
└── CHANGELOG.md
```

初期実装では主実装を以下に置く。

```text
src/extension.ts
```

必要に応じて将来的に以下のように分割する。

```text
src/
├── extension.ts
├── config.ts
├── fileManager.ts
├── pathUtils.ts
└── commandRunner.ts
```

---

## 16. 型定義案

```ts
type FileManager = 'auto' | 'nautilus' | 'dolphin';

type ResolvedFileManager = 'nautilus' | 'dolphin';

interface ExtensionConfig {
	fileManager: FileManager;
	fallbackToOpenFolder: boolean;
}

interface LaunchCommand {
	command: string;
	args: string[];
}
```

---

## 17. 受け入れ基準

### 17.1 Kubuntu

設定：

```json
"revealInFileManager.fileManager": "auto"
```

環境：

```text
XDG_CURRENT_DESKTOP=KDE
```

期待結果：

```text
右クリックメニューに Reveal in File Manager が表示される。
実行すると Dolphin で対象ファイルまたはフォルダが開かれる。
```

### 17.2 Ubuntu GNOME

設定：

```json
"revealInFileManager.fileManager": "auto"
```

環境：

```text
XDG_CURRENT_DESKTOP=ubuntu:GNOME
```

期待結果：

```text
右クリックメニューに Reveal in File Manager が表示される。
実行すると Nautilus で対象ファイルまたはフォルダが開かれる。
```

### 17.3 明示的にDolphinを指定

設定：

```json
"revealInFileManager.fileManager": "dolphin"
```

期待結果：

```text
環境に関係なく Dolphin で対象ファイルまたはフォルダが開かれる。
```

### 17.4 明示的にNautilusを指定

設定：

```json
"revealInFileManager.fileManager": "nautilus"
```

期待結果：

```text
環境に関係なく Nautilus で対象ファイルまたはフォルダが開かれる。
```

### 17.5 存在しないファイル

存在しないファイルに対して実行した場合、エラーメッセージを表示し、ファイルマネージャーは起動しない。

### 17.6 リモートファイル

Remote SSH、WSL、Dev Containerなどの非 `file` URIに対して実行した場合、警告を表示して終了する。

---

## 18. READMEに記載する内容

READMEには以下を記載する。

```text
概要
インストール方法
使い方
設定項目
Ubuntuでの例
Kubuntuでの例
制限事項
既知の問題
```

---

## 19. 初期バージョンのスコープ

初期バージョン `0.0.1` では以下を実装する。

```text
Explorer右クリックメニュー
Editor右クリックメニュー
Editor title右クリックメニュー
Command Palette
nautilus対応
dolphin対応
auto判定
選択表示失敗時の親フォルダフォールバック
ローカルfile URIのみ対応
```

初期バージョンでは以下は実装しない。

```text
Remote SSH対応
WSL対応
Dev Container対応
Nautilus / Dolphin 以外のファイルマネージャー対応
GUI設定画面
多言語化
テレメトリ
```

---

## 20. 確定事項

本仕様における確定事項は以下とする。

```text
コマンド表示名は Reveal in File Manager
コマンドIDは revealInFileManager.reveal
設定キーは revealInFileManager.*
設定値は auto / nautilus / dolphin
デフォルトは auto
Kubuntuでは auto 時に dolphin
Ubuntu GNOMEでは auto 時に nautilus
対応ファイルマネージャーは nautilus と dolphin のみ
選択表示失敗時は親フォルダを開く
Remote SSH / WSL / Dev Container は対象外
yo code を使って TypeScript 拡張として作成する
```
