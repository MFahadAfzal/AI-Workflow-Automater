const baseUrl = import.meta.env.VITE_API_URL

const login = async(data) => {
    const response = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    if (!response.ok) {
        const error = new Error('Request failed')
        error.status = response.status
        throw error
    }
    return response.json()
}

const register = async(data) => {
    const response = await fetch(`${baseUrl}/auth/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })

    if (!response.ok) {
        const error = new Error('Request failed')
        error.status = response.status
        throw error
    }
    return response.json()
}

const run = async(data) => {
    const response = await fetch(`${baseUrl}/workflow/run`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })

    if (!response.ok) {
        const error = new Error('Request failed')
        error.status = response.status
        throw error
    }
    return response.json()
}

export { login, register, run }