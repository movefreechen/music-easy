import * as vscode from 'vscode'
import * as path from 'path'
import * as fs from 'fs'
import * as Handlebars from 'handlebars'
import { fork } from 'child_process'
import type { ChildProcess } from 'child_process'
import kill from 'kill-port'

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
                                let port = vscode.workspace
                                    .getConfiguration()
                                    .get<number>('music.easy.port')

                                port = !isNaN(parseInt(port + '')) ? port : 4000
                                try {
                                    kill(port!)
                                } catch (error) {
                                } finally {
                                    runApiServe(context)
                                }
                            } else {
                                panel!.dispose()
                            }
                        })
            })

            apiServe!.on('message', (m) => {
                if (m === 'server started successfully') {
                    panel!.webview.html = getHtmlForWebview(
                        context,
                        panel!.webview
                    )
                }
            })

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
        // 开发环境加载mdi字体库
        cssUris.push(
            makeUriAsWebviewUri(
                context,
                webview,
                resolve(
                    'node_modules/@mdi/font/css/materialdesignicons.css',
                    context
                )
            )
        )
        scriptUris.push('http://localhost:5173/src/main.ts')
    }

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
    let port = vscode.workspace
        .getConfiguration()
        .get<number>('music.easy.port')

    if (proxy && proxy.trim()) {
        argv.push('--proxy=' + proxy.trim())
    }

    port = !isNaN(parseInt(port + '')) ? port : 4000
    argv.push('--port=' + port)

    apiServe = fork(server, argv, { signal })
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
