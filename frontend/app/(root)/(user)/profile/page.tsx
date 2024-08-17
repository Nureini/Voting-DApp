"use client"

import { API_ENDPOINT_URL } from "@/constants"
import axios from "axios"
import { signOut, useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { FormEvent, useEffect, useState } from "react"
import { useDisconnect } from "wagmi"

const Profile = () => {
  const router = useRouter()

  const { disconnect: disconnectConnectedWallet } = useDisconnect()

  const { data: userSession, update } = useSession()

  const [errMsg, setErrMsg] = useState<string | null>()

  const [username, setUsername] = useState<string>("")
  const [email, setEmail] = useState<string>("")
  const [password, setPassword] = useState<string>("")
  const [polygonAddress, setPolygonAddress] = useState<string>("")

  useEffect(() => {
    if (!userSession) {
      router.push("/auth/signin")
      return
    }

    const fetchUserDetails = async () => {
      await axios
        .get(`${API_ENDPOINT_URL}/user/${userSession?.user?.id}`)
        .then((response) => {
          if (response.data.user) {
            setEmail(response.data.user?.email)
            setUsername(response.data.user?.username)
            setPolygonAddress(response.data.user?.polygonAddress)
          }
        })
        .catch((error: Error) => {
          setErrMsg(`Error: ${error.message}`)
        })
    }

    fetchUserDetails()
  }, [userSession])

  const updateProfile = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    await axios
      .patch(`${API_ENDPOINT_URL}/user/`, {
        id: userSession?.user?.id,
        username,
        email,
        password,
      })
      .then((response) => {
        if (response.data.status === 200) {
          alert("Updated username!")
          update({
            newName: username,
            newEmail: email,
          })
          router.push("/profile")
        }
      })
      .catch((error: Error) => {
        setErrMsg(`Error: ${error.message}`)
      })
  }

  const handleSignOutBtn = () => {
    disconnectConnectedWallet()
    signOut()
  }

  return (
    <div className="custom-height flex items-center justify-center p-6 sm:p-12 md:p-24">
      <section className="text-gray-50 text-center">
        <h1 className="text-3xl font-bold mb-4">Profile</h1>

        <form onSubmit={updateProfile} className="flex flex-col items-start">
          {errMsg && (
            <p className="mb-2 text-lg text-red-500 font-semibold">{errMsg}</p>
          )}

          <label htmlFor="username" className="font-semibold">
            Username
          </label>
          <input
            id="username"
            type="text"
            placeholder="Update your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="bg-gray-50 text-black font-semibold rounded-lg py-2 px-4 mb-2 w-72 focus:outline-none"
          />

          <label htmlFor="email" className="font-semibold">
            Email
          </label>
          <input
            id="email"
            type="email"
            placeholder="Update your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-gray-50 text-black font-semibold rounded-lg py-2 px-4 mb-2 w-72 focus:outline-none"
          />

          <label htmlFor="password" className="font-semibold">
            Password (Leave blank if not updating)
          </label>
          <input
            id="password"
            type="password"
            placeholder="Change password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-gray-50 text-black font-semibold rounded-lg py-2 px-4 mb-2 w-72 focus:outline-none"
          />

          <label htmlFor="polygonAddress" className="font-semibold">
            Linked Polygon Account
          </label>
          <input
            id="polygonAddress"
            type="text"
            value={polygonAddress}
            onChange={(e) => setPolygonAddress(e.target.value)}
            className="bg-gray-50 text-black font-semibold rounded-lg py-2 px-4 mb-4 w-72 focus:outline-none"
            disabled={true}
            title={polygonAddress}
          />

          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-gray-50 font-bold py-2 px-4 rounded-lg w-72 mb-4"
          >
            Update Profile
          </button>
          <button
            type="button"
            className="bg-red-600 hover:bg-red-700 text-gray-50 font-bold py-2 px-4 rounded-lg w-72"
            onClick={handleSignOutBtn}
          >
            Sign Out
          </button>
        </form>
      </section>
    </div>
  )
}

export default Profile
