import type { Message } from '@/types'
import type { WebviewApi } from 'vscode-webview'
import { onMounted, onUnmounted } from 'vue'

// 兼容浏览器调试
if (!window.acquireVsCodeApi || typeof window.acquireVsCodeApi !== 'function') {
    window.acquireVsCodeApi = function <
        StateType = unknown
    >(): WebviewApi<StateType> {
        return {
            postMessage(message: unknown): void {},
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

export default function useMessage() {
    const callbackMap: Map<Function, string> = new Map()

    function handleEvent(event: MessageEvent<Message>) {
        const msg = event.data
        callbackMap.forEach((_, callback) => {
            callback(msg)
        })
    }

    function on(callback: Function) {
        callbackMap.set(callback, '')
    }

    function post(msg: Message) {
        vscode.postMessage(msg)
    }

    function remove(callback: Function) {
        callbackMap.delete(callback)
    }

    onMounted(() => {
        window.addEventListener('message', handleEvent)
    })

    onUnmounted(() => {
        window.removeEventListener('message', handleEvent)
    })

    return { on, post, remove }
}
