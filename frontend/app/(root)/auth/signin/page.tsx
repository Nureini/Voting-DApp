'use client'

import { signIn, useSession } from 'next-auth/react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FormEvent, useEffect, useState } from 'react'

const SignIn = () => {
  const router = useRouter()
  const { data: userSession } = useSession()

  const [errMsg, setErrMsg] = useState<string | null>()

  const [email, setEmail] = useState<string>('')
  const [password, setPassword] = useState<string>('')

  useEffect(() => {
    if (userSession) router.push('/dashboard')
  }, [userSession])

  const handleSignIn = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    await signIn('credentials', {
      email,
      password,
      redirect: false,
    })
      .then((response) => {
        if (response?.ok) {
          router.push('/dashboard')
        } else {
          setErrMsg('Invalid Email or Password')
        }
      })
      .catch((error: Error) => {
        setErrMsg(`Error: ${error.message}`)
      })
  }

  if (userSession) return router.push('/dashboard')

  return (
    <div className="h-screen flex items-center justify-center bg-[#a9a9a9cc]">
      <div className="text-gray-50 text-center">
        <h1 className="text-5xl font-bold mb-4">Sign In</h1>

        <form onSubmit={handleSignIn} className="flex flex-col items-center">
          {errMsg && (
            <p className="mb-2 text-lg text-red-500 font-semibold">{errMsg}</p>
          )}

          <input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-gray-50 text-black font-semibold rounded-lg py-2 px-4 mb-4 w-72 focus:outline-none"
          />

          <input
            id="password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-gray-50 text-black font-semibold rounded-lg py-2 px-4 mb-4 w-72 focus:outline-none"
          />

          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-gray-50 font-bold py-2 px-4 rounded-lg w-72 mb-4"
          >
            Sign In
          </button>

          <Link
            href="/auth/signup"
            className="text-md text-blue-600 hover:text-blue-700"
          >
            Don't already have an account? Sign Up Here!
          </Link>
        </form>
      </div>
    </div>
  )
}

export default SignIn
