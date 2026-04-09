import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setSent(true)
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded shadow w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Reset Password</h2>
        {sent ? <p className="text-green-600 text-center">Check your email for reset instructions.</p> : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input className="w-full border p-2 rounded" type="email" placeholder="Email"
              value={email} onChange={e => setEmail(e.target.value)} required />
            <button className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700" type="submit">Send Reset Link</button>
          </form>
        )}
        <p className="mt-4 text-center text-sm"><Link to="/login" className="text-blue-600">Back to Login</Link></p>
      </div>
    </div>
  )
}
