import * as vscode from 'vscode'
import * as path from 'path'
import * as fs from 'fs'
import * as Handlebars from 'handlebars'

export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        vscode.commands.registerCommand('music.easy.start', () => {
            // Create and show panel
            const panel = vscode.window.createWebviewPanel(
                'musicEasy',
                'Music Easy',
                vscode.ViewColumn.One,
                {
                    enableScripts: true,
                }
            )

            // And set its HTML content
            panel.webview.html = getHtmlForWebview(context, panel.webview)

            panel.webview.onDidReceiveMessage(message => {
                console.log(message)
            })
        })
    )
}

function resolve(context: vscode.ExtensionContext, filePath: string) {
    return path.resolve(context.extensionPath, filePath)
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
    webview: vscode.Webview
) => {
    const htmlTemplateUri = resolve(context, './dist/index.html')
    const content = fs.readFileSync(htmlTemplateUri, 'utf-8')

    const template = Handlebars.compile(content)

    const cssUris: string[] = []
    const scriptUris: string[] = []
    if (process.env.NODE_ENV === 'production') {
        const assets = fs.readdirSync(resolve(context, './dist/assets'))
        for (const asset of assets) {
            const p = resolve(context, 'dist/assets/' + asset)
            const uri = makeUriAsWebviewUri(context, webview, p)

            if (~asset.indexOf('.css')) {
                cssUris.push(uri)
            }

            if (~asset.indexOf('.js')) {
                scriptUris.push(uri)
            }
        }
    } else {
        scriptUris.push(
            'http://localhost:5173/src/main.ts'
        )
    }

    const html = template({
        scriptUris,
        cssUris,
        scriptType: process.env.NODE_ENV !=='production' ? 'module' : ''
    })

    return html
}

// This method is called when your extension is deactivated
export function deactivate() {}
