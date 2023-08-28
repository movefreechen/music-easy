import ConfirmVue from '@/components/Confirm.vue'
import { App, Ref, createApp, getCurrentInstance } from 'vue'
import { createVuetify } from 'vuetify'

const vuetify = createVuetify({
    theme: {
        defaultTheme: 'dark',
    },
})

export default function useConfirm() {
    return Confirm
}

export interface ConfirmOptions {
    title?: string
    content?: string
    container?: HTMLElement
    destroyOnClose?: boolean
}

const Confirm = function (options: string | ConfirmOptions) {
    return new Promise<void>((resolve, reject) => {
        if (typeof options === 'string') {
            options = {
                content: options,
            }
        }

        const id = Symbol()
        const instance = createApp(ConfirmVue, {
            ...options,
            id,
            open: true,
            onConfirm() {
                resolve()
                unmount()
            },
            onCancel() {
                reject()
                unmount()
            },
        })

        instance.use(vuetify)

        let container: HTMLElement
        if (options.container) {
            instance.mount(options.container)
        } else {
            container = document.createElement('div')

            instance.mount(container)
            document.body.appendChild(container)
        }

        function unmount() {
            instance.unmount()
            container && document.body.removeChild(container)
        }
    })
}
