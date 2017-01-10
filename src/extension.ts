'use strict';

import * as vscode from 'vscode';
import * as lebab from 'lebab';

interface IProblem {
	type: string;
	msg: string;
	line: number;
}

interface ITask {
	code: string;
	range: vscode.Range;
}

interface IOptions {
	transforms: string[];
	skipWarnings: boolean;
}

function getRange(sl: number, sc: number, el: number, ec: number): vscode.Range {
	const start = new vscode.Position(sl, sc);
	const end = new vscode.Position(el, ec);
	return new vscode.Range(start, end);
}

function makeDiagnostic(problem: IProblem, stringLength: number) {
	const line = problem.line - 1;
	return <vscode.Diagnostic>{
		severity: vscode.DiagnosticSeverity.Warning,
		range: getRange(line, 0, line, stringLength),
		source: 'lebab',
		message: `${problem.msg} [${problem.type}]`
	};
}

function transformRange(document: vscode.TextDocument, range: vscode.Range, options: IOptions, collection: vscode.DiagnosticCollection, selection = false): ITask {
	const text = document.getText(range);

	let result = {
		code: text,
		warnings: []
	};

	try {
		result = lebab.transform(text, options.transforms);
	} catch (err) {
		console.error(err);
	}

	if (!options.skipWarnings && !selection) {
		collection.set(document.uri, result.warnings.map((problem) => {
			const problemLine = document.lineAt(problem.line - 1);
			return makeDiagnostic(problem, problemLine.text.length);
		}));
	}

	return {
		code: result.code,
		range
	};
}

function isEmptyPrimarySelection(selections: vscode.Selection[]) {
	return selections.length === 0 || (selections.length === 1 && selections[0].isEmpty);
}

export function activate(context: vscode.ExtensionContext) {
	const command = vscode.commands.registerTextEditorCommand('lebab.convert', (textEditor) => {
		const options = vscode.workspace.getConfiguration().get<IOptions>('lebab');
		const document = textEditor.document;
		const selections = textEditor.selections;

		const transforms: ITask[] = [];
		const collection = vscode.languages.createDiagnosticCollection();

		// If the primary selection is empty, then transform full document
		if (isEmptyPrimarySelection(selections)) {
			const lastLine = document.lineAt(document.lineCount - 1);
			const range = getRange(0, 0, document.lineCount - 1, lastLine.text.length);
			transforms.push(transformRange(document, range, options, collection));
		} else {
			selections.forEach((selection) => {
				const range = new vscode.Range(selection.start, selection.end);
				transforms.push(transformRange(document, range, options, collection, true));
			});
		}

		if (!options.skipWarnings) {
			vscode.window.onDidChangeActiveTextEditor(() => collection.delete(document.uri));
		}

		textEditor.edit((editBuilder) => {
			transforms.forEach((task) => {
				editBuilder.replace(task.range, task.code);
			});
		});
	});

	// Subscriptions
	context.subscriptions.push(command);
}
