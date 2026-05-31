import { useState } from 'react'
import { register } from '../services/api'
import { useNavigate } from 'react-router-dom';

function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const navigate = useNavigate();


  const handleSubmit = async () => {
        try {
            const data = await register({ email, password })
            navigate('/'); 
        } catch (error) {
            setErrorMessage('Registration Failed')
        }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white border border-gray-200 rounded-xl p-8 w-full max-w-sm">
        <h1 className="text-xl font-medium mb-1">Register</h1>
        <p className="text-sm text-gray-500 mb-6">Create your account</p>

        <div className="flex flex-col gap-3">
          <div>
            <label className="text-xs text-gray-500 block mb-1">Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <button
            onClick={handleSubmit}
            className="w-full bg-blue-500 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-600 mt-1"
          >
            Register
          </button>
        </div>
        {errorMessage && <p className="text-red-500 text-sm">{errorMessage}</p>}
      </div>
    </div>
  )
}

export default Register