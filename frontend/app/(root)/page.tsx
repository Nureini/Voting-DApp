"use client"

import { signIn, signOut, useSession } from "next-auth/react"
import Link from "next/link"
import { useRouter } from "next/navigation"

const Home = () => {
  const router = useRouter()

  const { data: userSession } = useSession()

  return (
    <div
      className="h-screen flex items-center justify-center"
      style={{
        backgroundImage: "url(/1.jpg)",
        backgroundBlendMode: "multiply",
        backgroundColor: "rgba(169, 169, 169, 0.8)",
      }}
    >
      <div className="text-gray-50 text-center">
        <h1 className="text-5xl font-bold mb-4">0xDemocracy</h1>
        <p className="text-lg mb-6">
          The Trusted Platform for Secure Elections
        </p>

        <div className="flex justify-center">
          {userSession ? (
            <>
              <Link
                href="/dashboard"
                className="bg-blue-600 hover:bg-blue-700 text-gray-50 font-bold py-2 px-4 rounded-lg mr-4"
              >
                Dashboard
              </Link>
              <button
                className="bg-red-600 hover:bg-red-700 text-gray-50 font-bold py-2 px-4 rounded-lg"
                onClick={() => signOut()}
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/dashboard"
                className="bg-blue-600 hover:bg-blue-700 text-gray-50 font-bold py-2 px-4 rounded-lg mr-4"
              >
                Dashboard
              </Link>
              <button
                className="bg-blue-600 hover:bg-blue-700 text-gray-50 font-bold py-2 px-4 rounded-lg mr-4"
                onClick={() => router.push("/auth/signup")}
              >
                Sign Up
              </button>
              <button
                className="bg-gray-50 hover:bg-gray-200 text-blue-600 font-bold py-2 px-4 rounded-lg"
                onClick={() => signIn()}
              >
                Sign In
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default Home
