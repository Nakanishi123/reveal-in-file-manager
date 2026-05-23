import { execFile } from 'child_process';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as vscode from 'vscode';

type FileManager = 'auto' | 'nautilus' | 'dolphin';
type ResolvedFileManager = 'nautilus' | 'dolphin';

interface ExtensionConfig {
	fileManager: FileManager;
	fallbackToOpenFolder: boolean;
}

interface LaunchCommand {
	command: ResolvedFileManager;
	args: string[];
}

function execFileAsync(command: string, args: string[]): Promise<void> {
	return new Promise((resolve, reject) => {
		execFile(command, args, (error) => {
			if (error) {
				reject(error);
				return;
			}

			resolve();
		});
	});
}

function getConfig(): ExtensionConfig {
	const config = vscode.workspace.getConfiguration('revealInFileManager');

	return {
		fileManager: config.get<FileManager>('fileManager', 'auto'),
		fallbackToOpenFolder: config.get<boolean>('fallbackToOpenFolder', true),
	};
}

export function resolveFileManager(
	fileManager: FileManager,
	desktop = process.env.XDG_CURRENT_DESKTOP ?? '',
): ResolvedFileManager {
	if (fileManager !== 'auto') {
		return fileManager;
	}

	const normalizedDesktop = desktop.toUpperCase();

	if (normalizedDesktop.includes('KDE')) {
		return 'dolphin';
	}

	return 'nautilus';
}

export function buildLaunchCommand(
	fileManager: ResolvedFileManager,
	targetPath: string,
	isDirectory: boolean,
): LaunchCommand {
	if (isDirectory) {
		return {
			command: fileManager,
			args: [targetPath],
		};
	}

	return {
		command: fileManager,
		args: ['--select', targetPath],
	};
}

function getTargetUri(uri?: vscode.Uri): vscode.Uri | undefined {
	return uri ?? vscode.window.activeTextEditor?.document.uri;
}

function getErrorMessage(error: unknown): string {
	if (error instanceof Error) {
		return error.message;
	}

	return String(error);
}

async function revealUri(uri?: vscode.Uri): Promise<void> {
	const targetUri = getTargetUri(uri);

	if (!targetUri) {
		vscode.window.showWarningMessage('No file is selected.');
		return;
	}

	if (targetUri.scheme !== 'file') {
		vscode.window.showWarningMessage('Only local files can be revealed.');
		return;
	}

	const targetPath = targetUri.fsPath;
	let stat;

	try {
		stat = await fs.stat(targetPath);
	} catch {
		vscode.window.showErrorMessage(`Path does not exist: ${targetPath}`);
		return;
	}

	const config = getConfig();
	const fileManager = resolveFileManager(config.fileManager);
	const isDirectory = stat.isDirectory();
	const launchCommand = buildLaunchCommand(
		fileManager,
		targetPath,
		isDirectory,
	);

	try {
		await execFileAsync(launchCommand.command, launchCommand.args);
		return;
	} catch (error) {
		if (isDirectory || !config.fallbackToOpenFolder) {
			vscode.window.showErrorMessage(
				`Failed to reveal file: ${getErrorMessage(error)}`,
			);
			return;
		}
	}

	try {
		await execFileAsync(fileManager, [path.dirname(targetPath)]);
	} catch (error) {
		vscode.window.showErrorMessage(
			`Failed to reveal file: ${getErrorMessage(error)}`,
		);
	}
}

export function activate(context: vscode.ExtensionContext) {
	const disposable = vscode.commands.registerCommand(
		'revealInFileManager.reveal',
		revealUri,
	);

	context.subscriptions.push(disposable);
}

export function deactivate() {}
