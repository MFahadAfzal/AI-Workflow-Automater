import Login from './pages/Login'
import Register from './pages/Register'
import Canvas from './pages/Canvas'
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('token')
    if (!token) return <Navigate to="/" />
    return children
}

function App() {

  

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/canvas" element={<ProtectedRoute><Canvas /></ProtectedRoute>} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App