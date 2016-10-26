'use strict';

const vscode = require('vscode');
const lebab = require('lebab');

function makeDiagnostic(problem, stringLength) {
	return {
		severity: vscode.DiagnosticSeverity.Warning,
		range: {
			start: {
				line: problem.line - 1,
				character: 0
			},
			end: {
				line: problem.line - 1,
				character: stringLength
			}
		},
		source: 'lebab',
		message: `${problem.msg} [${problem.type}]`
	};
}

function activate(context) {
	const convert = vscode.commands.registerTextEditorCommand('lebab.convert', (textEditor) => {
		const options = vscode.workspace.getConfiguration('lebab');

		const text = textEditor.document.getText();
		let result = {
			code: text,
			warnings: []
		};

		try {
			result = lebab.transform(text, options.transforms);
		} catch (err) {
			console.error(err);
		}

		if (!options.skipWarnings) {
			const collection = vscode.languages.createDiagnosticCollection();
			const diagnostics = result.warnings.map((problem) => {
				const line = textEditor.document.lineAt(problem.line - 1);
				return makeDiagnostic(problem, line.text.length);
			});

			collection.set(textEditor.document.uri, diagnostics);

			vscode.window.onDidChangeActiveTextEditor(() => {
				collection.delete(textEditor.document.uri);
			});
		}

		textEditor.edit((editBuilder) => {
			const document = textEditor.document;
			const lastLine = document.lineAt(document.lineCount - 1);
			const start = new vscode.Position(0, 0);
			const end = new vscode.Position(document.lineCount - 1, lastLine.text.length);
			const range = new vscode.Range(start, end);

			editBuilder.replace(range, result.code);
		});
	});

	context.subscriptions.push(convert);
}

exports.activate = activate;
