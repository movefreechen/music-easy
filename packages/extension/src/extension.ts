import * as vscode from 'vscode'
import * as path from 'path'
import * as fs from 'fs'
import * as Handlebars from 'handlebars'
import { fork } from 'child_process'
import type { ChildProcess } from 'child_process'

let apiServe: ChildProcess | null = null
let controller: AbortController | null = null
let signal: AbortSignal

export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        vscode.commands.registerCommand('music.easy.start', () => {
            let panel: null | vscode.WebviewPanel =
                vscode.window.createWebviewPanel(
                    'musicEasy',
                    'Music Easy',
                    vscode.ViewColumn.One,
                    {
                        enableScripts: true,
                    }
                )

            runApiServe(context)

            apiServe!.on('exit', () => {
                panel &&
                    vscode.window
                        .showWarningMessage(
                            '音乐服务异常，是否重新启动服务？',
                            '重启',
                            '退出'
                        )
                        .then((select) => {
                            if (select === '重启') {
                                abortApiServe()
                                runApiServe(context)
                            } else {
                                panel!.dispose()
                            }
                        })
            })

            panel.webview.html = getHtmlForWebview(context, panel.webview)

            panel.webview.onDidReceiveMessage((message) => {
                handleMessage(message, context, panel!)
            })

            panel.onDidDispose(() => {
                abortApiServe()
                panel = null
            })
        })
    )
}

enum MsgCommand {
    GET_COOKIE,
    SAVE_COOKIE,
}

type Message = {
    command: MsgCommand
    data?: any
}
function handleMessage(
    message: Message,
    context: vscode.ExtensionContext,
    panel: vscode.WebviewPanel
) {
    const { command, data } = message
    if (command === MsgCommand.GET_COOKIE) {
        return panel.webview.postMessage({
            command: MsgCommand.GET_COOKIE,
            data: cookieGet(context),
        })
    }

    if (command === MsgCommand.SAVE_COOKIE) {
        cookieSave(data, context)
    }
}

function resolve(filePath: string, context: vscode.ExtensionContext) {
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
    const htmlTemplateUri = resolve('./dist/index.html', context)
    const content = fs.readFileSync(htmlTemplateUri, 'utf-8')

    const template = Handlebars.compile(content)

    const cssUris: string[] = []
    const scriptUris: string[] = []
    const mdiFontUrl = makeUriAsWebviewUri(
        context,
        webview,
        resolve('node_modules/@mdi/font/css/materialdesignicons.css', context)
    )
    if (process.env.NODE_ENV === 'production') {
        const assets = fs.readdirSync(resolve('./dist/assets', context))
        for (const asset of assets) {
            const p = resolve('dist/assets/' + asset, context)
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

    cssUris.push(mdiFontUrl)

    const html = template({
        scriptUris,
        cssUris,
        scriptType: process.env.NODE_ENV !== 'production' ? 'module' : '',
    })

    return html
}

function runApiServe(context: vscode.ExtensionContext) {
    controller = new AbortController()
    signal = controller.signal
    const server = resolve('public/index.js', context)

    const argv: string[] = []
    const proxy = vscode.workspace
        .getConfiguration()
        .get<string>('music.easy.proxy')
    const port = vscode.workspace
        .getConfiguration()
        .get<number>('music.easy.port')

    if (proxy && proxy.trim()) {
        argv.push('--proxy=' + proxy.trim())
    }

    if (!isNaN(parseInt(port + ''))) {
        argv.push('--port=' + port)
    }

    apiServe = fork(server, argv, { signal, silent: false })
}

function abortApiServe() {
    try {
        controller && controller.abort()
        apiServe = null
        controller = null
    } catch (error) {}
}

const COOKIE_KEY = 'MUSIC_COOKIE'
function cookieSave(cookie: string, context: vscode.ExtensionContext) {
    context.globalState.update(COOKIE_KEY, cookie)
}

function cookieGet(context: vscode.ExtensionContext) {
    return context.globalState.get(COOKIE_KEY)
}

// This method is called when your extension is deactivated
export function deactivate() {
    abortApiServe()
}
