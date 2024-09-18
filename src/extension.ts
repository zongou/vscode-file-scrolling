import * as vscode from 'vscode';

const extId = 'file-auto-scrolling';
const filePositionMap = new Map();

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(vscode.commands.registerCommand(`${extId}.toggle`, () => {
		const editor = vscode.window.activeTextEditor;
		if (editor) {
			/* Prevent cursor from moving down when its at the document end by moving it 1 line up */
			const lastLine = editor.document.lineCount - 1;
			if (lastLine != 0 && editor.selection.active.line === lastLine) {
				const newPosition = new vscode.Position(lastLine - 1, 0);
				editor.selection = new vscode.Selection(newPosition, newPosition);
			}

			const filePath = editor.document.uri.path;
			filePositionMap.has(filePath) ? filePositionMap.delete(filePath) : filePositionMap.set(filePath, editor.selection.active);
		}
	}))

	context.subscriptions.push(vscode.workspace.onDidChangeTextDocument(event => {
		const filePath = event.document.uri.path;
		if (filePositionMap.has(filePath)) {
			const editor = vscode.window.visibleTextEditors.find(editor => editor.document.uri.path === filePath);
			if (editor) {
				const lastLine = editor.document.lineCount - 1;
				const lastPosition = new vscode.Position(lastLine, editor.document.lineAt(lastLine).text.length);
				editor.revealRange(new vscode.Range(lastPosition, lastPosition));
			}
		}
	}));

	context.subscriptions.push(vscode.window.onDidChangeTextEditorSelection(event => {
		const filePath = event.textEditor.document.uri.path;
		if (filePositionMap.has(filePath)) {
			const savedPosition = filePositionMap.get(filePath);
			const currentPosition = event.selections[0].active;
			if (savedPosition.line !== currentPosition.line || savedPosition.character !== currentPosition.character) {
				filePositionMap.delete(filePath);
			}
		}
	}));

	context.subscriptions.push(vscode.workspace.onDidCloseTextDocument(doc => {
		filePositionMap.delete(doc.uri.path);
	}));
}
