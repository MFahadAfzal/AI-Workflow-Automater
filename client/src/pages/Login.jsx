import { useState } from 'react'
import { login } from '../services/api'
import { useNavigate } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const navigate = useNavigate();

  // Authenticates the user and stores the JWT for subsequent authenticated
  // requests, then redirects into the workflow canvas
  const handleSubmit = async () => {
    try {
        const data = await login({ email, password })
        localStorage.setItem('token', data.token)
        navigate('/canvas'); 
    } catch (error) {
        setErrorMessage('Invalid email or password')
    }
  }

  return (
    <div className="min-h-screen flex items-center">

      {/* Left half: the actual sign-in form */}
      <div className="flex flex-col items-center justify-center bg-white border border-gray-200 rounded-xl p-8 w-1/2 h-screen">
        <h1 className="text-xl font-medium mb-1">Welcome back</h1>
        <p className="text-sm text-gray-500 mb-6">Sign in to your account</p>

        <div className="flex flex-col gap-3 w-1/2">
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
            className="w-full bg-light-cyan-900  text-white py-2 rounded-lg text-sm font-medium hover:bg-light-cyan-800 mt-1"
          >
            Sign in
          </button>
        </div>
        {errorMessage && <p className="text-red-500 text-sm">{errorMessage}</p>}
        <p className="text-xs text-gray-500 text-center mt-5">
          Don't have an account? <a href="/register" className="text-gray-800 underline">Sign up</a>
        </p>
      </div>

      {/* Right half: branding panel. Dot-pattern background gives the solid
          color some texture without competing with the content on top of it */}
      <div className="flex flex-col items-center w-1/2 h-screen bg-light-cyan-900 text-white
                      bg-[radial-gradient(circle,rgba(255,255,255,0.15)_1.5px,transparent_1.5px)] [background-size:24px_24px]" >

        {/* self-start pulls this out of the parent's centering so it can sit
            in the top-left corner while the content below still centers itself */}
        <h1 className="self-start text-2xl font-semibold leading-tight p-5">SYNAPSE</h1>

        {/* flex-1 claims the remaining vertical space so this group can
            center itself within it, independent of the logo above */}
        <div className="flex flex-col flex-1 justify-center items-center w-2/3">
          <h1 className="text-2xl font-semibold leading-tight">Your ideas, wired together</h1>
          <p>Connect prompts, models, and logic into a living workflow. No queues to manage, no steps to babysit — just build the graph and hit run</p>
        </div>

        {/* Small diagram illustrating the actual DAG execution engine:
            a prompt routed through two AI providers to a final output.
            Groq and Mistral borders match their real node colors on the canvas */}
        <p className="text-xs text-white/50 mb-2">One prompt, two models</p>
        <svg width="420" height="100" viewBox="0 0 430 100">
          <defs>
            <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
              <path d="M0,0 L8,4 L0,8 Z" fill="white" fillOpacity="0.6" />
            </marker>
          </defs>

          <rect x="10" y="30" width="80" height="40" rx="8" fill="white" fillOpacity="0.12" stroke="white" strokeOpacity="0.5" strokeWidth="1.5" />
          <text x="50" y="55" textAnchor="middle" fill="white" fontSize="12">Prompt</text>

          <line x1="95" y1="50" x2="130" y2="50" stroke="white" strokeOpacity="0.6" strokeWidth="1.5" markerEnd="url(#arrow)" />

          <rect x="135" y="30" width="80" height="40" rx="8" fill="white" fillOpacity="0.12" stroke="#60a5fa" strokeWidth="1.5" />
          <text x="175" y="55" textAnchor="middle" fill="white" fontSize="12">Groq</text>

          <line x1="220" y1="50" x2="255" y2="50" stroke="white" strokeOpacity="0.6" strokeWidth="1.5" markerEnd="url(#arrow)" />

          <rect x="260" y="30" width="80" height="40" rx="8" fill="white" fillOpacity="0.12" stroke="#fb923c" strokeWidth="1.5" />
          <text x="300" y="55" textAnchor="middle" fill="white" fontSize="12">Mistral</text>

          <line x1="345" y1="50" x2="380" y2="50" stroke="white" strokeOpacity="0.6" strokeWidth="1.5" markerEnd="url(#arrow)" />

          <rect x="385" y="30" width="35" height="40" rx="8" fill="white" fillOpacity="0.12" stroke="white" strokeOpacity="0.5" strokeWidth="1.5" />
          <text x="402" y="55" textAnchor="middle" fill="white" fontSize="10">Out</text>
        </svg>

      </div>

    </div>
  )
}

export default Login