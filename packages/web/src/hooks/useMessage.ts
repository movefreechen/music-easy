import type { Message } from '@/types'
import type { WebviewApi } from 'vscode-webview'
import { onMounted, onUnmounted } from 'vue'

// 兼容浏览器调试
if (!window.acquireVsCodeApi || typeof window.acquireVsCodeApi !== 'function') {
    window.acquireVsCodeApi = function <
        StateType = unknown
    >(): WebviewApi<StateType> {
        return {
            postMessage(): void {},
            getState(): StateType | undefined {
                return undefined
            },
            setState<T extends StateType | undefined>(newState: T): T {
                return newState
            },
        }
    }
}

const vscode = acquireVsCodeApi()
const listen = window.addEventListener

export default function useMessage() {
    const callbackMap: Map<Function, string> = new Map()

    function handleEvent(event: MessageEvent<Message>) {
        const msg = event.data
        callbackMap.forEach((_, callback) => {
            callback(msg)
        })
    }

    function on(callback: (msg: Message) => void) {
        callbackMap.set(callback, '')
    }

    function post(msg: Message) {
        vscode.postMessage(msg)
    }

    function remove(callback: (msg: Message) => void) {
        callbackMap.delete(callback)
    }

    onMounted(() => {
        listen('message', handleEvent)
    })

    onUnmounted(() => {
        listen('message', handleEvent)
    })

    return { on, post, remove }
}
