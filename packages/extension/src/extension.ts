// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode'
import * as path from 'path'
import * as fs from 'fs'
import Handlebars from 'handlebars'

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        vscode.commands.registerCommand('catCoding.start', () => {
            // Create and show panel
            const panel = vscode.window.createWebviewPanel(
                'catCoding',
                'Cat Coding',
                vscode.ViewColumn.One,
                {}
            )
        })
    )
}

const makeUriAsWebviewUri = (
    context: vscode.ExtensionContext,
    webviewView: vscode.Webview,
    uri: string
) => {
    return webviewView
        .asWebviewUri(vscode.Uri.file(path.resolve(context.extensionPath, uri)))
        .toString()
}

/**
 * inject params to template
 */
const getHtmlForWebview = (
    context: vscode.ExtensionContext,
    webviewView: vscode.Webview,
    bundleName: string
) => {
    const htmlTemplateUri = path.resolve(
        context.extensionPath,
        './dist/index.html'
    )
    const content = fs.readFileSync(htmlTemplateUri, 'utf-8')
    const template = Handlebars.compile(content)

	const assets = fs.readdirSync(
		path.resolve(context.extensionPath, './dist/assets')
	)

	console.log(assets)

    // inject params to template
    const sidebarBundleWebViewUri = makeUriAsWebviewUri(
        context,
        webviewView,
        `./dist/assets/web-index.js`
    )

    const html = template({
        scriptUris: [sidebarBundleWebViewUri],
    })

    return html
}

// This method is called when your extension is deactivated
export function deactivate() {}
