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

const verify = async() => {
    const response = await fetch(`${baseUrl}/auth/profile`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    })

    return response.ok
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


const save = async(data) => {
    const response = await fetch(`${baseUrl}/workflow/save`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
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

const load = async() => {
    const response = await fetch(`${baseUrl}/workflow/load`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    })

    return response.json()
}


export { login, register, run, verify, save, load }