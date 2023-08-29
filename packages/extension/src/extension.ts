import * as vscode from 'vscode'
import * as path from 'path'
import * as fs from 'fs'
import * as Handlebars from 'handlebars'
import { fork } from 'child_process'
import type { ChildProcess } from 'child_process'
import kill from 'kill-port'

const COOKIE_KEY = 'MUSIC_COOKIE'
const ZOOM_KEY = 'MUSIC_ZOOM'

let apiServe: ChildProcess | null = null
let controller: AbortController | null = null
let signal: AbortSignal
let panel: null | vscode.WebviewPanel

export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        vscode.commands.registerCommand('music.easy.start', () => {
            panel = vscode.window.createWebviewPanel(
                'musicEasy',
                'Music Easy',
                vscode.ViewColumn.One,
                {
                    enableScripts: true,
                    retainContextWhenHidden: true,
                }
            )

            runApiServe(context)
            panel.iconPath = vscode.Uri.joinPath(
                context.extensionUri,
                'logo.svg'
            )

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
    GET_ZOOM,
    SET_ZOOM,
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
            data: globalStateGet(COOKIE_KEY, context),
        })
    }

    if (command === MsgCommand.SAVE_COOKIE) {
        globalStateSave(COOKIE_KEY, data, context)
    }

    if (command === MsgCommand.GET_ZOOM) {
        return panel.webview.postMessage({
            command: MsgCommand.GET_ZOOM,
            data: globalStateGet(ZOOM_KEY, context),
        })
    }

    if (command === MsgCommand.SET_ZOOM) {
        globalStateSave(ZOOM_KEY, data, context)
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
    apiServe.on('exit', () => {
        panel &&
            vscode.window
                .showWarningMessage(
                    '音乐服务启动异常或端口被占用，是否重新启动服务？',
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
                        vscode.window.showInformationMessage('服务重启中')
                        kill(port!)
                            .then(() => {
                                runApiServe(context)
                                vscode.window.showInformationMessage(
                                    '服务重启成功'
                                )
                            })
                            .catch((error) => {
                                console.warn(error)
                                vscode.window.showInformationMessage(
                                    error.message ?? error
                                )
                            })
                    } else {
                        panel!.dispose()
                    }
                })
    })

    apiServe.on('message', (m) => {
        if (m === 'server started successfully') {
            panel!.webview.html = getHtmlForWebview(context, panel!.webview)
        }
    })
}

function abortApiServe() {
    try {
        controller && controller.abort()
        apiServe = null
        controller = null
    } catch (error) {}
}

function globalStateGet(key: string, context: vscode.ExtensionContext) {
    return context.globalState.get(key)
}

function globalStateSave(
    key: string,
    value: any,
    context: vscode.ExtensionContext
) {
    context.globalState.update(key, value)
}

// This method is called when your extension is deactivated
export function deactivate() {
    abortApiServe()
}
