import * as assert from 'assert';

import { buildLaunchCommand, resolveFileManager } from '../extension';

suite('Extension Test Suite', () => {
	test('resolves auto file manager from desktop environment', () => {
		assert.strictEqual(resolveFileManager('auto', 'KDE'), 'dolphin');
		assert.strictEqual(resolveFileManager('auto', 'ubuntu:GNOME'), 'nautilus');
		assert.strictEqual(resolveFileManager('auto', ''), 'nautilus');
	});

	test('explicit file manager setting wins over desktop environment', () => {
		assert.strictEqual(resolveFileManager('dolphin', 'GNOME'), 'dolphin');
		assert.strictEqual(resolveFileManager('nautilus', 'KDE'), 'nautilus');
	});

	test('builds select command for files', () => {
		assert.deepStrictEqual(
			buildLaunchCommand('dolphin', '/tmp/example file.txt', false),
			{
				command: 'dolphin',
				args: ['--select', '/tmp/example file.txt'],
			},
		);
	});

	test('builds open command for folders', () => {
		assert.deepStrictEqual(
			buildLaunchCommand('nautilus', '/tmp/example folder', true),
			{
				command: 'nautilus',
				args: ['/tmp/example folder'],
			},
		);
	});
});
