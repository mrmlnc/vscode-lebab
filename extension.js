'use strict';

const vscode = require('vscode');
const Transformer = require('lebab/lib/transformer');

function activate(context) {
  const options = Object.assign({
    'class': false,
    'template': false,
    'arrow': true,
    'let': true,
    'default-param': false,
    'arg-spread': true,
    'obj-method': true,
    'obj-shorthand': true,
    'no-strict': true,
    'commonjs': true
  }, vscode.workspace.getConfiguration('lebab').keys);

  const convert = vscode.commands.registerTextEditorCommand('lebab.convert', (textEditor) => {
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
