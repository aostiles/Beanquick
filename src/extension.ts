// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as csv_utils from './csv_utils';
import * as fs from 'fs';

class BeanQuickCompletionItemProvider implements vscode.CompletionItemProvider {
	items: vscode.CompletionItem[] = [];
	constructor(beanFile: string) {
		let regex = /open ([\w:]+)/g;
		let result;
		while ((result = regex.exec(beanFile)) !== null) {
			this.items.push(new vscode.CompletionItem(result[1]));
		}
	}

	// provide expense account names
	public provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.CompletionContext) {
		const line = document.lineAt(position);
		const preceding = line.text.substring(0, position.character);
		if (preceding.split(",").length - 1 < 4) {
			// don't try and complete day-of-month field
			return null;
		}
		return this.items;
	}
}

// called when extension activated (first time command executed)
export function activate(context: vscode.ExtensionContext) {

	const mainFile = vscode.workspace.getConfiguration().get('beanquick.mainBeanFile');
	if (!mainFile) {
		vscode.window.showErrorMessage("main.bean file not set. Please set it in user settings.");
		return;
	}
	var mainContents;
	try {
		mainContents = fs.readFileSync(<string>mainFile, 'utf-8');
	} catch (err) {
		vscode.window.showErrorMessage("error reading main.bean file.");
		return;
	}
	console.log(mainContents);
	context.subscriptions.push(
		vscode.languages.registerCompletionItemProvider(
			'beanquick', new BeanQuickCompletionItemProvider(mainContents)
		)
	);
	const myScheme = 'beanquick';
	const myProvider = new class implements vscode.TextDocumentContentProvider {
		provideTextDocumentContent(uri: vscode.Uri): string {
			const info = JSON.parse(uri.fsPath);
			return csv_utils.toBeancount(info.text, info.fromAccount, info.year);
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

// called when extension deactivated
export function deactivate() {}
