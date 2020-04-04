// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as csv_utils from 'csv_utils';

class BeanQuickCompletionItemProvider implements vscode.CompletionItemProvider {
	public provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.CompletionContext) {
		//const simpleCompletion = new vscode.CompletionItem('Expenses:Fun');
		return [
			new vscode.CompletionItem('Expenses:Fun'),
			new vscode.CompletionItem('Expenses:Fun:Software'),
			new vscode.CompletionItem('Expenses:Fitness'),
			new vscode.CompletionItem('Expenses:Transportation:Air'),
		];
	}
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "bean-quick" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('extension.helloWorld', () => {
		// The code you place here will be executed every time your command is executed

		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World!');
	});

	context.subscriptions.push(disposable);
	context.subscriptions.push(
		vscode.languages.registerCompletionItemProvider(
			'beanquick', new BeanQuickCompletionItemProvider()
		)
	);
	const myScheme = 'beanquick';
	const myProvider = new class implements vscode.TextDocumentContentProvider {
		provideTextDocumentContent(uri: vscode.Uri): string {
			const info = JSON.parse(uri.fsPath);
			//return info.text;
			return uri.fsPath;
		}
	};
	context.subscriptions.push(
		vscode.workspace.registerTextDocumentContentProvider(myScheme, myProvider)
	);
	context.subscriptions.push(vscode.commands.registerCommand('extension.formatBeancount', async () => {
		let fromAccount = await vscode.window.showInputBox({ignoreFocusOut: true, prompt: "an assets or liabilities account name"});
		if (fromAccount) {
			let year = await vscode.window.showInputBox({ignoreFocusOut: true, prompt: "year these transactions took place"});
			if (year) {
				const editor = vscode.window.activeTextEditor;
				const text = editor?.document.getText();
				const info = {
					fromAccount: fromAccount,
					year: year,
					text: text
				};
				let uri = vscode.Uri.parse('beanquick:' + JSON.stringify(info));
				let doc = await vscode.workspace.openTextDocument(uri);
				await vscode.window.showTextDocument(doc, { preview: false });
			}
		}
	}));
	vscode.window.showInformationMessage('bean-quick activated');
}

// this method is called when your extension is deactivated
export function deactivate() {}
