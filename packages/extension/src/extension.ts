import * as vscode from 'vscode'
import * as path from 'path'
import * as fs from 'fs'
import * as Handlebars from 'handlebars'
import { fork } from 'child_process'
import type { ChildProcess } from 'child_process'

let childApiServer: ChildProcess | null = null
let controller: AbortController | null = null
let signal: AbortSignal

export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        vscode.commands.registerCommand('music.easy.start', () => {
            controller = new AbortController()
            signal = controller.signal
            const server = path.resolve(
                context.extensionPath,
                'public/index.js'
            )

            const argv: string[] = []
            const proxy = vscode.workspace
                .getConfiguration()
                .get('music.easy.proxy')
            console.warn(proxy)
            if (proxy) {
                argv.push('--proxy=' + proxy)
            }

            childApiServer = fork(server, argv, { signal })
            childApiServer.on('error', (err) => {
                console.log(err)
            })
            childApiServer.on('message', (m) => {
                console.log(m)
            })
            const panel = vscode.window.createWebviewPanel(
                'musicEasy',
                'Music Easy',
                vscode.ViewColumn.One,
                {
                    enableScripts: true,
                }
            )

            panel.webview.html = getHtmlForWebview(context, panel.webview)

            panel.webview.onDidReceiveMessage(async (message) => {
                console.log(message)
            })

            panel.onDidDispose(() => {
                controller && controller.abort()
                controller = null
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
        scriptUris.push('http://localhost:5173/src/main.ts')
    }

    const html = template({
        scriptUris,
        cssUris,
        scriptType: process.env.NODE_ENV !== 'production' ? 'module' : '',
    })

    return html
}

// This method is called when your extension is deactivated
export function deactivate() {
    controller && controller.abort()
    controller = null
}
