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

const hasSelection = textEditor => {
	return textEditor.selection.start.line !== textEditor.selection.end.line || textEditor.selection.start.character !== textEditor.selection.end.character;
};

function activate(context) {
	const convert = vscode.commands.registerTextEditorCommand('lebab.convert', textEditor => {
		const {document} = textEditor;
		const lebabTransformInEditor = range => {
			const text = document.getText(range);
			const options = vscode.workspace.getConfiguration('lebab');

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
				const diagnostics = result.warnings.map(problem => {
					const line = textEditor.document.lineAt(problem.line - 1);
					return makeDiagnostic(problem, line.text.length);
				});

				collection.set(textEditor.document.uri, diagnostics);

				vscode.window.onDidChangeActiveTextEditor(() => {
					collection.delete(textEditor.document.uri);
				});
			}

			return textEditor.edit(editBuilder => {
				editBuilder.replace(range, result.code);
			});
		};

		if (hasSelection(textEditor)) {
			let index = 0
			let selection = textEditor.selections[index]
			let range = new vscode.Range(selection.start, selection.end);

			const transformNextUntilTheEnd = () => {
				return lebabTransformInEditor(range).then(() => {
					index += 1
					selection = textEditor.selections[index]
					if (selection) {
						range = new vscode.Range(selection.start, selection.end);
						return transformNextUntilTheEnd()
					}

				})
			}
			transformNextUntilTheEnd()

		} else {
			const lastLine = document.lineAt(document.lineCount - 1);
			const start = new vscode.Position(0, 0);
			const end = new vscode.Position(document.lineCount - 1, lastLine.text.length);
			const range = new vscode.Range(start, end);
			lebabTransformInEditor(range);
		}
	});

	context.subscriptions.push(convert);
}

exports.activate = activate;
