import axios from 'axios'

const instance = axios.create({
    baseURL: 'http://127.0.0.1:3000',
    timeout: 100000
})

instance.interceptors.response.use((response) => {
    const { status, data } = response

    if (status === 200) {
        if (data?.code !== 200) {
            throw Error(data?.msg)
        }

        return data
    }

    return response
})

export default instance
