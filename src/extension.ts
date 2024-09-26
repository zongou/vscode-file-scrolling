import * as vscode from 'vscode';

const extId = 'file-auto-scrolling';
const fileListEnabled = new Set();

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(vscode.commands.registerCommand(`${extId}.toggle`, () => {
		const editor = vscode.window.activeTextEditor;
		if (editor) {
			const filePath = editor.document.uri.path;
			if (!fileListEnabled.has(filePath)) {
				const lastLine = editor.document.lineCount - 1;
				const lastPosition = new vscode.Position(lastLine, editor.document.lineAt(lastLine).text.length);
				editor.selection = new vscode.Selection(lastPosition, lastPosition);
				fileListEnabled.add(filePath);
			} else {
				fileListEnabled.delete(filePath);
			}
		}
	}));

	context.subscriptions.push(vscode.workspace.onDidChangeTextDocument(event => {
		const filePath = event.document.uri.path;
		if (fileListEnabled.has(filePath)) {
			const editor = vscode.window.visibleTextEditors.find(editor => editor.document.uri.path === filePath);
			if (editor) {
				const lastLine = editor.document.lineCount - 1;
				const lastPosition = new vscode.Position(lastLine, editor.document.lineAt(lastLine).text.length);
				editor.revealRange(new vscode.Range(lastPosition, lastPosition));
			}
		}
	}));

	context.subscriptions.push(vscode.window.onDidChangeTextEditorSelection(event => {
		if (event.selections[0].active.line !== event.textEditor.document.lineCount - 1) {
			fileListEnabled.delete(event.textEditor.document.uri.path);
		}
	}));

	context.subscriptions.push(vscode.workspace.onDidCloseTextDocument(doc => {
		fileListEnabled.delete(doc.uri.path);
	}));
}
