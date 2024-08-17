'use client'

import { API_ENDPOINT_URL } from '@/constants'
import { signIn, useSession } from 'next-auth/react'
import Link from 'next/link'
import { FormEvent, useEffect, useState } from 'react'
import axios from 'axios'
import { useRouter } from 'next/navigation'

const SignUp = () => {
  const router = useRouter()
  const { data: userSession } = useSession()

  const [errMsg, setErrMsg] = useState<string | null>()

  const [username, setUsername] = useState<string>('')
  const [email, setEmail] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [confirmPassword, setConfirmPassword] = useState<string>('')

  useEffect(() => {
    if (userSession) router.push('/dashboard')
  }, [userSession])

  const handleSignUp = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      setErrMsg('Error: passwords do not match!')

      return
    }

    await axios
      .post(`${API_ENDPOINT_URL}/user`, {
        username,
        email,
        password,
      })
      .then(async (response) => {
        if (response.data.status === 200) {
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
            .catch((error: any) => {
              setErrMsg(`Error: ${error.message}`)
            })
        } else {
          setErrMsg(`${response.data.message}`)
        }
      })
      .catch((error: any) => {
        setErrMsg(`${error.message}`)
      })
  }

  if (userSession) return null

  return (
    <div className="h-screen flex items-center justify-center bg-[#a9a9a9cc]">
      <div className="text-gray-50 text-center">
        <h1 className="text-5xl font-bold mb-4">Sign Up</h1>

        <form onSubmit={handleSignUp} className="flex flex-col items-center ">
          {errMsg && (
            <p className="mb-2 text-lg text-red-500 font-semibold">{errMsg}</p>
          )}

          <input
            id="username"
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="bg-gray-50 text-black font-semibold rounded-lg py-2 px-4 mb-4 w-72 focus:outline-none"
          />

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

          <input
            id="confirmPassword"
            type="password"
            placeholder="Confirm your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="bg-gray-50 text-black font-semibold rounded-lg py-2 px-4 mb-4 w-72 focus:outline-none"
          />

          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-gray-50 font-bold py-2 px-4 rounded-lg w-72 mb-4"
          >
            Sign Up
          </button>

          <Link
            href="/auth/signin"
            className="text-md text-blue-600 hover:text-blue-700"
          >
            Already have an account? Sign In Here!
          </Link>
        </form>
      </div>
    </div>
  )
}

export default SignUp
