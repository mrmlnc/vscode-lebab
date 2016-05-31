'use strict';

const vscode = require('vscode');
const Transformer = require('lebab/lib/transformer');

function activate(context) {
  const defaultOptions = {
    'arrow': true,
    'let': true,
    'arg-spread': true,
    'obj-method': true,
    'obj-shorthand': true,
    'no-strict': true,
    'commonjs': true
  };

  const convert = vscode.commands.registerTextEditorCommand('lebab.convert', (textEditor) => {
    const options = Object.assign(
      defaultOptions,
      vscode.workspace.getConfiguration('lebab').transforms
    );

    let text = textEditor.document.getText();
    const lebab = new Transformer(options);

    try {
      text = lebab.run(text);
    } catch (err) {
      console.error(err);
    }

    textEditor.edit((editBuilder) => {
      const document = textEditor.document;
      const lastLine = document.lineAt(document.lineCount - 1);
      const start = new vscode.Position(0, 0);
      const end = new vscode.Position(document.lineCount - 1, lastLine.text.length);
      const range = new vscode.Range(start, end);

      editBuilder.replace(range, text);
    });
  });

  context.subscriptions.push(convert);
}

exports.activate = activate;

function deactivate() {

}

exports.deactivate = deactivate;
