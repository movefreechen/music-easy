import { useNotification } from '@kyvg/vue3-notification'
import type { NotificationsOptions } from '@kyvg/vue3-notification'

export default function useNotify() {
    const { notify } = useNotification()
    return function (options: NotificationsOptions): () => void {
        const id = Date.now()
        notify({
            id,
            ...options,
        })
        return () => notify.close(id)
    }
}
